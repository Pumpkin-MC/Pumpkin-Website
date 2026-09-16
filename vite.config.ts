import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { routes } from "./src/routes.ts";
import { renderHead } from "./src/head.ts";

const root = import.meta.dirname;

function pageHead(): Plugin {
  let isBuild = false;
  return {
    name: "pumpkin-page-head",
    configResolved(config) {
      isBuild = config.command === "build";
    },
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const file = ctx.path.replace(/^\//, "").replace(/(^|\/)$/, "$1index.html");
        const route = routes.find((r) => r.html === file);
        if (!route) {
          throw new Error(`No route is registered for ${ctx.path}`);
        }
        return html.replace("<!--app-head-->", renderHead(route, isBuild));
      },
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss(), pageHead()],
  build:
    isSsrBuild === true
      ? { copyPublicDir: false }
      : {
          rolldownOptions: {
            input: Object.fromEntries(routes.map((r) => [r.id, resolve(root, r.html)])),
          },
        },
}));
