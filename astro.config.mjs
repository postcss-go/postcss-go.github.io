import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const sourceMapJs = fileURLToPath(
  new URL('./node_modules/source-map-js/source-map.js', import.meta.url),
);

export default defineConfig({
  output: 'static',
  site: 'https://postcss-go.github.io',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        {
          find: /^source-map-js$/,
          replacement: sourceMapJs,
        },
      ],
    },
    worker: {
      format: 'es',
    },
    assetsInclude: ['**/*.wasm'],
    optimizeDeps: {
      include: ['source-map-js', 'postcss', 'autoprefixer', 'postcss-nested'],
      needsInterop: ['source-map-js'],
      exclude: ['@postcss-go/core'],
    },
    build: {
      // Keep the classic WASM worker as a file. A data: URL cannot importScripts wasm_exec.js.
      assetsInlineLimit: 0,
    },
  },
});
