import { defineConfig } from 'vite';

export default defineConfig({
  base: '/mangak_farm/',
  root: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  }
});
