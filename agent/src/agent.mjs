import { chat } from "./ollama.mjs";
import { toolDefinitions, toolByName } from "./tools/index.mjs";
import { recentMemoryContext } from "./memory.mjs";
import { config } from "./config.mjs";

function systemPrompt() {
  const memoryContext = recentMemoryContext();
  return [
    "You are aq-agent, a personal AI agent running entirely locally on the user's laptop via Ollama.",
    "You have no per-message cost, so be thorough, but be concise in your final replies.",
    `Your file/shell tools are scoped to the workspace directory: ${config.workspaceDir}.`,
    config.allowShell
      ? "The run_shell tool is enabled: you can install packages, run builds, use git, and scaffold apps there."
      : "The run_shell tool is disabled (allowShell=false in agent.config.json). You can still read/write/edit files in the workspace.",
    "web_fetch, web_search, and read_news require an internet connection; if they fail, say so plainly and continue with what you know instead of pretending you have live data.",
    "Use memory_save for durable facts/preferences worth remembering across sessions, and memory_search to recall them.",
    "Use schedule_task when the user wants something to happen automatically later or on a recurring basis; it only fires while the daemon is running.",
    memoryContext ? `Known facts about the user from memory:\n${memoryContext}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function runAgent(userMessage, history = []) {
  const messages = [
    { role: "system", content: systemPrompt() },
    ...history,
    { role: "user", content: userMessage },
  ];

  for (let i = 0; i < config.maxToolIterations; i++) {
    const message = await chat({ messages, tools: toolDefinitions });
    messages.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return { reply: message.content, history: messages.slice(1) };
    }

    for (const call of message.tool_calls) {
      const fn = toolByName[call.function.name];
      let result;
      if (!fn) {
        result = `Unknown tool: ${call.function.name}`;
      } else {
        try {
          const args =
            typeof call.function.arguments === "string"
              ? JSON.parse(call.function.arguments || "{}")
              : call.function.arguments || {};
          result = await fn(args);
        } catch (err) {
          result = `Tool "${call.function.name}" failed: ${err.message}`;
        }
      }
      messages.push({
        role: "tool",
        content: typeof result === "string" ? result : JSON.stringify(result),
      });
    }
  }

  return {
    reply:
      "I hit the tool-call iteration limit for this turn without finishing. Try breaking the request into smaller steps.",
    history: messages.slice(1),
  };
}
