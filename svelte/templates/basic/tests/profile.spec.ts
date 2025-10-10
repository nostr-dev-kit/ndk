import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
    const testPubkey = '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2'; // Jack Dorsey's pubkey

    test('should load profile page with hex pubkey', async ({ page }) => {
        await page.goto(`/p/${testPubkey}`);

        // Should show loading state first
        await expect(page.locator('text=Loading profile...')).toBeVisible();

        // Wait for profile to load (with timeout)
        await expect(page.locator('text=Loading profile...')).not.toBeVisible({ timeout: 10000 });
    });

    test('should display profile information when loaded', async ({ page }) => {
        await page.goto(`/p/${testPubkey}`);

        // Wait for profile to load
        await page.waitForSelector('h1', { timeout: 15000 });

        // Should have a profile name or anonymous
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();

        // Should show pubkey
        await expect(page.locator(`text=${testPubkey}`)).toBeVisible();
    });

    test('should show notes section', async ({ page }) => {
        await page.goto(`/p/${testPubkey}`);

        // Wait for profile to load
        await page.waitForSelector('h1', { timeout: 15000 });

        // Should have notes section
        await expect(page.locator('text=Notes')).toBeVisible();
    });

    test('should handle invalid pubkey gracefully', async ({ page }) => {
        await page.goto('/p/invalid-pubkey-123');

        // Should show error or not found message
        await expect(page.locator('text=Profile Not Found').or(page.locator('text=Could not load'))).toBeVisible({ timeout: 10000 });
    });
});
