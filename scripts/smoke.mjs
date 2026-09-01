import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:3000";

const browser = await chromium.launch({ headless: true });
const errors = [];

async function run(name, fn) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  try {
    await fn(page);
    console.log(`ok  ${name}`);
  } catch (e) {
    console.error(`fail  ${name}: ${e.message}`);
    errors.push(`${name}: ${e.message}`);
  } finally {
    await page.close();
  }
}

await run("home", async (page) => {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /see where your money goes/i }).waitFor();
  if (!(await page.getByText("$804.00").count())) throw new Error("missing leftover preview");
  await page.getByText(/web tools are free/i).or(page.getByText(/full Excel and Google Sheets templates are paid/i)).first().waitFor();
  await page.getByRole("button", { name: /get the full spreadsheet/i }).first().waitFor();
});

await run("tools hub", async (page) => {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("navigation").getByRole("link", { name: "Tools", exact: true }).click();
  await page.waitForURL(/\/tools\/?$/);
  await page.getByRole("heading", { name: /free calculators\. pick one to start/i }).waitFor();
  await page.getByRole("link", { name: "Open free calculator" }).first().click();
  await page.waitForURL(/\/tools\/(debt-payoff|paycheck-budget|cash-flow)/);
});

await run("reviews page + leave one", async (page) => {
  await page.goto(`${base}/reviews`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /what people say/i }).waitFor();
  await page.getByText("Dana M.").waitFor();
  await page.getByRole("textbox", { name: "First name" }).fill("Alex");
  await page.getByRole("textbox", { name: "Email" }).fill("alex@example.com");
  await page.getByRole("textbox", { name: "Your review" }).fill(
    "I ran the paycheck leftover and finally trusted the number.",
  );
  await page.getByRole("button", { name: "Submit review" }).click();
  await page.getByText(/thank you, alex/i).waitFor();
  await page.getByRole("heading", { name: "Your review" }).waitFor();
});

await run("paycheck sample + email", async (page) => {
  await page.goto(`${base}/tools/paycheck-budget`, { waitUntil: "networkidle" });
  await page.getByText("$804.00").first().waitFor();
  await page.getByText("$199.00").first().waitFor();
  await page.getByRole("button", { name: "Email me my results" }).click();
  const dialog = page.getByRole("dialog", { name: "Email me my results" });
  await dialog.getByRole("textbox", { name: "Email" }).fill("alex@example.com");
  await dialog.getByRole("button", { name: "Email my results" }).click();
  await page.getByText(/you’re on the list/i).waitFor();
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByText(/like this result/i).waitFor();
  await page.getByRole("button", { name: /get the full spreadsheet — \$14/i }).waitFor();
});

await run("paycheck leftover updates", async (page) => {
  await page.goto(`${base}/tools/paycheck-budget`, { waitUntil: "networkidle" });
  const takeHome = page.locator("input").nth(0);
  await takeHome.click({ clickCount: 3 });
  await takeHome.fill("2000");
  await takeHome.blur();
  await page.getByText("$2,120.00").first().waitFor();
});

await run("debt sample numbers + avalanche", async (page) => {
  await page.goto(`${base}/tools/debt-payoff`, { waitUntil: "networkidle" });
  await page.getByText("September 2031").first().waitFor();
  await page.getByText("$4,590.63").first().waitFor();
  await page.getByRole("combobox").first().selectOption("avalanche");
  await page.getByText("$4,352.88").first().waitFor();
});

await run("cash flow negative month", async (page) => {
  await page.goto(`${base}/tools/cash-flow`, { waitUntil: "networkidle" });
  await page.getByText("Negative").first().waitFor();
  await page.getByRole("img", { name: /projected balance/i }).waitFor();
  await page.getByText(/like this result/i).waitFor();
});

await run("pricing unlock pro starts stripe", async (page) => {
  await page.goto(`${base}/pricing`, { waitUntil: "networkidle" });
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/checkout") && r.request().method() === "POST"),
    page.getByRole("button", { name: "Unlock Pro — $19" }).click(),
  ]);
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  const sentToStripe = page.url().includes("stripe.com") || String(data.url || "").includes("stripe.com");
  if (!sentToStripe && !data.error) throw new Error("Pro checkout did not start Stripe");
  if (!sentToStripe && data.error && !/stripe/i.test(data.error)) throw new Error(data.error);
});

await run("save plan when pro", async (page) => {
  await page.addInitScript(() => {
    localStorage.setItem("harbor.v1.pro", "true");
    localStorage.setItem("harbor.v1.purchases", JSON.stringify(["pro"]));
  });
  await page.goto(`${base}/tools/debt-payoff`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Save plan" }).click();
  await page.getByRole("textbox", { name: "Plan name" }).fill("Alex snowball");
  await page.getByRole("dialog").getByRole("button", { name: "Save", exact: true }).click();
  await page.getByText(/saved as/i).waitFor();
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByText("Alex snowball").waitFor();
  await page.getByText("Snowball vs Avalanche").waitFor();
});

await run("paid spreadsheet checkout + download", async (page) => {
  await page.goto(`${base}/spreadsheets`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /full spreadsheet templates — paid/i }).waitFor();
  await page.getByText("$29").first().waitFor();
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/checkout") && r.request().method() === "POST"),
    page.getByRole("button", { name: /get the full spreadsheet — \$14/i }).first().click(),
  ]);
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  const sentToStripe = page.url().includes("stripe.com") || String(data.url || "").includes("checkout.stripe.com");
  if (!sentToStripe && !data.error) throw new Error("Template checkout did not start Stripe");
  const free = await page.request.get(`${base}/spreadsheets/Paycheck-Budget-Bill-Tracker.xlsx`);
  if (free.status() === 200) throw new Error("xlsx should not be a free public file");
  const gated = await page.request.get(`${base}/api/download/paycheck-budget-tracker`);
  if (gated.status() === 200) throw new Error("download API must not serve unpaid files");
});

await run("restore page", async (page) => {
  await page.goto(`${base}/restore`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /already paid/i }).waitFor();
  await page.getByRole("textbox", { name: /email from your receipt/i }).fill("nobody@example.com");
  await page.getByRole("button", { name: /email me a restore link/i }).click();
  await page.getByText(/if we find a purchase/i).waitFor();
});

await run("cancel page", async (page) => {
  await page.goto(`${base}/cancel`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /no charge/i }).waitFor();
  await page.getByRole("link", { name: /back to templates/i }).waitFor();
});

await run("mobile nav", async (page) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("banner").getByRole("link", { name: "Paycheck Budget" }).click();
  await page.waitForURL(/paycheck-budget/);
  await page.getByText("$199.00").first().waitFor();
  await page.getByRole("button", { name: "See results" }).click();
});

await browser.close();
if (errors.length) {
  console.error("\nSMOKE FAILURES\n" + errors.join("\n"));
  process.exit(1);
}
console.log("\nall smoke checks passed");
