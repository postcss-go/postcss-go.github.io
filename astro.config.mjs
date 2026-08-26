import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://postcss-go.github.io',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
    worker: {
      format: 'es',
    },
    assetsInclude: ['**/*.wasm'],
    optimizeDeps: {
      exclude: ['@postcss-go/core'],
    },
    build: {
      // Keep the classic WASM worker as a file. A data: URL cannot importScripts wasm_exec.js.
      assetsInlineLimit: 0,
    },
  },
});
