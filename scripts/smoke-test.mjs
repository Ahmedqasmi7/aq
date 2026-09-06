import { existsSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3100";

// Some sandboxed environments pre-install Chromium at a fixed path with a
// software GL renderer; everywhere else, let Playwright use its own managed
// browser (installed via `npx playwright install`).
const SANDBOXED_CHROMIUM = "/opt/pw-browsers/chromium";
const launchOptions = existsSync(SANDBOXED_CHROMIUM)
  ? {
      executablePath: SANDBOXED_CHROMIUM,
      args: ["--use-gl=swiftshader", "--ignore-gpu-blocklist", "--enable-webgl", "--no-sandbox"],
    }
  : {};
const ROUTES = [
  "/",
  "/why-velario",
  "/about",
  "/bundle",
  "/business-inquiry",
  "/help",
  "/order-confirmation",
  "/this-route-does-not-exist",
];

const IGNORABLE = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
];

async function main() {
  const browser = await chromium.launch(launchOptions);
  const results = [];

  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !IGNORABLE.some((re) => re.test(msg.text()))) {
        errors.push(`console.error: ${msg.text()}`);
      }
    });
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("requestfailed", (req) => {
      const failure = req.failure();
      if (failure && !req.url().includes("chrome-extension")) {
        errors.push(`requestfailed: ${req.url()} — ${failure.errorText}`);
      }
    });

    let status = null;
    try {
      const resp = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 20000 });
      status = resp?.status() ?? null;
      await page.waitForTimeout(1200);

      const canvasCount = await page.locator("canvas").count();
      const webglLost = await page.evaluate(() => {
        const canvases = Array.from(document.querySelectorAll("canvas"));
        return canvases.some((c) => {
          const ctx = c.getContext("webgl2") || c.getContext("webgl");
          return Boolean(ctx?.isContextLost());
        });
      });

      results.push({ route, status, canvasCount, webglLost, errors });
    } catch (e) {
      results.push({ route, status, canvasCount: 0, webglLost: null, errors: [...errors, `navigation error: ${e.message}`] });
    } finally {
      await page.close();
    }
  }

  // Cart flow smoke test on home page
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(1000);

    // scroll to acquisition section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    let cartFlowOk = false;
    let cartError = null;
    try {
      const addBtn = page.getByRole("button", { name: /Acquire Flacon/i });
      await addBtn.waitFor({ state: "visible", timeout: 10000 });
      await addBtn.click();
      await page.waitForTimeout(500);
      const badge = page.locator(".velario-nav__badge");
      await badge.waitFor({ state: "visible", timeout: 5000 });
      const badgeText = await badge.textContent();
      cartFlowOk = badgeText?.trim() === "1";
    } catch (e) {
      cartError = e.message;
    }

    results.push({ route: "CART_FLOW", status: cartFlowOk ? "OK" : "FAIL", canvasCount: 0, webglLost: false, errors: cartError ? [cartError, ...errors] : errors });
    await page.close();
  }

  // Business inquiry form smoke test
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(`${BASE}/business-inquiry`, { waitUntil: "networkidle", timeout: 20000 });
    let formOk = false;
    let formError = null;
    try {
      await page.getByLabel("Company Name").fill("Test Co");
      await page.getByLabel("Contact Name").fill("Jane Doe");
      await page.getByLabel("Email").fill("jane@example.com");
      await page.getByLabel("Estimated Quantity").fill("500 units");
      await page.getByLabel("Message").fill("This is a smoke test inquiry message.");
      await page.getByRole("button", { name: /Submit Inquiry/i }).click();
      await page.getByText("Received.").waitFor({ timeout: 10000 });
      formOk = true;
    } catch (e) {
      formError = e.message;
    }
    results.push({ route: "BUSINESS_INQUIRY_FORM", status: formOk ? "OK" : "FAIL", canvasCount: 0, webglLost: false, errors: formError ? [formError, ...errors] : errors });
    await page.close();
  }

  await browser.close();

  console.log(JSON.stringify(results, null, 2));

  const hadFailures = results.some((r) => r.errors.length > 0 || r.status === "FAIL" || (typeof r.status === "number" && r.status >= 400 && r.route !== "/this-route-does-not-exist"));
  process.exit(hadFailures ? 1 : 0);
}

main();
