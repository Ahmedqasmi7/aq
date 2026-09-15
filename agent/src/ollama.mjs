import { config } from "./config.mjs";

async function ollamaFetch(pathname, options = {}) {
  const url = `${config.ollamaHost}${pathname}`;
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    throw new Error(
      `Could not reach Ollama at ${config.ollamaHost} (${err.message}). Is "ollama serve" running?`,
    );
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ollama request failed (${res.status}): ${body || res.statusText}`);
  }
  return res;
}

export async function chat({ messages, tools }) {
  const res = await ollamaFetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages,
      tools,
      stream: false,
    }),
  });
  const data = await res.json();
  return data.message;
}

export async function listModels() {
  const res = await ollamaFetch("/api/tags");
  const data = await res.json();
  return (data.models || []).map((m) => m.name);
}

export async function isReachable() {
  try {
    await ollamaFetch("/api/tags");
    return true;
  } catch {
    return false;
  }
}
