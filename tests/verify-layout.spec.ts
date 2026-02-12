import { test, expect } from '@playwright/test';

test('verify desktop layout grid properties', async ({ page }) => {
    // Navigate to local dev server
    await page.goto('http://localhost:5173/');

    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    // Wait for dashboard container
    const container = page.locator('.dashboard-container');
    await expect(container).toBeVisible();

    // Check grid layout (7 columns)
    await expect(container).toHaveCSS('display', 'grid');
    // Note: computed style might return pixels, so we check for 7 tracks or similar structure implicitly
    // A more robust check is grid-template-columns property value if not computed to px

    // Check Queue Section positioning (Left: col 1-4 = 3 cols wide)
    const queueSection = page.locator('.queue-section');
    await expect(queueSection).toHaveCSS('grid-column-start', '1');
    await expect(queueSection).toHaveCSS('grid-column-end', '4');

    // Check Action Center positioning (Right: col 4-8 = 4 cols wide)
    const actionCenter = page.locator('.action-center');
    await expect(actionCenter).toHaveCSS('grid-column-start', '4');
    await expect(actionCenter).toHaveCSS('grid-column-end', '8');

    // Check Banner positioning (Full width: col 1 to end)
    const banner = page.locator('.marketing-banner-section');
    await expect(banner).toHaveCSS('grid-column-start', '1');
    // expect 'grid-column-end' to be '-1' might verify as computed length. 
    // Usually span full width is visually checked, but let's check start at least.

    console.log('Grid layout properties verified successfully.');
});
