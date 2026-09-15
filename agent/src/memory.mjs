import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR } from "./config.mjs";

const MEMORY_PATH = path.join(DATA_DIR, "memory.json");

function load() {
  if (!fs.existsSync(MEMORY_PATH)) return { facts: [] };
  try {
    return JSON.parse(fs.readFileSync(MEMORY_PATH, "utf8"));
  } catch {
    return { facts: [] };
  }
}

function save(store) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(store, null, 2));
}

export function addMemory(text, tags = []) {
  const store = load();
  const entry = {
    id: crypto.randomUUID(),
    text,
    tags,
    createdAt: new Date().toISOString(),
  };
  store.facts.push(entry);
  save(store);
  return entry;
}

export function searchMemory(query, limit = 10) {
  const store = load();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = store.facts.map((f) => {
    const haystack = `${f.text} ${f.tags.join(" ")}`.toLowerCase();
    const score = terms.reduce((s, t) => s + (haystack.includes(t) ? 1 : 0), 0);
    return { ...f, score };
  });
  return scored
    .filter((f) => f.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

export function listMemory(limit = 50) {
  const store = load();
  return store.facts.slice(-limit).reverse();
}

export function recentMemoryContext(limit = 8) {
  return listMemory(limit)
    .map((f) => `- (${f.createdAt.slice(0, 10)}) ${f.text}`)
    .join("\n");
}
