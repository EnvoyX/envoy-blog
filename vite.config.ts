import { defineConfig } from "vite-plus";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
// import netlify from '@netlify/vite-plugin-tanstack-start'

const config = defineConfig({
  staged: {
    "*": "vp check --fix"
  },
  lint: {"options":{"typeAware":true,"typeCheck":true}},
  fmt:{
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,

    // Style Preferences
    singleQuote: true,
    trailingComma: 'all',
    semi: true,
    bracketSpacing: true,

    // Built-in Productivity Features
    sortImports: true,
    sortPackageJson: true,

    // Tailwind CSS Native Support
    tailwindAttributes: ['className', 'class', 'containerClassName'],
    tailwindFunctions: ['clsx', 'twMerge', 'cn'],

    // JSDoc Formatting
    jsdoc: {
      commentLineStrategy: 'singleLine',
      addDefaultToDescription: true,
      verticalAlignment: true,
    },
  },
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
