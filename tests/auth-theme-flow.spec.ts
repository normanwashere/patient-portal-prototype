import { test, expect } from '@playwright/test';

// Define expected colors
const METRO_BLUE = 'rgb(2, 132, 199)'; // #0284c7 (Approximate/Computed)
const MERALCO_ORANGE = 'rgb(249, 115, 22)'; // #f97316 (Computed from previous test)

test.describe('Auth Theme Flow', () => {

    test('Theme resets on logout and applies on login selection', async ({ page }) => {
        // 1. Start at Login Page (Neutral/Default)
        await page.goto('http://localhost:5173/login');

        // Theme should be Default (Metro Blue) initially
        let primaryColor = await page.evaluate(() => {
            return getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
        });
        // Validating against loose match because css var might need computation or hex
        // But since we set it to 'metroGeneral', it should match Metro's primary.
        // However, the Login Page UI itself might not use --color-primary for background.
        // We check the internal state or valid CSS var.

        // 2. Select "Meralco Wellness"
        // Click the button with text "Meralco Wellness"
        await page.click('text=Meralco Wellness');

        // Should navigate to "/"
        await expect(page).toHaveURL('http://localhost:5173/');

        // 3. Verify Meralco Theme is Applied (Orange)
        // Sidebar active item should be Orange
        const activeLink = page.locator('.sidebar-item.active');
        await expect(activeLink).toBeVisible();
        const activeColor = await activeLink.evaluate((el) => window.getComputedStyle(el).color);
        console.log(`Meralco Active Color: ${activeColor}`);
        expect(activeColor).toBe(MERALCO_ORANGE);

        // 4. Logout
        // Click "Sign Out" button
        await page.click('text=Sign Out');

        // Should navigate to "/login"
        await expect(page).toHaveURL('http://localhost:5173/login');

        // 5. Verify Theme Reset (Blue)
        // We are back at login. The Reset logic in Login.tsx should have run.
        // We can check document root style again.
        const resetColor = await page.evaluate(() => {
            const doc = document.documentElement;
            return doc.style.getPropertyValue('--color-primary').trim();
            // Note: ThemeContext sets inline style on doc.documentElement
        });
        console.log(`Reset Primary Color: ${resetColor}`);

        // Metro General Primary from config is #0284c7
        // Using hex here because getPropertyValue on inline style usually returns what was set
        expect(resetColor).toBe('#0284c7');

    });
});
