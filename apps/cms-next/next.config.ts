import path from "path";
import { fileURLToPath } from "url";

import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);
import { redirects } from "./redirects";

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || "http://localhost:3000";

const nextConfig: NextConfig = {
  // Temporarily required on Windows until Next.js fixes Turbopack Sass resolution.
  // See: https://github.com/vercel/next.js/issues/86431
  sassOptions: {
    loadPaths: ["./node_modules/@payloadcms/ui/dist/scss/"],
  },
  images: {
    localPatterns: [
      {
        pathname: "/api/media/file/**",
      },
    ],
    qualities: [100],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item);

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(":", "") as "http" | "https",
        };
      }),
      {
        hostname: "*", // Matches any domain / host
        pathname: "/**", // Matches any sub-path depth
        protocol: "https", // (Optional) omit or keep to enforce HTTPS
      },
      {
        hostname: "*",
        pathname: "/**",
        protocol: "http",
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    return webpackConfig;
  },
  reactStrictMode: true,
  redirects,
  turbopack: {
    // point root to the monorepo root (two directories up from apps/cms)
    root: path.resolve(dirname, "../../"),
  },
  experimental: {
    useTypeScriptCli: true,
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
