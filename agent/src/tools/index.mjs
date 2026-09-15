import { fsTools } from "./fs_tools.mjs";
import { shellTools } from "./shell_tool.mjs";
import { webTools } from "./web_tools.mjs";
import { memoryTools } from "./memory_tools.mjs";
import { taskTools } from "./task_tools.mjs";
import { imageTools } from "./image_tools.mjs";
import { videoTools } from "./video_tools.mjs";

export const allTools = [
  ...fsTools,
  ...shellTools,
  ...webTools,
  ...memoryTools,
  ...taskTools,
  ...imageTools,
  ...videoTools,
];

export const toolDefinitions = allTools.map((t) => t.definition);
export const toolByName = Object.fromEntries(
  allTools.map((t) => [t.definition.function.name, t.run]),
);
