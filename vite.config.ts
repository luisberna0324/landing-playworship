import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020'
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/downloads/latest.json': {
        target: 'https://storage.googleapis.com',
        changeOrigin: true,
        rewrite: () => '/adoracion-studio-installers-20260516-28602/installers/latest.json',
      },
    },
  }
});
