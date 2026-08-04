import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // এটি ফোন বা অন্য ডিভাইস থেকে এক্সেস করার অনুমতি দেবে
    port: 5173
  },
})