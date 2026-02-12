import { test, expect } from '@playwright/test';

test.describe('Appointment Booking Redesign', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('Full booking flow with redesign elements', async ({ page }) => {
        // Click Book Appointment
        await page.click('text=Book Appointment');

        // Type Selection
        await expect(page.locator('text=In-Person Visit')).toBeVisible();
        await page.click('text=In-Person Visit');

        // Preference
        await page.click('text=By Specialization');

        // Primary (Spec)
        await page.click('text=General Medicine');

        // Secondary (Loc)
        await page.click('.selection-card >> nth=0');

        // Doctor Selection
        await expect(page.locator('.doctor-card').first()).toBeVisible();
        await page.click('.doctor-card >> nth=0');

        // Datetime Step (Redesigned)
        // Check for Bio
        await expect(page.locator('.doc-bio')).toBeVisible();

        // Check for Progress Bar
        await expect(page.locator('.progress-bar-fill')).toBeVisible();

        // Select Date (Find one that is not full)
        const availableDate = page.locator('.date-card:not(.full)').first();
        await availableDate.click();

        // Select Time
        const timeSlot = page.locator('.time-card').first();
        await timeSlot.click();

        // Review Booking
        await page.click('text=Review Booking');

        // Confirm
        await expect(page.locator('text=Confirm Appointment')).toBeVisible();
        await page.click('text=Confirm Booking');

        // Success
        await expect(page.locator('text=Booking Confirmed!')).toBeVisible();
    });
});
