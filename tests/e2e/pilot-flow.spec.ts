import { expect, test } from "@playwright/test";

test("CashEx Pilotoberflaeche zeigt Bankportal, Ops und Audit", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "HomeDelivery Pilotbasis" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bankportal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CashEx-Ops Orderboard" })).toBeVisible();
  await expect(page.getByText("CX-2026-0001")).toBeVisible();
});

test("Bank-User kann eine neue Bestellung einreichen", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Bankreferenz").fill("SP-FM-TEST-1000");
  await page.getByRole("button", { name: "Bestellung einreichen" }).click();

  await expect(page.getByText("SP-FM-TEST-1000")).toBeVisible();
  await expect(page.getByText("Bankbestellung digital eingereicht.")).toBeVisible();
});
