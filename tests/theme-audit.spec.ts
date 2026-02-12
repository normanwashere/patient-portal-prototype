import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Theme & Visual Audit', () => {
    const tenants = [
        { id: 'metroGeneral', name: 'Metro General Hospital', type: 'blue' },
        { id: 'meralcoWellness', name: 'Meralco Wellness Center', type: 'orange' },
        { id: 'healthFirst', name: 'HealthFirst Clinic', type: 'green' },
    ];

    test('should switch themes and update primary styles', async ({ page }) => {
        // 1. Initial Load & Login
        await page.goto('http://localhost:5173/');

        // Handle Login if redirected
        // Wait a bit to see if we are on login
        try {
            const loginCard = page.locator('.org-card').first();
            await loginCard.waitFor({ state: 'visible', timeout: 3000 });
            if (await loginCard.isVisible()) {
                console.log('Logging in as Metro General...');
                await loginCard.click();
            }
        } catch (e) {
            console.log('Already logged in or no login card found');
        }

        await page.waitForSelector('.sidebar');

        if (!fs.existsSync('audit-results')) {
            fs.mkdirSync('audit-results');
        }

        for (const tenant of tenants) {
            console.log(`Testing Tenant: ${tenant.name}`);

            // 2. Switch Tenant via DemoControls
            await page.click('.demo-toggle-fab');
            await page.waitForSelector('.demo-panel', { state: 'visible' });

            // Find the opt with the correct tenant id or just matching by index/click
            // The opts are in a grid. We can use a locator that filters by text or just the opt class
            const tenantOpt = page.locator(`.tenant-opt`).filter({ hasText: tenant.name.split(' ')[0] });
            await tenantOpt.click();

            // Close panel (optional or will close on next toggle, but better to close to avoid blocking)
            await page.click('.demo-toggle-fab');
            await page.waitForSelector('.demo-panel', { state: 'hidden' });

            // 3. Wait for Theme Update
            await page.waitForTimeout(1000); // Allow React state to flush

            // 4. Verify Sidebar "Active" Item Color
            console.log('Searching for active sidebar item...');
            const homeLink = page.locator('a[href="/"].active, .sidebar-item.active, a:has-text("Home")').first();

            if (await homeLink.count() === 0) {
                console.log('No active link found with initial selectors. Current URL:', page.url());
                // Try getting all links to see what we have
                const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.getAttribute('href'), class: a.className })));
                console.log('Available links:', JSON.stringify(links, null, 2));
            }

            await expect(homeLink).toBeVisible({ timeout: 5000 });
            console.log('Found active link.');

            const computedStyle = await homeLink.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return {
                    color: style.color,
                    backgroundColor: style.backgroundColor,
                    display: style.display,
                    visibility: style.visibility
                };
            });

            console.log(`Tenant ${tenant.id} Active Styles:`, JSON.stringify(computedStyle));
            const computedColor = computedStyle.color;

            // Parse RGB
            const rgb = computedColor.match(/\d+/g)?.map(Number);
            if (!rgb) {
                console.error(`Could not parse RGB color: ${computedColor}`);
                throw new Error('Could not parse RGB color');
            }
            const [r, g, b] = rgb;

            console.log(`RGB values - R: ${r}, G: ${g}, B: ${b}`);

            // 5. Verify Color Identity
            if (tenant.type === 'orange') {
                expect(r).toBeGreaterThan(200); // High Red
            } else if (tenant.type === 'green') {
                expect(g).toBeGreaterThan(150); // High Green
            } else if (tenant.type === 'blue') {
                expect(b).toBeGreaterThan(150); // High Blue
            }

            // 6. Screenshot
            console.log(`Saving screenshot for ${tenant.id}...`);
            await page.screenshot({ path: `audit-results/theme-${tenant.id}.png` });
            console.log('Saved.');
        }
    });

    test('should check for layout consistency across tenants', async ({ page }) => {
        await page.goto('http://localhost:5173/');
        // Perform login check here too if needed, but the first test handles the flow mostly.
        // Actually, tests run in isolation context usually? Playwright defaults to new context per test.
        // So we need login here too or use global setup.
        // For now, let's just add the login block here too if it fails.
        // But layout check might not need login if it checks public page? No, dashboard is protected.

        try {
            const loginCard = page.locator('.org-card').first();
            await loginCard.waitFor({ state: 'visible', timeout: 2000 });
            if (await loginCard.isVisible()) {
                await loginCard.click();
            }
        } catch (e) { }

        await page.waitForSelector('.sidebar');

        // Check for horizontal scroll (mobile layout issue regression)
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);

        if (viewportWidth < 768) {
            expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
        }
    });
});
