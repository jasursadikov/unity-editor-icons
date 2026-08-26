"""Shared helpers for generating the Unity Editor Icons documentation.

The Unity `IconsMiner.cs` editor script is responsible only for mining the
icons into the `img/` (PNG) and `meta/` (Markdown description) directories.
The visual documents (`README.md`, `LIST.md`) are rendered from those folders
by the Python scripts in this directory.

Source of truth
---------------
* The **set** of icons is every `*.md` under `meta/` (tracked or freshly
  mined / untracked).
* The **order** is the mining order produced by Unity, which cannot be
  reconstructed from a directory listing. `README.md` is therefore treated as
  the ordering manifest: icons already present in it keep their exact position,
  icons that disappeared from `meta/` are dropped, and newly mined icons are
  appended (sorted case-insensitively). This preserves existing ordering while
  still surfacing every mined icon.
"""

from __future__ import annotations

import os
import re
import subprocess
from dataclasses import dataclass
from urllib.parse import quote, unquote

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
META_DIR = "meta"
IMG_DIR = "img"
README = "README.md"
PROJECT_VERSION = os.path.join("ProjectSettings", "ProjectVersion.txt")

# Native display cap used by IconsMiner.cs (icons never render larger).
MAX_DISPLAY = 48

_CELL_RE = re.compile(
    r'\[<img src="(?P<src>img/[^"]+?)" '
    r'width=(?P<w>\d+) height=(?P<h>\d+) '
    r'title="(?P<title>[^"]*)">\]'
    r'\((?P<meta>meta/[^)]+?\.md)\)'
)
_SIZE_RE = re.compile(r"`(\d+)x(\d+)`")
_VERSION_RE = re.compile(r"Unity version \*\*(.+?)\*\*")
_PROJECT_VERSION_RE = re.compile(r"m_EditorVersion:\s*(\S+)")


def _enc(path: str) -> str:
    """Encode a path the way IconsMiner.cs does (spaces only)."""
    return path.replace(" ", "%20")


def _read_native_size(meta_encoded: str) -> tuple[int, int]:
    """Parse native `WxH` from an icon's meta file header."""
    path = os.path.join(REPO_ROOT, unquote(meta_encoded))
    try:
        with open(path, encoding="utf-8") as handle:
            first_line = handle.readline()
    except OSError:
        return (0, 0)
    match = _SIZE_RE.search(first_line)
    if not match:
        return (0, 0)
    return (int(match.group(1)), int(match.group(2)))


@dataclass
class Cell:
    src: str        # e.g. "img/Asset%20Store.png" (space-encoded, as in README)
    width: int      # display width (capped at MAX_DISPLAY)
    height: int     # display height (capped at MAX_DISPLAY)
    title: str      # icon name, literal spaces e.g. "Asset Store"
    meta: str       # e.g. "meta/Asset%20Store.md" (space-encoded)

    @classmethod
    def from_name(cls, name: str) -> "Cell":
        """Build a cell for a newly mined icon given its (literal) name."""
        meta = f"{META_DIR}/{_enc(name)}.md"
        nw, nh = _read_native_size(meta)
        if nw == 0 or nh == 0:
            nw = nh = MAX_DISPLAY  # sensible fallback if header is unreadable
        return cls(
            src=f"{IMG_DIR}/{_enc(name)}.png",
            width=min(nw, MAX_DISPLAY),
            height=min(nh, MAX_DISPLAY),
            title=name,
            meta=meta,
        )

    @property
    def markdown(self) -> str:
        """The exact grid-cell markdown used in README.md."""
        return (
            f'[<img src="{self.src}" width={self.width} height={self.height} '
            f'title="{self.title}">]({self.meta})'
        )

    @property
    def native_size(self) -> str:
        """Native `WxH` string read from the icon's meta file (may be empty)."""
        nw, nh = _read_native_size(self.meta)
        return f"{nw}x{nh}" if nw and nh else ""


def _readme_cells() -> list[Cell]:
    """Parse README.md and return its icon cells in order (duplicates kept)."""
    path = os.path.join(REPO_ROOT, README)
    try:
        with open(path, encoding="utf-8") as handle:
            content = handle.read()
    except OSError:
        return []
    return [
        Cell(
            src=m.group("src"),
            width=int(m.group("w")),
            height=int(m.group("h")),
            title=m.group("title"),
            meta=m.group("meta"),
        )
        for m in _CELL_RE.finditer(content)
    ]


def _all_meta_names() -> set[str]:
    """Every icon name (literal, no extension) present under meta/.

    Includes tracked and freshly mined (untracked) files, discovered through
    git so that case-only duplicates survive on case-insensitive file systems.
    Falls back to a directory scan when git is unavailable.
    """
    names: set[str] = set()
    got_git = False
    for args in (
        ["git", "ls-files", "--", META_DIR],
        ["git", "ls-files", "--others", "--exclude-standard", "--", META_DIR],
    ):
        try:
            out = subprocess.check_output(
                args, cwd=REPO_ROOT, text=True, stderr=subprocess.DEVNULL
            )
            got_git = True
        except (OSError, subprocess.CalledProcessError):
            continue
        for line in out.splitlines():
            line = line.strip()
            if line.endswith(".md"):
                names.add(os.path.basename(line)[: -len(".md")])

    if not got_git:
        meta_dir = os.path.join(REPO_ROOT, META_DIR)
        for f in os.listdir(meta_dir):
            if f.endswith(".md"):
                names.add(f[: -len(".md")])
    return names


def resolve_icons() -> list[Cell]:
    """Return icons in README order, with removed ones dropped and newly mined
    ones appended (sorted case-insensitively)."""
    on_disk = _all_meta_names()                      # literal names
    on_disk_meta = {f"{META_DIR}/{_enc(n)}.md" for n in on_disk}

    ordered: list[Cell] = []
    referenced: set[str] = set()
    for cell in _readme_cells():
        if cell.meta in on_disk_meta:                # still exists -> keep
            ordered.append(cell)
            referenced.add(cell.meta)

    referenced_names = {unquote(m)[len(META_DIR) + 1 : -3] for m in referenced}
    new_names = sorted(on_disk - referenced_names, key=lambda n: (n.lower(), n))
    ordered.extend(Cell.from_name(n) for n in new_names)
    return ordered


def get_unity_version(explicit: str | None = None) -> str:
    """Resolve the Unity version.

    Priority: explicit arg > ProjectSettings/ProjectVersion.txt > README.md.
    """
    if explicit:
        return explicit

    proj = os.path.join(REPO_ROOT, PROJECT_VERSION)
    try:
        with open(proj, encoding="utf-8") as handle:
            match = _PROJECT_VERSION_RE.search(handle.read())
        if match:
            return match.group(1)
    except OSError:
        pass

    readme = os.path.join(REPO_ROOT, README)
    try:
        with open(readme, encoding="utf-8") as handle:
            match = _VERSION_RE.search(handle.read())
        if match:
            return match.group(1)
    except OSError:
        pass
    return "unknown"
