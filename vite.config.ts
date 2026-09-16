import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { routes } from "./src/routes.ts";
import { renderHead } from "./src/head.ts";
import { createHighlighter } from "shiki";
import { snippets } from "./src/pages/developers/snippets.ts";
import { snippetLanguages, type SnippetName } from "./src/pages/developers/snippet-languages.ts";
import { CODE_FOREGROUND, pumpkinCodeTheme } from "./src/pages/developers/code-theme.ts";

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

const SNIPPET_TOKENS_ID = "virtual:snippet-tokens";

type Token = [content: string, color?: string];

function mergeTokens(line: { content: string; color?: string }[]): Token[] {
  const merged: Token[] = [];
  for (const { content, color } of line) {
    const tint = color && color.toLowerCase() !== CODE_FOREGROUND ? color : undefined;
    const last = merged.at(-1);
    if (last && last[1] === tint) {
      last[0] += content;
    } else {
      merged.push(tint ? [content, tint] : [content]);
    }
  }
  return merged;
}

function snippetTokens(): Plugin {
  const resolvedId = `\0${SNIPPET_TOKENS_ID}`;
  return {
    name: "pumpkin-snippet-tokens",
    resolveId(id) {
      return id === SNIPPET_TOKENS_ID ? resolvedId : undefined;
    },
    async load(id) {
      if (id !== resolvedId) return undefined;
      const langs = [...new Set(Object.values(snippetLanguages))].filter((lang) => lang !== "text");
      const highlighter = await createHighlighter({ themes: [pumpkinCodeTheme], langs });
      try {
        const tokens = Object.fromEntries(
          (Object.keys(snippets) as SnippetName[]).map((name) => [
            name,
            highlighter
              .codeToTokensBase(snippets[name], { lang: snippetLanguages[name], theme: pumpkinCodeTheme })
              .map(mergeTokens),
          ]),
        );
        return `export const snippetTokens = ${JSON.stringify(tokens)};`;
      } finally {
        highlighter.dispose();
      }
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss(), pageHead(), snippetTokens()],
  build:
    isSsrBuild === true
      ? { copyPublicDir: false }
      : {
          rolldownOptions: {
            input: Object.fromEntries(routes.map((r) => [r.id, resolve(root, r.html)])),
          },
        },
}));
