import { test, expect } from '@playwright/test';

test.describe('Tenant Audit - HealthFirst Clinic', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('Branding Verification', async ({ page }) => {
        await expect(page.locator('.sidebar-header h2')).toHaveText('HealthFirst Clinic');
    });

    test('Features Verification - NO Teleconsult', async ({ page }) => {
        // HealthFirst has NO Teleconsult
        await page.goto('http://localhost:5173/appointments/book');

        // "Teleconsult" option should NOT be visible
        // We expect only "In-Person Visit" or similar, or at least NO "Teleconsult" text in the specialized selection
        await expect(page.locator('text=Teleconsult')).not.toBeVisible();
        await expect(page.locator('text=In-Person Visit')).toBeVisible();
    });
});
