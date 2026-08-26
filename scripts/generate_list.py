#!/usr/bin/env python3
"""Generate LIST.md (single-column list view) from the img/ and meta/ folders.

Usage:
    python scripts/generate_list.py [--unity-version 6000.4.0a2]

The icons themselves are produced by the Unity `IconsMiner.cs` editor script;
this script only renders the Markdown document. The list view exists because
the grid README.md is too long for GitHub to render in full. Rows follow the
same order as README.md (the canonical ordering manifest).
"""

from __future__ import annotations

import argparse
import os

import icons_common as ic


def build_list(version: str, cells: list[ic.Cell]) -> str:
    lines: list[str] = []
    lines.append("# Unity Editor Built-in Icons — List View")
    lines.append("")
    lines.append(f"Unity version **{version}**")
    lines.append("")
    lines.append("Load icons using `EditorGUIUtility.IconContent(<ICON NAME>);`")
    lines.append("")
    lines.append(
        "All icons are clickable, you will be forwarded to description file. "
        "For the grid view, see [README.md](README.md)."
    )
    lines.append("")
    lines.append("| Icon | Size | Name |")
    lines.append("| --- | --- | --- |")

    for cell in cells:
        size = cell.native_size
        size_cell = f"`{size}`" if size else ""
        lines.append(
            f'| <img src="{cell.src}" width={cell.width} height={cell.height}> '
            f'| {size_cell} | [`{cell.title}`]({cell.meta}) |'
        )

    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate LIST.md list view.")
    parser.add_argument(
        "--unity-version",
        help="Unity version string (defaults to the value in the current README.md).",
    )
    args = parser.parse_args()

    version = ic.get_unity_version(args.unity_version)
    cells = ic.resolve_icons()
    content = build_list(version, cells)

    output_path = os.path.join(ic.REPO_ROOT, "LIST.md")
    with open(output_path, "w", encoding="utf-8") as handle:
        handle.write(content)

    print(f"Wrote LIST.md with {len(cells)} icons (Unity {version}).")


if __name__ == "__main__":
    main()
