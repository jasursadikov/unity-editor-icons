// Generates website/public/icons.json from the repository's README.md
// (the canonical ordering manifest) and the meta/ description files.
//
// Each icon entry contains its name, native size, file id and the relative
// paths to its PNG and Markdown description. Run automatically before
// `vite dev` / `vite build` via the npm scripts.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const readmePath = path.join(repoRoot, "README.md");
const outDir = path.join(here, "..", "public");
const outFile = path.join(outDir, "icons.json");

const CELL_RE =
  /\[<img src="(img\/[^"]+?)" width=\d+ height=\d+ title="([^"]*)">\]\((meta\/[^)]+?\.md)\)/g;
const SIZE_RE = /`(\d+)x(\d+)`/;
const FILE_ID_RE = /^-?\d{5,}$/;

function readMeta(metaEncoded) {
  const rel = decodeURIComponent(metaEncoded);
  const file = path.join(repoRoot, rel);
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return { width: 0, height: 0, fileId: "" };
  }
  const lines = text.split("\n");
  const sizeMatch = lines[0].match(SIZE_RE);
  const width = sizeMatch ? Number(sizeMatch[1]) : 0;
  const height = sizeMatch ? Number(sizeMatch[2]) : 0;
  // The file id is the last numeric-only fenced line in the description.
  let fileId = "";
  for (const line of lines) {
    const t = line.trim();
    if (FILE_ID_RE.test(t)) fileId = t;
  }
  return { width, height, fileId };
}

function main() {
  const readme = fs.readFileSync(readmePath, "utf8");
  const version = (readme.match(/Unity version \*\*(.+?)\*\*/) || [])[1] || "unknown";

  const icons = [];
  for (const m of readme.matchAll(CELL_RE)) {
    const [, img, title, meta] = m;
    const { width, height, fileId } = readMeta(meta);
    icons.push({
      name: title,
      width,
      height,
      size: width && height ? `${width}x${height}` : "",
      fileId,
      img,
      meta,
      dark: title.startsWith("d_"),
    });
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ version, icons }, null, 0));
  console.log(
    `gen-data: wrote ${icons.length} icons (Unity ${version}) -> ${path.relative(
      repoRoot,
      outFile
    )}`
  );
}

main();
