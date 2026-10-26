import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_TARGET = 'https://book-leaf-2x6o.onrender.com';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
      },
      '/uploads': {
        target: BACKEND_TARGET,
        changeOrigin: true,
      },
      '/socket.io': {
        target: BACKEND_TARGET,
        ws: true,
      },
    },
  },
});
