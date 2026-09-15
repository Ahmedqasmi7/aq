#!/usr/bin/env node
import readline from "node:readline";
import fs from "node:fs";
import path from "node:path";
import { runAgent } from "./agent.mjs";
import { isReachable, listModels } from "./ollama.mjs";
import { addTask, listTasks, removeTask, dueTasks, markRan } from "./tasks.mjs";
import { addMemory, searchMemory, listMemory } from "./memory.mjs";
import { config, OUTPUTS_DIR } from "./config.mjs";

const [, , command, ...rest] = process.argv;

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

async function ensureOllama() {
  const ok = await isReachable();
  if (!ok) {
    console.error(
      `\nCan't reach Ollama at ${config.ollamaHost}.\n` +
        `Install it from https://ollama.com, run "ollama serve", and pull a tool-capable model, e.g.:\n` +
        `  ollama pull ${config.model}\n`,
    );
    process.exit(1);
  }
  const models = await listModels();
  if (!models.some((m) => m === config.model || m.startsWith(config.model.split(":")[0]))) {
    console.error(
      `\nModel "${config.model}" is not pulled yet. Run:\n  ollama pull ${config.model}\n` +
        `Or edit agent/agent.config.json to point "model" at one you already have (found: ${models.join(", ") || "none"}).\n`,
    );
    process.exit(1);
  }
}

async function cmdChat() {
  await ensureOllama();
  console.log(`aq-agent chat — model: ${config.model} — workspace: ${config.workspaceDir}`);
  console.log(`Type your message, or "exit" to quit.\n`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "you> " });
  let history = [];
  rl.prompt();
  rl.on("line", async (line) => {
    const text = line.trim();
    if (!text) return rl.prompt();
    if (["exit", "quit"].includes(text.toLowerCase())) {
      rl.close();
      return;
    }
    try {
      const { reply, history: newHistory } = await runAgent(text, history);
      history = newHistory;
      console.log(`\nagent> ${reply}\n`);
    } catch (err) {
      console.error(`\nError: ${err.message}\n`);
    }
    rl.prompt();
  });
  rl.on("close", () => process.exit(0));
}

async function cmdRun() {
  await ensureOllama();
  const prompt = rest.join(" ");
  if (!prompt) {
    console.error('Usage: aq-agent run "<prompt>"');
    process.exit(1);
  }
  const { reply } = await runAgent(prompt);
  console.log(reply);
}

async function cmdDaemon() {
  await ensureOllama();
  log(`Daemon started. Polling every 60s. Outputs written to ${OUTPUTS_DIR}`);
  const tick = async () => {
    const due = dueTasks();
    for (const task of due) {
      log(`Running task ${task.id}: ${task.prompt}`);
      try {
        const { reply } = await runAgent(task.prompt);
        const file = path.join(
          OUTPUTS_DIR,
          `${task.id}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`,
        );
        fs.writeFileSync(file, `# Task: ${task.prompt}\n\n${reply}\n`, "utf8");
        log(`Task ${task.id} done -> ${file}`);
      } catch (err) {
        log(`Task ${task.id} failed: ${err.message}`);
      }
      markRan(task.id);
    }
  };
  await tick();
  setInterval(tick, 60_000);
}

function parseScheduleArgs(args) {
  const dailyIdx = args.indexOf("--daily");
  const everyIdx = args.indexOf("--every");
  const onceIdx = args.indexOf("--once");
  if (dailyIdx !== -1) return { type: "daily", time: args[dailyIdx + 1] };
  if (everyIdx !== -1) {
    const m = args[everyIdx + 1].match(/^(\d+)m$/);
    if (!m) throw new Error('--every expects minutes like "30m"');
    return { type: "interval", minutes: Number(m[1]) };
  }
  if (onceIdx !== -1) return { type: "once", at: args[onceIdx + 1] };
  throw new Error("Specify one of --daily HH:MM, --every 30m, --once <ISO timestamp>");
}

async function cmdTask() {
  const [sub, ...args] = rest;
  if (sub === "add") {
    const scheduleFlagIdx = args.findIndex((a) => a.startsWith("--"));
    const prompt = args.slice(0, scheduleFlagIdx === -1 ? args.length : scheduleFlagIdx).join(" ");
    const schedule = parseScheduleArgs(args);
    const task = addTask(prompt, schedule);
    console.log(`Added task ${task.id}, next run: ${task.nextRun}`);
  } else if (sub === "list") {
    const tasks = listTasks();
    if (tasks.length === 0) return console.log("No scheduled tasks.");
    for (const t of tasks) {
      console.log(`${t.enabled ? "[on] " : "[off]"} ${t.id}  next=${t.nextRun}  "${t.prompt}"`);
    }
  } else if (sub === "remove") {
    console.log(removeTask(args[0]) ? "Removed." : "Not found.");
  } else {
    console.error("Usage: aq-agent task add \"<prompt>\" [--daily HH:MM | --every 30m | --once <ISO>]\n       aq-agent task list\n       aq-agent task remove <id>");
    process.exit(1);
  }
}

async function cmdMemory() {
  const [sub, ...args] = rest;
  if (sub === "add") {
    const entry = addMemory(args.join(" "));
    console.log(`Saved memory ${entry.id}`);
  } else if (sub === "search") {
    const results = searchMemory(args.join(" "));
    console.log(results.length ? results.map((r) => `- ${r.text}`).join("\n") : "No matches.");
  } else if (sub === "list") {
    const results = listMemory();
    console.log(results.length ? results.map((r) => `- (${r.createdAt.slice(0, 10)}) ${r.text}`).join("\n") : "No memories yet.");
  } else {
    console.error('Usage: aq-agent memory add "<text>"\n       aq-agent memory search "<query>"\n       aq-agent memory list');
    process.exit(1);
  }
}

async function cmdSetup() {
  const ok = await isReachable();
  console.log(`Ollama reachable at ${config.ollamaHost}: ${ok ? "yes" : "no"}`);
  if (ok) {
    const models = await listModels();
    console.log(`Installed models: ${models.join(", ") || "(none)"}`);
    console.log(`Configured model: ${config.model} ${models.includes(config.model) ? "(ready)" : "(not pulled yet — run: ollama pull " + config.model + ")"}`);
  } else {
    console.log(`Install Ollama from https://ollama.com, then run "ollama serve" and "ollama pull ${config.model}".`);
  }
  console.log(`Workspace: ${config.workspaceDir}`);
  console.log(`Shell tool enabled: ${config.allowShell}`);
}

const commands = {
  chat: cmdChat,
  run: cmdRun,
  daemon: cmdDaemon,
  task: cmdTask,
  memory: cmdMemory,
  setup: cmdSetup,
};

if (!commands[command]) {
  console.log(
    [
      "aq-agent — local, offline-capable AI agent (runs on Ollama, no API credits)",
      "",
      "Usage:",
      "  node src/cli.mjs setup                        Check Ollama connectivity/model",
      "  node src/cli.mjs chat                          Interactive chat REPL",
      '  node src/cli.mjs run "<prompt>"                One-shot request',
      "  node src/cli.mjs daemon                        Run forever, executing scheduled tasks",
      '  node src/cli.mjs task add "<prompt>" --daily 08:00',
      '  node src/cli.mjs task add "<prompt>" --every 30m',
      '  node src/cli.mjs task add "<prompt>" --once 2026-09-16T08:00:00',
      "  node src/cli.mjs task list",
      "  node src/cli.mjs task remove <id>",
      '  node src/cli.mjs memory add "<text>"',
      '  node src/cli.mjs memory search "<query>"',
      "  node src/cli.mjs memory list",
    ].join("\n"),
  );
  process.exit(command ? 1 : 0);
}

commands[command]().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
