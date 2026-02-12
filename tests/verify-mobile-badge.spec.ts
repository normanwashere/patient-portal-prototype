import { test, expect } from '@playwright/test';

test('Mobile Header Badge Verification', async ({ page }) => {
    // Set viewport to mobile to trigger layout change
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');

    // Check header visibility
    const mobileHeader = page.locator('.app-header.mobile-only');
    await expect(mobileHeader).toBeVisible();

    // Check for Bell icon in header
    const bellLink = mobileHeader.locator('a[href="/notifications"]'); // Adjust selector if needed
    await expect(bellLink).toBeVisible();

    // Check for Badge overlay
    const badge = bellLink.locator('.nav-badge-overlay');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('2');
});
