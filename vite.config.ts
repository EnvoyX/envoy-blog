import { fileURLToPath, URL } from "url";

import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
// import netlify from '@netlify/vite-plugin-tanstack-start'

const config = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    // Outputs build to dist/client
    // netlify(),
    // Disabled nitro if using netlify to deploy
    // Outputs build to .output (using it on Vercel runs fine)
    nitro(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    contentCollections(),
  ],
});

export default config;
