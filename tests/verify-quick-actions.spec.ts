import { test, expect } from '@playwright/test';

test.describe('Quick Actions Verification', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('Top 6 Quick Actions are present and navigate correctly', async ({ page }) => {
        // 1. Book Appointment
        await page.click('text=Book Appointment');
        await expect(page).toHaveURL(/\/appointments\/book/);
        await page.goto('http://localhost:5173');

        // 2. Lab Results
        await page.click('text=Lab Results');
        await expect(page).toHaveURL(/\/results/);
        await page.goto('http://localhost:5173');

        // 3. Medications
        await page.click('text=Medications');
        await expect(page).toHaveURL(/\/medications/);
        await page.goto('http://localhost:5173');

        // 4. Billing
        await page.click('text=Billing');
        await expect(page).toHaveURL(/\/billing/);
        await page.goto('http://localhost:5173');

        // 5. HMO Benefits (if visible, assumes tenant feature is on)
        if (await page.isVisible('text=HMO Benefits')) {
            await page.click('text=HMO Benefits');
            await expect(page).toHaveURL(/\/benefits/);
            await page.goto('http://localhost:5173');
        }

        // 6. Vaccines
        await page.click('text=Vaccines');
        await expect(page).toHaveURL(/\/immunization/);
    });

    test('Old actions are removed', async ({ page }) => {
        const quickActions = page.locator('.quick-actions-grid');
        // Check only within quick actions grid to avoid finding text in Sidebar/Drawer
        await expect(quickActions.locator('text=Clinic Visit')).not.toBeVisible();
        await expect(quickActions.locator('text=Profile')).not.toBeVisible();
        await expect(quickActions.locator('text=Forms')).not.toBeVisible();
    });

    test('Notification badge is visible in Sidebar', async ({ page }) => {
        // Sidebar is hidden on mobile, so we need to ensure we are on desktop
        // Quick Actions test runs on default viewport (1280x720) which is Desktop.

        // Check for Notification Link in Sidebar
        const notificationLink = page.locator('aside.sidebar a[href="/notifications"]'); // More specific selector
        await expect(notificationLink).toBeVisible();

        // Check for Badge
        const badge = notificationLink.locator('.nav-badge-overlay');
        await expect(badge).toBeVisible();
        await expect(badge).toHaveText('2');
    });
});
