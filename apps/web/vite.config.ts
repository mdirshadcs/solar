import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In local dev the API runs on :3000; in Docker, nginx proxies /api instead.
    proxy: { '/api': 'http://localhost:3000' },
  },
});
