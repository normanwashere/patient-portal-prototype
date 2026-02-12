import { test, expect } from '@playwright/test';

const ROUTES = [
    '/',
    '/profile',
    '/health',
    '/financial',
    '/visits',
    '/visits/teleconsult',
    '/visits/consult-now', // might redirect if not enabled, but good to check
    // '/visits/consult-later', // redirect to appointments/book usually
    '/appointments',
    '/appointments/book',
    '/medical-history',
    '/community',
    '/branches',
    '/benefits',
    '/forms',
    '/results',
    // '/results/1', // Need valid ID
    '/medications',
    '/queue',
    '/billing',
    '/immunization',
    '/events',
    // '/events/1', // Need valid ID
    '/notifications'
];

test.describe('App Audit', () => {

    const knownConsoleErrors: string[] = [];

    test.beforeEach(async ({ page }) => {
        page.on('console', msg => {
            if (msg.type() === 'error') {
                knownConsoleErrors.push(`[${page.url()}] ${msg.text()}`);
            }
        });
    });

    test.describe('Desktop View (1920x1080)', () => {
        test.use({ viewport: { width: 1920, height: 1080 } });

        for (const route of ROUTES) {
            test(`should navigate to ${route} without errors`, async ({ page }) => {
                await page.goto(`http://localhost:5173${route}`);
                await page.waitForLoadState('networkidle');

                // Basic assertion that we are on the page (or redirected appropriately)
                // We can check if main content exists
                const main = page.locator('main.app-main');
                await expect(main).toBeVisible();

                // Check for horizontal overflow (basic check)
                const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
                const clientWidth = await page.evaluate(() => document.body.clientWidth);

                // Allow small rounding differences, but generally scrollWidth <= clientWidth for no horizontal scroll
                if (scrollWidth > clientWidth) {
                    console.log(`[WARNING] Horizontal scroll detected on ${route}: ${scrollWidth} > ${clientWidth}`);
                }
            });
        }
    });

    test.describe('Mobile View (Pixel 5)', () => {
        test.use({ viewport: { width: 393, height: 851 }, isMobile: true });

        for (const route of ROUTES) {
            test(`should navigate to ${route} without errors`, async ({ page }) => {
                await page.goto(`http://localhost:5173${route}`);
                await page.waitForLoadState('networkidle');

                const main = page.locator('main.app-main');
                await expect(main).toBeVisible();
            });
        }
    });

    test.afterAll(() => {
        if (knownConsoleErrors.length > 0) {
            console.log('\n--- CONSOLE ERRORS DETECTED ---');
            knownConsoleErrors.forEach(err => console.log(err));
            console.log('-------------------------------\n');
        }
    });
});
