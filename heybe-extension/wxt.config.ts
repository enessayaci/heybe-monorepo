import { defineConfig } from "wxt";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  publicDir: resolve(__dirname, "./public"),
  srcDir: resolve(__dirname, "./src"),
  entrypointsDir: "./entrypoints",
  modules: ["@wxt-dev/module-react"],
  manifest: ({ manifestVersion }) => ({
    default_locale: "en",
    name: "__MSG_extensionName__",
    description: "__MSG_extensionDescription__",
    version: "1.0.0",
    permissions: ["storage", "tabs", "scripting"],
    host_permissions: [
      "http://localhost:5173/*",
      "http://localhost:3000/*",
      "https://heybe-monorepo.onrender.com/*",
      "https://my-heybe.vercel.app/*",
      "https://*/*",
      "http://*/*",
    ],
  }),
  vite: () => ({
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@assets": resolve(__dirname, "./assets"),
        "@public": resolve(__dirname, "./public"),
      },
    },
  }),
});
