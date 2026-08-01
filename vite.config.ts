import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { VitePluginRadar } from "vite-plugin-radar";

// https://vitejs.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => ({
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && !isSsrBuild &&
    componentTagger(),
    !isSsrBuild && ViteImageOptimizer(),
    !isSsrBuild && VitePluginRadar({
      analytics: {
        id: 'G-Z4Z237WBGY',
      }
    })
  ].filter(Boolean),
  build: {
    copyPublicDir: !isSsrBuild,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
}));
