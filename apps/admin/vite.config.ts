import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';

export default defineConfig({
  envDir: '../../',
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss({ config: '../../tailwind.config.ts' }), autoprefixer()],
    },
  },
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
