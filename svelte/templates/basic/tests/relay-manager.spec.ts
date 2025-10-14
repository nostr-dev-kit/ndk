import { test, expect } from "@playwright/test";

test.describe("Relay Manager", () => {
    test("should display relay manager with default relays", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("button", { name: /relays/i }).click();

        await expect(page.locator("text=Relay Manager")).toBeVisible();

        // Should show at least one relay
        await expect(page.locator("text=wss://relay")).toBeVisible();
    });

    test("should show relay status badges", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("button", { name: /relays/i }).click();

        // Should show status badges (Connected, Connecting, or Disconnected)
        await expect(
            page.locator("text=Connected").or(page.locator("text=Connecting")).or(page.locator("text=Disconnected")),
        ).toBeVisible();
    });

    test("should have input for adding new relay", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("button", { name: /relays/i }).click();

        const input = page.locator('input[placeholder*="relay"]');
        await expect(input).toBeVisible();

        const addButton = page.getByRole("button", { name: /add relay/i });
        await expect(addButton).toBeVisible();
    });

    test("should validate relay URL format", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("button", { name: /relays/i }).click();

        const input = page.locator('input[placeholder*="relay"]');
        const addButton = page.getByRole("button", { name: /add relay/i });

        // Button should be disabled when input is empty
        await expect(addButton).toBeDisabled();

        // Type a relay URL
        await input.fill("wss://relay.example.com");

        // Button should now be enabled
        await expect(addButton).toBeEnabled();
    });

    test("should show remove buttons for relays", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("button", { name: /relays/i }).click();

        // Should have at least one remove button
        const removeButtons = page.getByRole("button", { name: /remove/i });
        await expect(removeButtons.first()).toBeVisible();
    });
});
