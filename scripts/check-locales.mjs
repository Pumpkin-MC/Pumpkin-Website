import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const LOCALES_DIR = fileURLToPath(new URL("../src/i18n/locales/", import.meta.url));
const BASE_LOCALE = "en_us";
/** Locales that must translate every key; partial locales fall back to English. */
const COMPLETE_LOCALES = new Set(["zh_cn", "zh_hk", "zh_tw"]);
/** Catalogs that grow automatically and fall back to the English source text. */
const OPTIONAL_PREFIXES = ["tracker."];

const PLACEHOLDER = /\{(\w+)\}/g;
const TAG = /<(\w+)>/g;

const localeFiles = (await readdir(LOCALES_DIR)).filter((name) => name.endsWith(".json")).sort();
const base = JSON.parse(await readFile(join(LOCALES_DIR, `${BASE_LOCALE}.json`), "utf8"));
const errors = [];
const warnings = [];

function flatten(value, path = "", into = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((child, index) => flatten(child, `${path}[${index}]`, into));
  } else if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) flatten(child, path ? `${path}.${key}` : key, into);
  } else {
    into.set(path, value);
  }
  return into;
}

function matches(pattern, text) {
  return [...text.matchAll(pattern)].map((match) => match[1]).sort();
}

const baseEntries = flatten(base);

for (const file of localeFiles) {
  const name = file.replace(/\.json$/, "");
  const messages = flatten(JSON.parse(await readFile(join(LOCALES_DIR, file), "utf8")));
  const complete = COMPLETE_LOCALES.has(name);
  let translated = 0;

  for (const [path, value] of baseEntries) {
    const target = messages.get(path);
    if (target === undefined) {
      const optional = OPTIONAL_PREFIXES.some((prefix) => path.startsWith(prefix));
      if (complete && !optional) errors.push(`${name}: missing ${path}`);
      continue;
    }
    if (typeof target !== "string") {
      errors.push(`${name}: ${path} is not a string`);
      continue;
    }
    if (!target.trim()) errors.push(`${name}: ${path} is empty`);
    if (target !== value) translated += 1;
    const expectedPlaceholders = matches(PLACEHOLDER, value);
    const actualPlaceholders = matches(PLACEHOLDER, target);
    if (expectedPlaceholders.join() !== actualPlaceholders.join()) {
      errors.push(`${name}: ${path} placeholders {${expectedPlaceholders}} != {${actualPlaceholders}}`);
    }
    const expectedTags = matches(TAG, value);
    const actualTags = matches(TAG, target);
    if (expectedTags.join() !== actualTags.join()) {
      errors.push(`${name}: ${path} tags <${expectedTags}> != <${actualTags}>`);
    }
  }

  for (const path of messages.keys()) {
    if (!baseEntries.has(path)) errors.push(`${name}: unknown key ${path}`);
  }

  console.log(`${name}: ${translated}/${baseEntries.size} localized`);
  if (name !== BASE_LOCALE && !complete && translated === 0) {
    warnings.push(`${name}: falls back to English everywhere`);
  }
}

for (const warning of warnings) console.warn(`warning: ${warning}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`\n${errors.length} translation problem(s) found.`);
  process.exit(1);
}

console.log(`\n${localeFiles.length} locales are consistent.`);
