import { addTask, listTasks, removeTask } from "../tasks.mjs";

export const taskTools = [
  {
    definition: {
      type: "function",
      function: {
        name: "schedule_task",
        description:
          "Schedule a prompt to be run automatically later by the agent's daemon (for recurring or future work), without you needing to be present.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The instruction to run when the task fires." },
            schedule_type: { type: "string", enum: ["once", "daily", "interval"] },
            at: { type: "string", description: "ISO timestamp, required when schedule_type is 'once'." },
            time: { type: "string", description: "HH:MM 24h, required when schedule_type is 'daily'." },
            minutes: { type: "number", description: "Interval in minutes, required when schedule_type is 'interval'." },
          },
          required: ["prompt", "schedule_type"],
        },
      },
    },
    async run({ prompt, schedule_type, at, time, minutes }) {
      let schedule;
      if (schedule_type === "once") schedule = { type: "once", at };
      else if (schedule_type === "daily") schedule = { type: "daily", time };
      else if (schedule_type === "interval") schedule = { type: "interval", minutes };
      else return `Unknown schedule_type: ${schedule_type}`;
      const task = addTask(prompt, schedule);
      return `Scheduled task ${task.id}, next run at ${task.nextRun}. (Only fires while "aq-agent daemon" is running.)`;
    },
  },
  {
    definition: {
      type: "function",
      function: {
        name: "list_scheduled_tasks",
        description: "List all scheduled tasks.",
        parameters: { type: "object", properties: {} },
      },
    },
    async run() {
      const tasks = listTasks();
      if (tasks.length === 0) return "No scheduled tasks.";
      return tasks
        .map((t) => `- [${t.enabled ? "on" : "off"}] ${t.id}: "${t.prompt}" next=${t.nextRun}`)
        .join("\n");
    },
  },
  {
    definition: {
      type: "function",
      function: {
        name: "cancel_scheduled_task",
        description: "Cancel/remove a scheduled task by id.",
        parameters: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
      },
    },
    async run({ id }) {
      return removeTask(id) ? `Removed task ${id}.` : `No task found with id ${id}.`;
    },
  },
];
