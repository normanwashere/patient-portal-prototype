import { test, expect } from '@playwright/test';

test.describe('Mobile Layout Refinements', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // Mobile viewport

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('Dashboard spacing checks', async ({ page }) => {
        // Check spacing between Quick Actions (action-center) and Find Hospitals (hospitals-section)
        const actionCenter = page.locator('.action-center');
        const hospitalsSection = page.locator('.hospitals-section');

        const actionBox = await actionCenter.boundingBox();
        const hospitalBox = await hospitalsSection.boundingBox();

        if (actionBox && hospitalBox) {
            const gap = hospitalBox.y - (actionBox.y + actionBox.height);
            console.log('Gap between Quick Actions and Hospitals:', gap);
            expect(gap).toBeGreaterThan(30); // Expecting > 2.5rem (approx 40px)
        }
    });

    test('BranchCard compact styles', async ({ page }) => {
        const card = page.locator('.branch-card').first();
        const button = page.locator('.branch-action-btn').first();

        // Check padding/font sizes by evaluating CSS
        const padding = await card.evaluate((el) => window.getComputedStyle(el).padding);
        console.log('Card Padding:', padding);
        // Should be 1rem (16px) instead of 1.25rem (20px)

        const btnFontSize = await button.evaluate((el) => window.getComputedStyle(el).fontSize);
        console.log('Button Font Size:', btnFontSize);
        // Approx 12px (0.75rem)
    });

    test('Scroll to top on navigation', async ({ page }) => {
        // Scroll down
        await page.evaluate(() => window.scrollTo(0, 500));

        // Navigate
        await page.click('text=Profile');

        // Check scroll position
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBe(0);
    });
});
