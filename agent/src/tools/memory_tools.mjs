import { addMemory, searchMemory } from "../memory.mjs";

export const memoryTools = [
  {
    definition: {
      type: "function",
      function: {
        name: "memory_save",
        description:
          "Save a durable fact, preference, or note to long-term memory so it can be recalled in future sessions.",
        parameters: {
          type: "object",
          properties: {
            text: { type: "string", description: "The fact or note to remember." },
            tags: { type: "array", items: { type: "string" }, description: "Optional tags." },
          },
          required: ["text"],
        },
      },
    },
    async run({ text, tags = [] }) {
      const entry = addMemory(text, tags);
      return `Saved to memory (id ${entry.id}).`;
    },
  },
  {
    definition: {
      type: "function",
      function: {
        name: "memory_search",
        description: "Search long-term memory for previously saved facts or notes.",
        parameters: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"],
        },
      },
    },
    async run({ query }) {
      const results = searchMemory(query);
      if (results.length === 0) return "No matching memories found.";
      return results.map((r) => `- (${r.createdAt.slice(0, 10)}) ${r.text}`).join("\n");
    },
  },
];
