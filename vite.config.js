import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "index.js",
        assetFileNames: "index.css",
      },
    },
    outDir: ".", // build çıktısı kök dizine gelsin
    emptyOutDir: false,
  },
});
