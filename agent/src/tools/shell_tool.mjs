import { exec } from "node:child_process";
import { config } from "../config.mjs";

const DANGEROUS_PATTERNS = [
  /\brm\s+-rf\s+\/(?!\S)/, // rm -rf /
  /\bmkfs\b/,
  /\bdd\s+if=/,
  /\bsudo\b/,
  /:\(\)\s*\{\s*:\|:&\s*\};/, // fork bomb
  />\s*\/dev\/sd/,
];

export const shellTools = config.allowShell
  ? [
      {
        definition: {
          type: "function",
          function: {
            name: "run_shell",
            description:
              "Run a shell command inside the agent workspace directory (e.g. npm install, git init, mkdir). Use for building/scaffolding apps. Output is truncated.",
            parameters: {
              type: "object",
              properties: {
                command: { type: "string", description: "The shell command to run." },
              },
              required: ["command"],
            },
          },
        },
        async run({ command }) {
          if (DANGEROUS_PATTERNS.some((re) => re.test(command))) {
            return `Refused to run this command as a safety precaution: ${command}`;
          }
          return new Promise((resolve) => {
            exec(
              command,
              { cwd: config.workspaceDir, timeout: 120_000, maxBuffer: 1024 * 1024 },
              (err, stdout, stderr) => {
                const out = `${stdout || ""}${stderr || ""}`.slice(0, 8000);
                if (err) {
                  resolve(`Command exited with error: ${err.message}\n${out}`);
                } else {
                  resolve(out || "(no output)");
                }
              },
            );
          });
        },
      },
    ]
  : [];
