import { test, expect } from '@playwright/test';

test.describe('Appointment Booking Flow', () => {
    test('Renaming Verification', async ({ page }) => {
        await page.goto('http://localhost:5173/');

        // Sidebar link - Changed to "Book Appointment"
        const link = page.locator('a[href="/appointments/book"]').filter({ hasText: 'Book Appointment' });
        await expect(link).toBeVisible();

        // Scroll to bottom to ensure branch cards are rendered/visible
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const dashboardBtn = page.locator('.branch-action-btn.primary').first();
        await expect(dashboardBtn).toBeVisible();
        await expect(dashboardBtn).toContainText('Book In-Person Visit');
    });

    test('Booking Path A: Type -> Location -> Specialty -> Doctor', async ({ page }) => {
        await page.goto('http://localhost:5173/appointments/book');

        // Step 0: Type Selection (since we went via URL without state)
        await expect(page.locator('h2')).toContainText('Book Appointment');
        await expect(page.locator('text=Select Appointment Type')).toBeVisible();
        await page.click('text=In-Person Visit');

        // Wait for preference cards
        await expect(page.locator('.preference-cards')).toBeVisible();

        // Step 1: Preference - By Location
        await page.click('text=By Location');
        await expect(page.locator('.list-grid')).toBeVisible();

        // Step 2: Select Location (First one)
        await page.locator('.selection-card').first().click();

        // Step 3: Select Specialty (Context banner check)
        await expect(page.locator('.context-banner')).toBeVisible();
        await page.locator('.specialty-card').first().click();

        // Step 4: Select Doctor
        await expect(page.locator('.doctor-list')).toBeVisible();
        await page.locator('.doctor-card').first().click();

        // Step 5: Date/Time
        await expect(page.locator('.datetime-section')).toBeVisible();

        // Ensure buttons are clickable
        await page.locator('.date-card').first().waitFor({ state: 'visible' });
        await page.locator('.date-card').first().click();

        await page.locator('.time-card').first().waitFor({ state: 'visible' });
        await page.locator('.time-card').first().click();

        await page.click('text=Review Booking');

        // Step 6: Confirm
        await expect(page.locator('.confirm-card')).toBeVisible();
        await page.click('text=Confirm Booking');

        // Success
        await expect(page.locator('.success-content')).toBeVisible();
    });

    test('Booking Path B: Type -> Specialty -> Location -> Doctor', async ({ page }) => {
        await page.goto('http://localhost:5173/appointments/book');

        // Step 0: Type Selection
        await page.click('text=In-Person Visit');

        // Step 1: Preference - By Specialty
        await page.click('text=By Specialization');

        // Step 2: Select Specialty
        await page.locator('.specialty-card').first().click();

        // Step 3: Select Location
        await expect(page.locator('.context-banner')).toContainText('For');
        await page.locator('.selection-card').first().click();

        // Step 4: Doctor ...
        await expect(page.locator('.doctor-card')).toBeVisible();
    });

    test('Booking from Dashboard Branch Card', async ({ page }) => {
        await page.goto('http://localhost:5173/');

        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Click "Book In-Person Visit" on first card
        // This button in BranchCard likely navigates with State { locationId: ... } ?
        // Let's check BranchCard implementation. It navigates to '/appointments/book' with state { locationId: branch.id }
        // My AppointmentBooking logic says: if locationId provided, setBookingType('in-person') and Step='secondary'.
        // So it should SKIP Type Selection.

        await page.locator('.branch-action-btn.primary').first().click();

        // Should skip to Specialty selection (Step 3 equivalent), with banner
        await expect(page.url()).toContain('/appointments/book');
        await expect(page.locator('.context-banner')).toContainText('At'); // "At Metro Hospital Main"
        // Should NOT see Type Selection
        await expect(page.locator('text=Select Appointment Type')).not.toBeVisible();
    });

    test('Teleconsult Flow: Correct Title & No Location', async ({ page }) => {
        // Navigate via Sidebar
        await page.goto('http://localhost:5173/');
        await page.getByText('Care').click();

        // Click specifically the link in the sidebar
        await page.locator('.sidebar-nav .nav-group#care a').filter({ hasText: 'Teleconsult' }).click();

        // Verify Title
        await expect(page.locator('h2')).toContainText('New Teleconsult Appointment');

        // Verify Preference Cards (Location should be hidden)
        await expect(page.locator('.preference-cards')).toBeVisible();
        await expect(page.locator('.pref-icon.location')).not.toBeVisible();
        await expect(page.locator('.pref-icon.specialty')).toBeVisible();

        // Proceed
        await page.click('text=By Specialization');

        // Select Specialty -> Should skip Location -> Go to Doctor
        await page.locator('.specialty-card').first().click();

        // Expect Doctor List (NOT Location list)
        await expect(page.locator('.doctor-list')).toBeVisible();

        // Complete
        await page.locator('.doctor-card').first().click();
        await page.locator('.date-card').first().click();
        await page.locator('.time-card').first().click();
        await page.click('text=Review Booking');

        // Confirm
        await expect(page.locator('.confirm-card')).toContainText('Teleconsult (Video Call)');
    });
});
