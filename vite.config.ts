import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Money's Outlet",
        short_name: "Money's Outlet",
        description: "Where Style Meets Value",
        theme_color: "#E10600",
        background_color: "#0F0F0F",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        icons: [
          {
            src: "logos/logo.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "logos/logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        categories: ["e-commerce", "shopping", "outlet", "sneakers", "apparel"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
