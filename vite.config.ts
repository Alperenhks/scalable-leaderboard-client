import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const UPSTREAM = 'https://scalable-leaderboard-engine.onrender.com';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
  server: {
    proxy: {
      // Backend `Access-Control-Allow-Origin` göndermiyor, tarayıcı doğrudan
      // istekleri bloklar. Geliştirmede kendi origin'imizden geçiriyoruz;
      // üretimde VITE_API_BASE ile gerçek adres verilir.
      '/api': { target: UPSTREAM, changeOrigin: true, secure: true },
    },
  },
});
