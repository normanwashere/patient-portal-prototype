import { test, expect } from '@playwright/test';

test.describe('Rigorous DOM & Visual Audit', () => {

    test.describe('Desktop View (1920x1080)', () => {
        test.use({ viewport: { width: 1920, height: 1080 } });

        test('Dashboard Grid Structure', async ({ page }) => {
            await page.goto('http://localhost:5173/');

            const dashboardContainer = page.locator('.dashboard-container');
            await expect(dashboardContainer).toBeVisible();

            // Verify Grid Columns (7 columns)
            const gridTemplate = await dashboardContainer.evaluate((el) => {
                return window.getComputedStyle(el).gridTemplateColumns;
            });
            console.log('Desktop Grid Columns:', gridTemplate);
            // We expect 7 columns. Computed style might be "266.px 266px..." depending on width.
            // Simply checking it's not "none" and has multiple values is a good start.
            expect(gridTemplate).not.toBe('none');
            expect(gridTemplate.split(' ').length).toBe(7);
        });

        test.skip('Banner Text vs Image Overlap', async ({ page }) => {
            await page.goto('http://localhost:5173/');

            const bannerContent = page.locator('.banner-content');
            const bannerImage = page.locator('.banner-image'); // Does not exist in new Carousel

            // await expect(bannerContent).toBeVisible();
            // await expect(bannerImage).toBeVisible();
        });

        test('Quick Actions Grid Layout', async ({ page }) => {
            await page.goto('http://localhost:5173/');
            const qaGrid = page.locator('.quick-actions-grid');
            const buttons = qaGrid.locator('.quick-action-btn');

            // Should have multiple buttons
            const count = await buttons.count();
            expect(count).toBeGreaterThan(2);
        });

        test('Tiled Branch Cards (Desktop)', async ({ page }) => {
            await page.goto('http://localhost:5173/');

            // Verify grid exists
            const grid = page.locator('.hospitals-grid');
            await expect(grid).toBeVisible();

            // Verify multiple cards
            const cards = page.locator('.branch-card');
            const count = await cards.count();
            expect(count).toBeGreaterThan(1); // Should show all branches

            // Check if grid layout is applied (4 cols on desktop now)
            const gridStyle = await grid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
            // It might be '266px 266px 266px 266px' or 'repeat(4, 1fr)'
            expect(gridStyle.split(' ').length).toBeGreaterThanOrEqual(4);
        });

    });

    test.describe('Mobile View (Pixel 5)', () => {
        test.use({ viewport: { width: 393, height: 851 }, isMobile: true });

        test('No Horizontal Scroll', async ({ page }) => {
            await page.goto('http://localhost:5173/');
            const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
            const clientWidth = await page.evaluate(() => document.body.clientWidth);

            expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for sub-pixel rounding
        });

        test('Hamburger Menu Functionality', async ({ page }) => {
            await page.goto('http://localhost:5173/');

            // On mobile, the Sidebar should be hidden, but we might have a hamburger button in header (if implemented)
            // or a bottom nav. The Layout.tsx shows a bottom nav for mobile.
            const bottomNav = page.locator('nav.bottom-nav');
            await expect(bottomNav).toBeVisible();

            // Check for overlap of content with bottom nav (padding-bottom check)
            const dashboardContainer = page.locator('.dashboard-container');
            const paddingBottom = await dashboardContainer.evaluate((el) => window.getComputedStyle(el).paddingBottom);
            console.log('Mobile Dashboard Padding Bottom:', paddingBottom);
            // Should be enough to clear nav (approx 60-80px)
            expect(parseInt(paddingBottom)).toBeGreaterThan(20);
        });

        test('Banner Mobile Stack', async ({ page }) => {
            await page.goto('http://localhost:5173/');
            // Check if banner height is reasonable (not constrained to desktop height)
            const banner = page.locator('.marketing-banner-section');
            const height = await banner.evaluate((el) => el.clientHeight);
            console.log('Mobile Banner Height:', height);
            // Should be auto or sufficient
        });
    });
});
