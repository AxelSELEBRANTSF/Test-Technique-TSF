import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const backend = process.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api/, ''),
      },
    },
  },
})
