import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const longCache = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const pages = process.env.PAGES === "1";

const nextConfig = {
  ...(pages ? { output: "export", basePath, trailingSlash: true, images: { unoptimized: true } } : {}),
  reactStrictMode: true,
  outputFileTracingRoot: root,
  ...(pages ? {} : { async headers() {
    return [
      { source: "/seq/:path*", headers: longCache },
      { source: "/img/:path*", headers: longCache },
      { source: "/video/:path*", headers: longCache },
    ];
  } }),
};

export default nextConfig;
