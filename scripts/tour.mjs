import { chromium } from "playwright";
import { existsSync } from "node:fs";

const OUT = "/tmp/claude-0/-home-user-aq/fca6c751-545c-57dc-9ff6-72ac19980373/scratchpad/shots";
const launchOptions = existsSync("/opt/pw-browsers/chromium")
  ? {
      executablePath: "/opt/pw-browsers/chromium",
      args: ["--use-gl=swiftshader", "--ignore-gpu-blocklist", "--enable-webgl", "--no-sandbox"],
    }
  : {};

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/tour-01-home-act1.png` });

for (const [name, frac] of [
  ["tour-02-home-act2", 0.2],
  ["tour-03-home-act3", 0.48],
  ["tour-04-home-act4", 0.7],
  ["tour-05-home-act5", 0.97],
]) {
  await page.evaluate((f) => window.scrollTo({ top: document.body.scrollHeight * f }), frac);
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

for (const [name, route] of [
  ["tour-06-why-velario", "/why-velario"],
  ["tour-07-about", "/about"],
  ["tour-08-bundle", "/bundle"],
  ["tour-09-help", "/help"],
]) {
  await page.goto(`http://localhost:3100${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

await browser.close();
console.log("done");
