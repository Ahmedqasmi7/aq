import { chromium } from "playwright";
import { existsSync } from "node:fs";
const OUT = "/tmp/claude-0/-home-user-aq/fca6c751-545c-57dc-9ff6-72ac19980373/scratchpad/shots";
const launchOptions = existsSync("/opt/pw-browsers/chromium")
  ? { executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=swiftshader","--ignore-gpu-blocklist","--enable-webgl","--no-sandbox"] }
  : {};
const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/act1-slate.png` });
await browser.close();
