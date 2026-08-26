#!/usr/bin/env python3
"""Generate README.md (10-column grid view) from the img/ and meta/ folders.

Usage:
    python scripts/generate_readme.py [--unity-version 6000.4.0a2]

The icons themselves are produced by the Unity `IconsMiner.cs` editor script;
this script only renders the Markdown document. README.md doubles as the
canonical ordering manifest (see icons_common.py), so regeneration preserves
the original mining order and icon count exactly.
"""

from __future__ import annotations

import argparse
import os

import icons_common as ic

COLUMNS = 10
FOOTER = "*Original script author [@halak](https://github.com/halak)*"


def build_header(version: str) -> str:
    return (
        "# Unity Editor Built-in Icons\n"
        f"Unity version **{version}**\n"
        "\n"
        "Load icons using `EditorGUIUtility.IconContent(<ICON NAME>);`\n"
        "\n"
        "### File ID\n"
        "You can change script icon by file id\n"
        "1. Open meta file (ex. `*.cs.meta`) in Text Editor\n"
        "2. Modify the line `icon: {instanceID: 0}` to "
        "`icon: {fileID: <FILE ID>, guid: 0000000000000000d000000000000000, type: 0}`\n"
        "3. Save and focus Unity Editor\n"
        "\n"
        "All icons are clickable, you will be forwarded to description file.\n"
        "\n"
        "> Prefer a single-column list with names and sizes? "
        "See **[LIST.md](LIST.md)**.\n"
        "\n"
    )


def build_readme(version: str, cells: list[ic.Cell]) -> str:
    out = build_header(version)

    # Table header + separator.
    out += "".join(f"| {i + 1} " for i in range(COLUMNS)) + "|\n"
    out += "".join("| --- " for _ in range(COLUMNS)) + "|\n"

    # Icon cells, mirroring IconsMiner.cs exactly: each cell is "| <cell> ",
    # a full row of COLUMNS is closed with "|\n"; a trailing partial row is
    # left open (no closing pipe / newline) before the footer is appended.
    n = 0
    for cell in cells:
        out += f"| {cell.markdown} "
        if n >= COLUMNS - 1:
            out += "|\n"
            n = 0
        else:
            n += 1

    out += f"\n\n\n{FOOTER}\n"
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate README.md grid view.")
    parser.add_argument(
        "--unity-version",
        help="Unity version string (defaults to the value in the current README.md).",
    )
    args = parser.parse_args()

    version = ic.get_unity_version(args.unity_version)
    cells = ic.resolve_icons()
    content = build_readme(version, cells)

    output_path = os.path.join(ic.REPO_ROOT, "README.md")
    with open(output_path, "w", encoding="utf-8") as handle:
        handle.write(content)

    print(f"Wrote README.md with {len(cells)} icons (Unity {version}).")


if __name__ == "__main__":
    main()
