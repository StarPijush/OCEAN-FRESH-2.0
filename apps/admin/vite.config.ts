import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  envDir: '../../',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3001,
    strictPort: true,
    open: true,
  },
});
