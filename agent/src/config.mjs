import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const AGENT_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CONFIG_PATH = path.join(AGENT_DIR, "agent.config.json");
const EXAMPLE_PATH = path.join(AGENT_DIR, "agent.config.example.json");

const DEFAULTS = {
  ollamaHost: "http://127.0.0.1:11434",
  model: "qwen2.5:7b",
  workspaceDir: path.join(os.homedir(), "aq-agent-workspace"),
  allowShell: false,
  newsFeeds: [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://hnrss.org/frontpage",
  ],
  maxToolIterations: 8,
  drawThingsHost: "http://127.0.0.1:7860",
  imageDefaultWidth: 1024,
  imageDefaultHeight: 1024,
  videoWidth: 1080,
  videoHeight: 1920,
};

function loadConfig() {
  let userConfig = {};
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      userConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    } catch (err) {
      console.error(`Failed to parse agent.config.json: ${err.message}`);
    }
  } else if (fs.existsSync(EXAMPLE_PATH)) {
    console.error(
      `No agent.config.json found. Copy agent.config.example.json to agent.config.json to customize settings. Using defaults for now.`,
    );
  }

  const config = { ...DEFAULTS, ...userConfig };
  config.workspaceDir = path.resolve(config.workspaceDir.replace(/^~/, os.homedir()));
  if (!fs.existsSync(config.workspaceDir)) {
    fs.mkdirSync(config.workspaceDir, { recursive: true });
  }
  return config;
}

export const config = loadConfig();
export const AGENT_ROOT = AGENT_DIR;
export const DATA_DIR = path.join(AGENT_DIR, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
export const OUTPUTS_DIR = path.join(DATA_DIR, "outputs");
if (!fs.existsSync(OUTPUTS_DIR)) fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
