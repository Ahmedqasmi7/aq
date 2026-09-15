# aq-agent

A personal AI agent that runs **entirely on your laptop**, for daily use, 24/7 if you want it to —
with **no API credits, no subscription, no per-message cost**. It uses [Ollama](https://ollama.com)
to run an open-weight model locally, so the core loop (chat, coding, file work, memory, scheduling)
works fully offline. Only three tools (`web_search`, `web_fetch`, `read_news`) need an internet
connection, and they fail gracefully with a clear message when you're offline instead of crashing.

This is separate from the VELARIO Next.js site in the rest of this repo — it's a standalone CLI/daemon
meant to be cloned to, and run on, your own machine.

## What it can do

- **Chat** — an interactive REPL for anything (questions, drafting, planning).
- **Build apps / write code** — `read_file` / `write_file` / `edit_file` / `list_dir` tools scoped to
  a workspace folder on your machine, plus an opt-in `run_shell` tool (npm install, git, mkdir, build
  commands) for actually scaffolding and running projects.
- **Remember things** — a persistent local memory store (`memory_save` / `memory_search`) so facts and
  preferences carry across sessions, not just within one chat.
- **Work unattended** — `schedule_task` (daily / interval / one-off) plus a `daemon` mode that polls
  every minute and runs due tasks on its own, writing results to `agent/data/outputs/`. This is what
  makes it "work for you 24/7": start the daemon once (see the service files below) and it keeps
  running in the background.
- **Read news / search the web** — only when you have internet, using free, keyless sources
  (RSS feeds, DuckDuckGo HTML). No paid search API required.

## Setup (one-time, on your laptop — not in this cloud session)

1. Install [Ollama](https://ollama.com) (free, runs models locally).
2. Pull a tool-calling-capable model. A good default that runs well on a laptop CPU:
   ```bash
   ollama pull qwen2.5:7b
   ```
   If you have a beefier machine/GPU, `qwen2.5:14b` or `llama3.1:8b` also work well with tools.
   If your laptop is limited, try `qwen2.5:3b` (edit `model` in the config to match).
3. In this repo:
   ```bash
   cd agent
   cp agent.config.example.json agent.config.json
   ```
   Edit `agent.config.json` if you want:
   - `workspaceDir` — where the agent is allowed to read/write files (default `~/aq-agent-workspace`).
     All file/shell tools are sandboxed to this folder; it can't touch the rest of your filesystem.
   - `allowShell` — set to `true` to let the agent run shell commands (needed for "build an app" style
     requests: npm install, git, running dev servers, etc.). Off by default because an LLM running
     shell commands unattended is inherently risky — only turn it on once you're comfortable with that,
     and review scheduled-task prompts carefully since the daemon runs them without you watching.
   - `newsFeeds` — RSS feeds for the `read_news` tool.
4. Sanity check:
   ```bash
   node src/cli.mjs setup
   ```

No `npm install` is needed — the agent has zero third-party dependencies, only Node.js built-ins
(requires Node 20+; this machine has Node 22).

## Using it

```bash
node src/cli.mjs chat                 # interactive chat
node src/cli.mjs run "summarize the README in this repo"   # one-shot
node src/cli.mjs setup                # check Ollama connectivity/model
```

Scheduling work for it to do on its own:

```bash
node src/cli.mjs task add "Read the news and write a one-paragraph brief to daily-brief.md" --daily 08:00
node src/cli.mjs task add "Check in on progress" --every 30m
node src/cli.mjs task add "One-off reminder" --once 2026-09-20T09:00:00
node src/cli.mjs task list
node src/cli.mjs task remove <id>
```

Scheduled tasks only fire while the daemon is running:

```bash
node src/cli.mjs daemon
```

Memory (persists across every chat/run/task):

```bash
node src/cli.mjs memory add "I prefer short, direct answers, no filler"
node src/cli.mjs memory search "preferences"
node src/cli.mjs memory list
```

## Running it 24/7 in the background

The `daemon` command needs to stay running for scheduled tasks to fire. Two ready-made service
templates are in `agent/service/` — edit the placeholder paths/username, then:

**macOS (launchd):**
```bash
cp agent/service/com.aq.agent.plist ~/Library/LaunchAgents/
# edit the paths inside it first
launchctl load ~/Library/LaunchAgents/com.aq.agent.plist
```

**Linux (systemd, user service):**
```bash
mkdir -p ~/.config/systemd/user
cp agent/service/aq-agent.service ~/.config/systemd/user/
# edit the paths inside it first
systemctl --user enable --now aq-agent
```

Either way, Ollama itself should also be running (`ollama serve`, or it's already a background
service after install) — the agent is just the orchestrator on top of it.

## Why this approach

- **No credits burned**: the model runs on your own CPU/GPU via Ollama, which is free and open source.
  There's no API key, no billed token usage, ever, for the core agent loop.
- **Works offline**: chat, coding, file edits, memory, and scheduling all work with zero internet.
  Only news/web-search need a connection, and those tools tell you plainly when they can't reach
  the internet instead of failing silently.
- **Sandboxed by default**: file tools can't leave the configured workspace folder; the shell tool is
  off by default and has to be deliberately enabled.
- **Extensible**: tools live as small files in `src/tools/`. Add a new one by exporting an object with
  a `definition` (JSON-schema function spec) and a `run(args)` function, then add it to
  `src/tools/index.mjs`.

## Known limits

- Model quality is bounded by what runs comfortably on your hardware — a 7B–14B local model is good
  but not GPT-5/Claude-tier at hard reasoning or very large codebases. Good for daily drafting, ops
  summaries, scripting, and scoped coding tasks; less good for huge, ambiguous builds.
- `web_search` scrapes DuckDuckGo's HTML page rather than using a paid search API, since that's the
  free, keyless option — if DuckDuckGo changes its markup, that one tool may need a small update.
- The daemon is a simple 60-second poll loop, not a full cron daemon — fine for personal daily/interval
  tasks, not built for second-level precision.
