import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
    test("should load the home page", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("h1")).toContainText("Welcome to NDK Template");
    });

    test("should show header with correct elements", async ({ page }) => {
        await page.goto("/");

        // Check for logo/title
        await expect(page.locator("header")).toContainText("NDK Template");

        // Check for relay status
        await expect(page.locator("header")).toContainText("relays");

        // Check for login button
        await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
    });

    test("should show relay manager when clicking relays button", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("button", { name: /relays/i }).click();

        // Should show relay manager dialog
        await expect(page.locator("text=Relay Manager")).toBeVisible();

        // Should show relay list
        await expect(page.locator("text=wss://")).toBeVisible();
    });

    test("should show account switcher when clicking login", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("button", { name: /login/i }).click();

        // Should show account management dialog
        await expect(page.locator("text=Account Management")).toBeVisible();

        // Should show login options
        await expect(page.getByRole("button", { name: /NIP-07/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /Private Key/i })).toBeVisible();
    });

    test("should close dialogs when clicking close button", async ({ page }) => {
        await page.goto("/");

        // Open account switcher
        await page.getByRole("button", { name: /login/i }).click();
        await expect(page.locator("text=Account Management")).toBeVisible();

        // Close it
        await page.getByRole("button", { name: /close/i }).click();
        await expect(page.locator("text=Account Management")).not.toBeVisible();
    });

    test("should switch between login modes", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("button", { name: /login/i }).click();

        // Default should be NIP-07
        await expect(page.locator("text=Login with Extension")).toBeVisible();

        // Switch to private key mode
        await page.getByRole("button", { name: /private key/i }).click();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.getByRole("button", { name: /Login with Private Key/i })).toBeVisible();
    });
});
