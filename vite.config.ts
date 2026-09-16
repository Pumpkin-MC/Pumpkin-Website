import { statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { SITE_URL, routes } from "./src/routes.ts";
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

function renderSitemap(): string {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = routes
    .filter((route) => !route.noindex)
    .map((route) => `  <url>\n    <loc>${SITE_URL}${route.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function directoryRedirect(req: IncomingMessage, directories: string[]): string | null {
  if (req.method !== "GET") return null;
  const url = new URL(req.url ?? "/", "http://localhost");
  const pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/") || /\.[a-z0-9]+$/i.test(pathname)) return null;
  const hasIndex = directories.some((directory) => isFile(resolve(directory, `.${pathname}/index.html`)));
  return hasIndex ? `${url.pathname}/${url.search}` : null;
}

function redirect(res: ServerResponse, location: string) {
  res.statusCode = 301;
  res.setHeader("Location", location);
  res.end();
}

function isMissingPage(req: IncomingMessage, directories: string[]): boolean {
  if (req.method !== "GET" || !(req.headers.accept ?? "").includes("text/html")) return false;
  const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  const candidates = pathname.endsWith("/")
    ? [`${pathname}index.html`]
    : [pathname, `${pathname}.html`, `${pathname}/index.html`];
  return !directories.some((directory) => candidates.some((candidate) => isFile(resolve(directory, `.${candidate}`))));
}

function sendNotFound(res: ServerResponse, html: string) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}

function siteFiles(isSsrBuild: boolean): Plugin {
  return {
    name: "pumpkin-site-files",
    configureServer(server) {
      server.middlewares.use("/sitemap.xml", (_req, res) => {
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.end(renderSitemap());
      });
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const directories = [root, server.config.publicDir];
          const location = directoryRedirect(req, directories);
          if (location) return redirect(res, location);
          if (!isMissingPage(req, directories)) return next();
          try {
            const template = await readFile(resolve(root, "404.html"), "utf8");
            sendNotFound(res, await server.transformIndexHtml("/404.html", template, req.originalUrl));
          } catch (error) {
            next(error);
          }
        });
      };
    },
    configurePreviewServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const outDir = resolve(root, server.config.build.outDir);
          const location = directoryRedirect(req, [outDir]);
          if (location) return redirect(res, location);
          if (!isMissingPage(req, [outDir])) return next();
          try {
            sendNotFound(res, await readFile(resolve(outDir, "404.html"), "utf8"));
          } catch (error) {
            next(error);
          }
        });
      };
    },
    generateBundle() {
      if (isSsrBuild) return;
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: renderSitemap() });
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
  appType: "mpa",
  plugins: [react(), tailwindcss(), pageHead(), snippetTokens(), siteFiles(isSsrBuild === true)],
  build:
    isSsrBuild === true
      ? { copyPublicDir: false }
      : {
          rolldownOptions: {
            input: Object.fromEntries(routes.map((r) => [r.id, resolve(root, r.html)])),
          },
        },
}));
