import { fileURLToPath, URL } from 'url';

// import contentCollections from "@content-collections/vite";
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
// import netlify from '@netlify/vite-plugin-tanstack-start'

const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    tsconfigPaths: true,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: false,
      },
    },
  },
  ssr: {
    noExternal: [
      '@portabletext/react',
      '@uiw/react-md-editor',
      '@uiw/react-markdown-preview',
      'next-themes',
    ],
  },
  plugins: [
    // contentCollections(),
    // Outputs build to dist/client
    // netlify(),
    // Disabled nitro if using netlify to deploy
    // Outputs build to .output (using it on Vercel runs fine)
    devtools(),
    nitro(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
