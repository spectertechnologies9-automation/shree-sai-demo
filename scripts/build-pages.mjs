// Builds the static site and places it at the repo root, which is what
// GitHub Pages publishes for this repository (branch: main, folder: /).
// Usage: npm run build:pages, then commit and push.
import { execSync } from "node:child_process";
import fs from "node:fs";

const repo = "/shree-sai-demo";
execSync("npx next build", {
  stdio: "inherit",
  env: { ...process.env, PAGES: "1", NEXT_PUBLIC_BASE_PATH: repo, NEXT_PUBLIC_ASSET_BASE: `${repo}/public` },
});
fs.rmSync("_next", { recursive: true, force: true });
fs.cpSync("out/_next", "_next", { recursive: true });
for (const f of ["index.html", "404.html"]) fs.copyFileSync(`out/${f}`, f);
fs.writeFileSync(".nojekyll", "");
console.log("Pages build copied to repo root.");
