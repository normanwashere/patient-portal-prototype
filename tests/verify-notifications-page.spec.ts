import { test, expect } from '@playwright/test';

test('Notifications Page Logic Verification', async ({ page }) => {
    await page.goto('http://localhost:5173/notifications');

    // 1. Check for Headers
    await expect(page.locator('h2', { hasText: 'Notifications' })).toBeVisible();

    // 2. Check for Sections (assuming mock data has 2 unread and 1 read)
    // "New" section should be visible
    await expect(page.locator('h3', { hasText: 'New' })).toBeVisible();
    // "Earlier" section should be visible
    await expect(page.locator('h3', { hasText: 'Earlier' })).toBeVisible();

    // 3. Check for specific cards
    // Unread card
    const unreadCard = page.locator('.notification-card.unread').first();
    await expect(unreadCard).toBeVisible();

    // Read card
    const readCard = page.locator('.notification-card.read').first();
    await expect(readCard).toBeVisible();

    // 5. Verify Redirection (using seeded data)
    // Find "Lab Results Ready" which links to /results
    const resultsNotif = page.locator('div.notification-card', { hasText: 'Lab Results Ready' });
    await expect(resultsNotif).toBeVisible();
    await resultsNotif.click();
    await expect(page).toHaveURL(/\/results/);

    // Go back to check seeding
    await page.goto('http://localhost:5173/notifications');
    // Check for "Bill Generated" which links to /billing (from new seed)
    const billNotif = page.locator('div.notification-card', { hasText: 'Bill Generated' });
    await expect(billNotif).toBeVisible();

    // 6. Mark All as Read
    const markAllBtn = page.locator('button', { hasText: 'Mark all as read' });
    // might not be visible if we clicked the unread ones already, so check first or reload
    // We refreshed, so state might reset if not using persistent storage? 
    // Mock data resets on reload in this setup unless persistent. 
    // DataProvider state is in memory, so reload resets it. Correct.
    await expect(markAllBtn).toBeVisible();

    await markAllBtn.click();

    // 7. Verify State Change
    // "New" section should actully disappear or be empty
    await expect(page.locator('h3', { hasText: 'New' })).not.toBeVisible();
    // Mark all button should disappear
    await expect(markAllBtn).not.toBeVisible();
    // All cards should be read
    const unreadCardsAfter = page.locator('.notification-card.unread');
    await expect(unreadCardsAfter).toHaveCount(0);
});
