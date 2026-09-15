import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR } from "./config.mjs";

const TASKS_PATH = path.join(DATA_DIR, "tasks.json");

function load() {
  if (!fs.existsSync(TASKS_PATH)) return { tasks: [] };
  try {
    return JSON.parse(fs.readFileSync(TASKS_PATH, "utf8"));
  } catch {
    return { tasks: [] };
  }
}

function save(store) {
  fs.writeFileSync(TASKS_PATH, JSON.stringify(store, null, 2));
}

export function computeNextRun(schedule, from = new Date()) {
  if (schedule.type === "once") {
    return new Date(schedule.at);
  }
  if (schedule.type === "interval") {
    return new Date(from.getTime() + schedule.minutes * 60_000);
  }
  if (schedule.type === "daily") {
    const [hh, mm] = schedule.time.split(":").map(Number);
    const next = new Date(from);
    next.setHours(hh, mm, 0, 0);
    if (next <= from) next.setDate(next.getDate() + 1);
    return next;
  }
  throw new Error(`Unknown schedule type: ${schedule.type}`);
}

export function addTask(prompt, schedule) {
  const store = load();
  const task = {
    id: crypto.randomUUID(),
    prompt,
    schedule,
    enabled: true,
    lastRun: null,
    nextRun: computeNextRun(schedule).toISOString(),
    createdAt: new Date().toISOString(),
  };
  store.tasks.push(task);
  save(store);
  return task;
}

export function listTasks() {
  return load().tasks;
}

export function removeTask(id) {
  const store = load();
  const before = store.tasks.length;
  store.tasks = store.tasks.filter((t) => t.id !== id);
  save(store);
  return store.tasks.length < before;
}

export function setTaskEnabled(id, enabled) {
  const store = load();
  const task = store.tasks.find((t) => t.id === id);
  if (task) {
    task.enabled = enabled;
    save(store);
  }
  return task;
}

export function dueTasks(now = new Date()) {
  return load().tasks.filter((t) => t.enabled && new Date(t.nextRun) <= now);
}

export function markRan(id, ranAt = new Date()) {
  const store = load();
  const task = store.tasks.find((t) => t.id === id);
  if (!task) return;
  task.lastRun = ranAt.toISOString();
  if (task.schedule.type === "once") {
    task.enabled = false;
  } else {
    task.nextRun = computeNextRun(task.schedule, ranAt).toISOString();
  }
  save(store);
}
