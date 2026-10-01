import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' để bản build chạy được ở mọi nơi (Vercel, GitHub Pages, mở thư mục dist).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
