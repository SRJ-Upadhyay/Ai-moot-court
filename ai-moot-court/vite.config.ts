import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // forward /webhook to your n8n for dev. set VITE_N8N_URL to e.g. https://your-n8n
      "/webhook": {
        target: process.env.VITE_N8N_PROXY_TARGET || "https://your-n8n.example.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/webhook/, "/webhook"),
      },
    },
  },
});
