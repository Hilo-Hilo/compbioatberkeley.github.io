import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import { cp } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { activeNotices, validateNotices } from "./src/data/siteNotices.js";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { VitePluginRadar } from "vite-plugin-radar";

// Copy release assets without publishing the local legacy officer cache.
function publicReleaseAssets(): Plugin {
  let config: ResolvedConfig;
  return {
    name: "public-release-assets",
    apply: "build",
    configResolved(resolved) {
      config = resolved;
    },
    async writeBundle() {
      if (!config.publicDir || config.build.ssr) return;
      const cacheDirectory = path.join(config.publicDir, "fetched");
      await cp(config.publicDir, path.resolve(config.root, config.build.outDir), {
        recursive: true,
        filter: (source) => source !== cacheDirectory,
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => ({
  define: {
    __SITE_NOTICES__: JSON.stringify(process.env.SITE_NOTICES_JSON
      ? validateNotices(JSON.parse(process.env.SITE_NOTICES_JSON))
      : activeNotices(JSON.parse(readFileSync(new URL("./src/data/notices.json", import.meta.url), "utf8")))),
  },
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    publicReleaseAssets(),
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
    copyPublicDir: false,
    // Preserve the browser targets used before the Vite 7 upgrade.
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
}));
