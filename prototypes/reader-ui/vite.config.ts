import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  build: { rollupOptions: { input: { main: fileURLToPath(new URL('./index.html', import.meta.url)), userCenter: fileURLToPath(new URL('./user-center.html', import.meta.url)) } } },
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
