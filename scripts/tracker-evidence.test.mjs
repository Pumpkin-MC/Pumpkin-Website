import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assess, declaredIds, fingerprint, sourceRoot } from "./tracker-evidence.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tracker-evidence-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const source = "entity.rs";
  fs.writeFileSync(path.join(root, source), "fn new() {}\n");
  const audit = {
    status: "partial", commit: "a".repeat(40), scope: "Constructor source review", note: "Known AI gaps.",
    items: [{ text: "Attack goal", done: true }],
    files: [{ source, sha256: fingerprint(path.join(root, source)) }],
    evidence: [{ source, line: 1, label: "Constructor" }],
  };
  return { root, source, audit };
}

test("file presence and historical claims cannot establish parity", (t) => {
  const { root, source } = fixture(t);
  const entry = assess({ id: "mob", status: "done", source, note: "Matches vanilla", items: [{ done: true, text: "Flight" }] }, undefined, root);
  assert.equal(entry.status, "unknown");
  assert.equal(entry.items, undefined);
  assert.doesNotMatch(entry.note, /Matches vanilla/);
});

test("missing discovery source is unknown rather than planned", (t) => {
  const { root } = fixture(t);
  assert.equal(assess({ id: "mob", status: "planned" }, undefined, root).status, "unknown");
});

test("previous assessments retain status separately from review freshness", (t) => {
  const { root } = fixture(t);
  const previous = { status: "done", note: "Previously reported implementation", items: [{ text: "Attack", done: true }] };
  const entry = assess({ id: "mob" }, undefined, root, previous, "b".repeat(40));
  assert.equal(entry.status, "done");
  assert.equal(entry.review.current, false);
  assert.equal(entry.review.commit, "b".repeat(40));
  assert.deepEqual(entry.items, previous.items);
});

test("current reviews take precedence over historical claims", (t) => {
  const { root, audit } = fixture(t);
  assert.equal(assess({ id: "mob" }, audit, root, { status: "done" }, "b".repeat(40)).status, "partial");
});

test("unchanged reviewed files keep the scoped assessment", (t) => {
  const { root, audit } = fixture(t);
  const entry = assess({ id: "mob" }, audit, root);
  assert.equal(entry.status, "partial");
  assert.equal(entry.review.current, true);
  assert.deepEqual(entry.evidence, audit.evidence);
  assert.deepEqual(entry.items, audit.items);
});

test("source changes expire a review and hide outdated findings", (t) => {
  const { root, source, audit } = fixture(t);
  fs.appendFileSync(path.join(root, source), "// new attack goal\n");
  const entry = assess({ id: "mob" }, audit, root);
  assert.equal(entry.status, "unknown");
  assert.equal(entry.review.current, false);
  assert.equal(entry.items, undefined);
  assert.equal(entry.evidence, undefined);
});

test("removed dependencies expire a review", (t) => {
  const { root, source, audit } = fixture(t);
  fs.unlinkSync(path.join(root, source));
  assert.equal(assess({ id: "mob" }, audit, root).review.current, false);
});

test("malformed audits fail rather than publish ungrounded assessments", (t) => {
  const { root, audit } = fixture(t);
  assert.throws(() => assess({ id: "mob" }, { ...audit, files: [] }, root), /Invalid audit/);
  assert.throws(() => assess({ id: "mob" }, { ...audit, evidence: [{ source: "other.rs", line: 1, label: "Source" }] }, root), /Invalid audit evidence/);
});

test("source discovery supports both the split core and older layout", (t) => {
  const { root } = fixture(t);
  for (const dir of ["entity", "block/blocks", "item/items", "command/commands"]) fs.mkdirSync(path.join(root, "crates/pumpkin/src", dir), { recursive: true });
  assert.equal(sourceRoot(root), "crates/pumpkin/src");
  for (const dir of ["entity", "block/blocks", "item/items", "command/commands"]) fs.mkdirSync(path.join(root, "crates/pumpkin-core/src", dir), { recursive: true });
  assert.equal(sourceRoot(root), "crates/pumpkin-core/src");
});

test("unsupported layouts produce an actionable error", (t) => {
  const { root } = fixture(t);
  assert.throws(() => sourceRoot(root), /Unsupported Pumpkin source layout/);
});

test("declared IDs exclude ingredients and do not truncate large ID lists", () => {
  const ids = Array.from({ length: 15 }, (_, i) => `Item::BUCKET_${i}.id`).join(",");
  const text = `impl ItemMetadata for Bucket { fn ids() -> Box<[u16]> { [${ids}].into() } }\nfn use_item() { Item::COD; Item::WATER_BUCKET; }`;
  const found = declaredIds(text, "Item");
  assert.equal(found.length, 15);
  assert.ok(!found.includes("minecraft:cod"));
});

test("block tags are not misrepresented as individual registered blocks", () => {
  assert.deepEqual(declaredIds('#[pumpkin_block_from_tag("minecraft:doors")]', "Block"), []);
  assert.deepEqual(declaredIds('#[pumpkin_block("minecraft:lever")]', "Block"), ["minecraft:lever"]);
});
