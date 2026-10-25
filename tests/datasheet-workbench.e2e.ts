import { expect, test, type Page, type Route } from "@playwright/test";
import { textLayerPdfBase64 } from "./fixtures/datasheets/text-layer-pdf";

interface PromptChunk {
  documentId: string;
  page: number;
  text: string;
  chunkHash: string;
}

function promptChunks(prompt: string): PromptChunk[] {
  const marker = prompt.lastIndexOf("Chunks: ");
  if (marker < 0) return [];
  const source = prompt.slice(marker + "Chunks: ".length).split("\nRepair the previous JSON once.")[0];
  return JSON.parse(source) as PromptChunk[];
}

function extraction(prompt: string) {
  const chunks = promptChunks(prompt);
  const source = chunks.find(({ text }) => text.includes("Capacitance")) ?? chunks[0];
  const orderingCode = prompt.match(/Selected Ordering Code: ([^.]+)\./)?.[1] ?? "GRM188R71H104KA93D";
  return {
    version: 1,
    document: {
      documentId: source.documentId,
      fileName: "public-mlcc.pdf",
      sha256: source.documentId,
      title: "Fixture MLCC Datasheet",
    },
    componentKind: "mlcc",
    selectedOrderingCode: orderingCode,
    part: {
      manufacturer: "Fixture Components",
      family: "GRM",
      orderingCode,
      specifications: [{
        field: "capacitance",
        rawValue: "0.1 uF",
        normalized: { typical: 1e-7, unit: "F" },
        category: "typical",
        conditions: [],
        evidence: [{
          documentId: source.documentId,
          page: source.page,
          quote: source.text,
          chunkHash: source.chunkHash,
        }],
        status: "extracted",
      }],
    },
    missingFields: [],
  };
}

async function mockRelay(route: Route) {
  const body = route.request().postDataJSON() as { operation: string; prompt: string };
  const data = body.operation === "connect"
    ? { ok: true }
    : body.operation === "discover"
      ? { options: [{ orderingCode: "GRM188R71H104KA93D", manufacturer: "Fixture Components", componentKind: "mlcc" }] }
      : extraction(body.prompt);
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data }) });
}

async function uploadPdf(page: Page, label: string) {
  await page.getByLabel(label).setInputFiles({
    name: "public-mlcc.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(textLayerPdfBase64, "base64"),
  });
}

test("mocked provider completes quick read and a non-direct replacement report", async ({ page }) => {
  await page.route("**/api/datasheet/relay", mockRelay);
  const response = await page.goto("/en/tools/datasheet-workbench/app");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("tab", { name: "Quick read", selected: true })).toBeVisible();

  await page.getByLabel("Model", { exact: true }).fill("fixture-model");
  await page.getByLabel("API key", { exact: true }).fill("browser-memory-only-key");
  await page.getByRole("button", { name: "Test connection" }).click();
  await expect(page.getByText("Connection verified")).toBeVisible();

  await uploadPdf(page, "Original datasheet PDF");
  await expect(page.getByText(/2 pages/)).toBeVisible();
  await page.getByLabel("Component type").selectOption("mlcc");
  await page.getByRole("button", { name: "Find exact part numbers" }).click();
  await page.getByLabel("Exact Ordering Code").selectOption("GRM188R71H104KA93D");
  await page.getByRole("button", { name: "Analyze datasheet" }).click();
  await expect(page.getByRole("heading", { name: "GRM188R71H104KA93D" })).toBeVisible();
  await page.getByRole("button", { name: "Show sources (1)" }).first().click();
  await page.getByRole("button", { name: /View PDF page/ }).first().click();
  await expect(page.getByLabel(/PDF page/)).toBeVisible();

  await page.getByRole("tab", { name: "Replacement check" }).click();
  await uploadPdf(page, "Original datasheet PDF");
  await expect(page.getByText(/2 pages/)).toHaveCount(1);
  await uploadPdf(page, "Candidate datasheet PDF");
  await expect(page.getByText(/2 pages/)).toHaveCount(2);
  const types = page.getByLabel("Component type");
  await types.nth(0).selectOption("mlcc");
  await types.nth(1).selectOption("mlcc");
  await page.getByRole("button", { name: "Find exact part numbers" }).click();
  const orderingCodes = page.getByLabel("Exact Ordering Code");
  await orderingCodes.nth(0).selectOption("GRM188R71H104KA93D");
  await orderingCodes.nth(1).selectOption("GRM188R71H104KA93D");
  await page.getByRole("button", { name: "Analyze datasheet" }).click();
  await expect(page.getByRole("heading", { name: "Work conditions" })).toBeVisible();

  await page.getByLabel("Ripple current", { exact: true }).fill("1 A");
  await page.getByRole("button", { name: "Evaluate replacement" }).click();
  await expect(page.getByText("? Evidence incomplete")).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Markdown" }).click();
  await expect((await download).suggestedFilename()).toBe("datasheet-replacement.md");
});

test("primary datasheet controls fit a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/en/tools/datasheet-workbench/app");
  await expect(page.getByRole("tab", { name: "Quick read" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Replacement check" })).toBeVisible();
  await expect(page.locator(".datasheet-provider-panel select").first()).toBeVisible();
  await expect(page.getByLabel("API key", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Original datasheet PDF")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
