import path from "node:path";
import { config } from "./config.mjs";

export function resolveInWorkspace(relPath) {
  const resolved = path.resolve(config.workspaceDir, relPath || ".");
  const root = path.resolve(config.workspaceDir);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error(
      `Path "${relPath}" escapes the workspace (${config.workspaceDir}). Refusing.`,
    );
  }
  return resolved;
}
