/**
 * Where static assets (frames, stills, video) are served from.
 * "" locally. On GitHub Pages the repo root is published as-is, so assets are
 * read straight from the committed public/ folder instead of being duplicated.
 */
export const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? process.env.NEXT_PUBLIC_BASE_PATH ?? "";
