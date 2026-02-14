import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { copyFileSync, mkdirSync, existsSync, readdirSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/insight-suite/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    // Copy manifest.json and icons to dist after build
    {
      name: "copy-extension-files",
      closeBundle() {
        const outDir = path.resolve(__dirname, "dist");

        // Create mirrored directory for Extension compatibility with absolute subpath
        const mirrorDir = path.resolve(outDir, "insight-suite");
        if (!existsSync(mirrorDir)) {
          mkdirSync(mirrorDir, { recursive: true });
        }

        // Copy assets to mirrored directory
        const assetsSrc = path.resolve(outDir, "assets");
        const assetsDest = path.resolve(mirrorDir, "assets");
        if (existsSync(assetsSrc)) {
          if (!existsSync(assetsDest)) {
            mkdirSync(assetsDest, { recursive: true });
          }
          const files = readdirSync(assetsSrc);
          for (const file of files) {
            copyFileSync(path.resolve(assetsSrc, file), path.resolve(assetsDest, file));
          }
        }

        // Copy manifest.json
        const manifestSrc = path.resolve(__dirname, "manifest.json");
        if (existsSync(manifestSrc)) {
          copyFileSync(manifestSrc, path.resolve(outDir, "manifest.json"));
        }

        // Copy icons
        const iconsDir = path.resolve(outDir, "icons");
        if (!existsSync(iconsDir)) {
          mkdirSync(iconsDir, { recursive: true });
        }
        const iconSrcDir = path.resolve(__dirname, "public", "icons");
        if (existsSync(iconSrcDir)) {
          for (const size of ["icon-16.png", "icon-48.png", "icon-128.png"]) {
            const src = path.resolve(iconSrcDir, size);
            if (existsSync(src)) {
              copyFileSync(src, path.resolve(iconsDir, size));
            }
          }
        }
      },
    },
  ].filter(Boolean),
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        background: path.resolve(__dirname, "src/extension/background.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Background script needs to be at the root as "background.js"
          if (chunkInfo.name === "background") return "background.js";
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
