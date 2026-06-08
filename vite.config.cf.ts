import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

/**
 * Cloudflare Pages build config.
 *
 * Used by:
 *   npm run dev    – local dev server (with Vite proxy to the Worker)
 *   npm run build  – production build for Cloudflare Pages
 *   npm run serve  – preview the production build locally
 *   npm run deploy – build + deploy via Wrangler
 *
 * Environment variables are read from .env.local (git-ignored) in development
 * and from the Cloudflare Pages dashboard in production.
 * See .env.example for the full list of supported variables.
 */
export default defineConfig(({ command }) => ({
  base: "/",

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },

  root: path.resolve(import.meta.dirname),

  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Produce a sourcemap for production so errors are traceable.
    sourcemap: true,
  },

  /**
   * Dev-server proxy — mirrors the _redirects rules so local dev and
   * production behave identically without needing VITE_API_BASE_URL set.
   *
   * Only active during `vite dev` (command === 'serve').
   */
  server:
    command === "serve"
      ? undefined
      : {
          host: "0.0.0.0",
          proxy: {
            "/gateway": {
              target:
                process.env.VITE_WORKER_ORIGIN ??
                "https://zamproject-api.zamdonations.workers.dev",
              changeOrigin: true,
              secure: true,
            },
            "/health": {
              target:
                process.env.VITE_WORKER_ORIGIN ??
                "https://zamproject-api.zamdonations.workers.dev",
              changeOrigin: true,
              secure: true,
            },
          },
        },
}));
