import { test, expect } from '@playwright/test';

const tenants = [
    {
        id: 'metroGeneral',
        name: 'Metro General',
        primary: 'rgb(2, 132, 199)', // #0284c7
        navActive: 'rgb(2, 132, 199)',
    },
    {
        id: 'meralcoWellness',
        name: 'Meralco Wellness',
        primary: 'rgb(249, 115, 22)', // #f97316
        navActive: 'rgb(249, 115, 22)',
    },
    {
        id: 'healthFirst',
        name: 'HealthFirst',
        primary: 'rgb(34, 197, 94)', // #22c55e
        navActive: 'rgb(34, 197, 94)',
    }
];

const viewports = [
    { name: 'Desktop', width: 1280, height: 800 },
    { name: 'Mobile', width: 375, height: 667 }
];

for (const tenant of tenants) {
    test.describe(`Tenant: ${tenant.name}`, () => {

        for (const vp of viewports) {
            test(`Visual Audit - ${vp.name}`, async ({ page }) => {
                // 1. Setup
                await page.setViewportSize({ width: vp.width, height: vp.height });
                await page.goto(`http://localhost:5173/?tenant=${tenant.id}`);

                // Wait for theme to apply
                await page.waitForTimeout(1000);

                // 2. Dashboard Checks
                console.log(`Checking Dashboard for ${tenant.name} on ${vp.name}...`);

                if (vp.name === 'Desktop') {
                    const activeLink = page.locator('.sidebar-item.active');
                    await expect(activeLink).toBeVisible();

                    // Check computed color
                    const color = await activeLink.evaluate((el) => {
                        return window.getComputedStyle(el).color;
                    });
                    console.log(`  Sidebar Active Color: ${color} (Expected: ${tenant.navActive})`);
                    expect(color).toBe(tenant.navActive);

                    // Check Logo (should be SVG)
                    const logo = page.locator('.sidebar-logo');
                    await expect(logo).toBeVisible();
                } else {
                    // Mobile Nav Checks
                    // The nav might not be immediately visible or have active state on load for Dashboard?
                    // Dashboard is the default route.
                    // Let's check for .mobile-nav existence
                    const nav = page.locator('.mobile-nav'); // Check your class name in Layout.tsx
                    if (await nav.count() > 0) {
                        // Check if any item is active
                        // If not, maybe navigate explicitly?
                    }
                }

                // 3. Appointment Booking Checks
                await page.goto(`http://localhost:5173/appointments/book?tenant=${tenant.id}`);
                await page.waitForTimeout(1000);

                // Check for 'pref-icon'
                const prefIcons = page.locator('.pref-icon');
                const count = await prefIcons.count();
                if (count > 0) {
                    // Check the first one (Location usually)
                    const firstIcon = prefIcons.first();
                    const iconColor = await firstIcon.evaluate((el) => {
                        return window.getComputedStyle(el).color;
                    });
                    console.log(`  Pref Icon Color: ${iconColor} (Expected: ${tenant.primary})`);
                    expect(iconColor).toBe(tenant.primary);
                } else {
                    console.log("  No pref icons found (maybe different booking step)");
                }

            });
        }
    });
}
