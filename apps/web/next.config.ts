import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Статическая сборка: `npm run build:web` кладёт готовый сайт в apps/web/out/
  // (открывается через OpenServer, Vercel или любой хостинг).
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    // Корень монорепо — там лежит общий node_modules (npm workspaces).
    root: path.join(__dirname, "../.."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
