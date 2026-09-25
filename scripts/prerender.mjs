import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const serverEntry = resolve(root, "dist-ssr/entry-server.js");
const { render, routes } = await import(pathToFileURL(serverEntry).href);

for (const route of routes) {
  const file = resolve(root, "dist", route.html);
  const html = await readFile(file, "utf8");
  if (!html.includes("<!--app-html-->")) {
    throw new Error(`${route.html} has no <!--app-html--> placeholder`);
  }
  await writeFile(file, html.replace("<!--app-html-->", render(route.id)));
  console.log(`prerendered ${route.path}`);
}

await rm(resolve(root, "dist-ssr"), { recursive: true, force: true });
