import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export const STATUSES = ["done", "partial", "planned", "unknown"];

export function sourceRoot(checkout) {
  for (const root of ["crates/pumpkin-core/src", "crates/pumpkin/src"]) {
    if (["entity", "block/blocks", "item/items", "command/commands"].every((dir) => fs.existsSync(path.join(checkout, root, dir)))) return root;
  }
  throw new Error("Unsupported Pumpkin source layout: expected entity, block, item and command directories in pumpkin-core or pumpkin.");
}

export function fingerprint(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

// Only collect constants inside ids() declarations, never ingredients or attack items.
// Dynamic tag expansion is deliberately omitted rather than guessed from a tag name.
export function declaredIds(text, kind) {
  const ids = new Set();
  for (const match of text.matchAll(/fn ids\(\)[^{]*\{/g)) {
    let depth = 1;
    let end = match.index + match[0].length;
    const start = end;
    while (end < text.length && depth) {
      if (text[end] === "{") depth++;
      if (text[end] === "}") depth--;
      end++;
    }
    for (const id of text.slice(start, end).matchAll(new RegExp(`\\b${kind}::([A-Z][A-Z0-9_]*)\\b`, "g"))) ids.add(`minecraft:${id[1].toLowerCase()}`);
  }
  if (kind === "Block") for (const id of text.matchAll(/#\[pumpkin_block\("([^"]+)"\)\]/g)) ids.add(id[1]);
  return [...ids];
}

// A file, a registry entry, or a missing TODO is discovery evidence, not a parity review.
export function assess(entry, audit, checkout, previous, previousCommit) {
  const result = { ...entry, status: "unknown" };
  delete result.items;
  delete result.note;
  result.note = entry.source
    ? "Implementation source found. Behaviour has not been reviewed for this snapshot."
    : "No dedicated implementation source identified. This does not establish that the feature is missing.";
  if (!audit) {
    if (!previous || !STATUSES.includes(previous.status) || !/^[a-f0-9]{40}$/.test(previousCommit ?? "")) return result;
    return {
      ...result, status: previous.status, ...(previous.note && { note: previous.note }),
      ...(previous.items?.length && { items: previous.items }),
      review: { commit: previousCommit, scope: "Previous tracker assessment; not revalidated against the current snapshot.", current: false },
    };
  }
  if (!STATUSES.includes(audit.status) || audit.status === "unknown" || !/^[a-f0-9]{40}$/.test(audit.commit) || !audit.scope || !audit.note || !audit.files?.length || !audit.evidence?.length) {
    throw new Error(`Invalid audit for ${entry.id}: status, commit, scope, note, files and evidence are required.`);
  }
  for (const file of audit.files) {
    if (!file.source || !/^[a-f0-9]{64}$/.test(file.sha256) || path.isAbsolute(file.source) || file.source.split("/").includes("..")) throw new Error(`Invalid audit source for ${entry.id}`);
  }
  for (const evidence of audit.evidence) {
    if (!evidence.label || !audit.files.some((file) => file.source === evidence.source) || !Number.isInteger(evidence.line) || evidence.line < 1) throw new Error(`Invalid audit evidence for ${entry.id}`);
  }
  const changed = audit.files.filter((file) => !fs.existsSync(path.join(checkout, file.source)) || fingerprint(path.join(checkout, file.source)) !== file.sha256);
  if (changed.length) {
    result.note = "The reviewed source has changed. The previous assessment needs a new review.";
    result.review = { commit: audit.commit, scope: audit.scope, current: false };
    return result;
  }
  return { ...result, status: audit.status, note: audit.note, ...(audit.items?.length && { items: audit.items }), review: { commit: audit.commit, scope: audit.scope, current: true }, evidence: audit.evidence };
}
