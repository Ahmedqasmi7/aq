import fs from "node:fs";
import path from "node:path";
import { config } from "../config.mjs";

function resolveInWorkspace(relPath) {
  const resolved = path.resolve(config.workspaceDir, relPath || ".");
  const root = path.resolve(config.workspaceDir);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error(
      `Path "${relPath}" escapes the workspace (${config.workspaceDir}). Refusing.`,
    );
  }
  return resolved;
}

export const fsTools = [
  {
    definition: {
      type: "function",
      function: {
        name: "list_dir",
        description: "List files and directories inside the agent workspace.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path relative to the workspace root. Use '.' for the root." },
          },
        },
      },
    },
    async run({ path: relPath = "." }) {
      const dir = resolveInWorkspace(relPath);
      if (!fs.existsSync(dir)) return `Directory does not exist: ${relPath}`;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      return entries
        .map((e) => `${e.isDirectory() ? "[dir] " : "      "}${e.name}`)
        .join("\n") || "(empty)";
    },
  },
  {
    definition: {
      type: "function",
      function: {
        name: "read_file",
        description: "Read a text file from the agent workspace.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path relative to the workspace root." },
          },
          required: ["path"],
        },
      },
    },
    async run({ path: relPath }) {
      const file = resolveInWorkspace(relPath);
      if (!fs.existsSync(file)) return `File does not exist: ${relPath}`;
      const content = fs.readFileSync(file, "utf8");
      return content.length > 20000 ? content.slice(0, 20000) + "\n... (truncated)" : content;
    },
  },
  {
    definition: {
      type: "function",
      function: {
        name: "write_file",
        description: "Create or overwrite a text file in the agent workspace, creating parent directories as needed.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path relative to the workspace root." },
            content: { type: "string", description: "Full file contents to write." },
          },
          required: ["path", "content"],
        },
      },
    },
    async run({ path: relPath, content }) {
      const file = resolveInWorkspace(relPath);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content, "utf8");
      return `Wrote ${content.length} bytes to ${relPath}`;
    },
  },
  {
    definition: {
      type: "function",
      function: {
        name: "edit_file",
        description: "Replace an exact substring in an existing file (find-and-replace once).",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string" },
            search: { type: "string", description: "Exact text to find; must be unique in the file." },
            replace: { type: "string", description: "Text to replace it with." },
          },
          required: ["path", "search", "replace"],
        },
      },
    },
    async run({ path: relPath, search, replace }) {
      const file = resolveInWorkspace(relPath);
      if (!fs.existsSync(file)) return `File does not exist: ${relPath}`;
      const content = fs.readFileSync(file, "utf8");
      const occurrences = content.split(search).length - 1;
      if (occurrences === 0) return `Search text not found in ${relPath}`;
      if (occurrences > 1) return `Search text appears ${occurrences} times in ${relPath}; must be unique. Not edited.`;
      fs.writeFileSync(file, content.replace(search, replace), "utf8");
      return `Edited ${relPath}`;
    },
  },
];
