import { defineConfig } from 'vite';

export default defineConfig({
  build: { outDir: 'dist/app', target: 'es2022', sourcemap: false },
  server: { port: 1420, strictPort: true }
});
