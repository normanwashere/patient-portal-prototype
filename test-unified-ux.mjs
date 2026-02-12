import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
    const artifactsDir = 'test-artifacts-unified';
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir);
    }

    console.log('Launching browser...');
    const browser = await chromium.launch();

    const viewports = {
        desktop: { width: 1280, height: 720 },
        mobile: { width: 375, height: 667, isMobile: true }
    };

    for (const [device, size] of Object.entries(viewports)) {
        console.log(`\nTesting ${device} view...`);
        const context = await browser.newContext({ viewport: size });
        const page = await context.newPage();

        try {
            // 1. Linear View
            await page.goto('http://localhost:5173/queue');
            await page.waitForSelector('.linear-step');
            await page.screenshot({ path: path.join(artifactsDir, `${device}-1-linear.png`) });
            console.log(`  ${device}-1-linear.png captured`);

            // 2. Multi-Stream View
            await page.click('button.mode-toggle');
            await page.waitForSelector('.stream-card');
            await page.waitForTimeout(300);
            await page.screenshot({ path: path.join(artifactsDir, `${device}-2-multi-stream.png`) });
            console.log(`  ${device}-2-multi-stream.png captured`);

            // 3. Join Queue (Triage)
            const triageCard = '.stream-card:has-text("Triage / Vitals")';
            await page.click(`${triageCard} button:has-text("Join Queue")`);
            await page.waitForTimeout(300);
            await page.screenshot({ path: path.join(artifactsDir, `${device}-3-queued.png`) });
            console.log(`  ${device}-3-queued.png captured`);

            // 4. Sim: Call (Triage)
            await page.click(`${triageCard} button:has-text("(Sim: Call)")`);
            await page.waitForTimeout(300);
            await page.screenshot({ path: path.join(artifactsDir, `${device}-4-ready.png`) });
            console.log(`  ${device}-4-ready.png captured`);

            // 5. Modal
            await page.click(`${triageCard} button:has-text("Proceed")`);
            await page.waitForSelector('.modal-content', { timeout: 5000 });
            await page.waitForTimeout(300);
            await page.screenshot({ path: path.join(artifactsDir, `${device}-5-modal.png`) });
            console.log(`  ${device}-5-modal.png captured`);

            // Close Modal
            await page.click('.modal-overlay');
            await page.waitForTimeout(200);

        } catch (error) {
            console.error(`Test failed for ${device}:`, error.message);
            await page.screenshot({ path: path.join(artifactsDir, `${device}-error.png`) });
        } finally {
            await context.close();
        }
    }

    await browser.close();
    console.log('\nVerification Complete.');
})();
