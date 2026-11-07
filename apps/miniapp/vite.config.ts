import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    // временная HTTPS-ссылка для Telegram: cloudflared tunnel --url http://localhost:5173
    allowedHosts: [".trycloudflare.com"],
  },
});
