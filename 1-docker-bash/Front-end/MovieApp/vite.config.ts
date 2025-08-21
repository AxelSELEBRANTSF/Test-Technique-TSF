/// <reference types="node" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En Docker, le service backend s'appelle "backend".
const backendTarget = process.env.BACKEND_TARGET || "http://backend:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': 'http://localhost:8000',
    }
  },
  preview: { port: 5173, strictPort: true }
});
