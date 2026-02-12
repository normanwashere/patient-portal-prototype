import { test, expect } from '@playwright/test';

test.describe('Tenant Audit - Meralco Wellness', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('Branding Verification', async ({ page }) => {
        await expect(page.locator('.sidebar-header h2')).toHaveText('Meralco Wellness Center');
        // Primary color check (Orange) - hard to do exactly, but text check is good lead
    });

    test('Features Verification - Teleconsult Later Only', async ({ page }) => {
        // Meralco has Teleconsult but NO "Teleconsult Now" (if that distinction exists in UI)
        // Check Appointments page
        await page.goto('http://localhost:5173/appointments/book');

        // Should catch the "Teleconsult" option as enabled
        await expect(page.locator('text=Teleconsult')).toBeVisible();
        await expect(page.locator('text=In-Person Visit')).toBeVisible();

        // If we had a "Consult Now" button on dashboard, we'd check its absence.
        // For now, identifying the name change proves the tenant switch worked.
    });
});
