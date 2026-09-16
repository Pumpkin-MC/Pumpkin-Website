import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const serverEntry = resolve(root, "dist-ssr/entry-server.js");
const { render, routes, SITE_URL } = await import(pathToFileURL(serverEntry).href);

for (const route of routes) {
  const file = resolve(root, "dist", route.html);
  const html = await readFile(file, "utf8");
  if (!html.includes("<!--app-html-->")) {
    throw new Error(`${route.html} has no <!--app-html--> placeholder`);
  }
  await writeFile(file, html.replace("<!--app-html-->", render(route.id)));
  console.log(`prerendered ${route.path}`);
}

const lastmod = new Date().toISOString().slice(0, 10);
const urls = routes
  .filter((route) => !route.noindex)
  .map((route) => `  <url>\n    <loc>${SITE_URL}${route.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
  .join("\n");
await writeFile(
  resolve(root, "dist/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
console.log("wrote sitemap.xml");

await rm(resolve(root, "dist-ssr"), { recursive: true, force: true });
