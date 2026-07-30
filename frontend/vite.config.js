/**
 * ============================================================================
 * Vite Config — כלי בנייה + Dev Server + Proxy
 * ============================================================================
 * שאלת מבחן: למה Proxy?
 * הדפדפן רואה בקשות ל-/api על אותו origin (localhost:5173),
 * ו-Vite מעביר אותן ל-backend ב-5000.
 * כך נמנעים מבעיות CORS בפיתוח, וה-frontend קורא ל-/api בלי לכתוב :5000.
 *
 * changeOrigin: true → משנה את Header ה-Host ליעד (חשוב לשרתים מסוימים)
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
});
