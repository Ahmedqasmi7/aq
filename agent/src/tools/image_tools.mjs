import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { config } from "../config.mjs";
import { resolveInWorkspace } from "../workspace.mjs";

const FETCH_TIMEOUT_MS = 5 * 60_000; // local image gen can be slow on first run (model load)

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

async function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export const imageTools = [
  {
    definition: {
      type: "function",
      function: {
        name: "generate_image",
        description:
          "Generate an image from a text prompt using a local Stable Diffusion model via Draw Things (must be running on this Mac with its HTTP API enabled). Saves a PNG into the workspace and returns its path. Fully local/offline, no cost per image.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Description of the image to generate." },
            negative_prompt: {
              type: "string",
              description: "Things to avoid in the image (optional).",
            },
            width: { type: "number", description: `Default ${config.imageDefaultWidth}.` },
            height: { type: "number", description: `Default ${config.imageDefaultHeight}.` },
            steps: { type: "number", description: "Sampling steps, default 20. More = slower but cleaner." },
            filename: {
              type: "string",
              description: "Optional filename (without extension). If omitted, one is derived from the prompt.",
            },
          },
          required: ["prompt"],
        },
      },
    },
    async run({
      prompt,
      negative_prompt = "",
      width = config.imageDefaultWidth,
      height = config.imageDefaultHeight,
      steps = 20,
      filename,
    }) {
      let res;
      try {
        res = await timedFetch(`${config.drawThingsHost}/sdapi/v1/txt2img`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            prompt,
            negative_prompt,
            width,
            height,
            steps,
            seed: -1,
          }),
        });
      } catch (err) {
        return (
          `Could not reach Draw Things at ${config.drawThingsHost} (${err.message}). ` +
          `Open the Draw Things app on your Mac and make sure its HTTP API is turned on in Settings.`
        );
      }
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        return `Draw Things returned an error (${res.status}): ${body || res.statusText}`;
      }
      const data = await res.json();
      const b64 = data?.images?.[0];
      if (!b64) return "Draw Things responded but returned no image data.";

      const dir = resolveInWorkspace("generated-images");
      fs.mkdirSync(dir, { recursive: true });
      const base = filename ? slugify(filename) : slugify(prompt) || "image";
      const file = path.join(dir, `${base}-${crypto.randomUUID().slice(0, 8)}.png`);
      fs.writeFileSync(file, Buffer.from(b64, "base64"));
      return `Generated image: generated-images/${path.basename(file)}`;
    },
  },
];
