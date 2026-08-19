import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://postcss-go.github.io',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
  },
});
