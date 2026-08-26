import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const imgDir = path.join(repoRoot, "img");

// GitHub Pages serves this project at https://<user>.github.io/<repo>/.
const BASE = "/unity-editor-icons/";

// In `vite dev` the icons live in ../img (outside the web root). This tiny
// middleware serves them so the site works locally without copying 3k+ files.
// In CI the workflow copies ../img into dist/img before deploying.
function serveIcons() {
  return {
    name: "serve-icons-dev",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = decodeURIComponent((req.url || "").split("?")[0]);
        const marker = "/img/";
        const idx = url.indexOf(marker);
        if (idx === -1) return next();
        const rel = url.slice(idx + marker.length);
        const file = path.join(imgDir, rel);
        if (!file.startsWith(imgDir) || !fs.existsSync(file)) return next();
        res.setHeader("Content-Type", "image/png");
        fs.createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [react(), serveIcons()],
});
