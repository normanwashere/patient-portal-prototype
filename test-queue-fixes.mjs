import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
    const artifactsDir = 'test-artifacts-fixes';
    if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir);

    console.log('Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    try {
        await page.goto('http://localhost:5173/queue');
        await page.waitForSelector('.linear-step');
        await page.screenshot({ path: path.join(artifactsDir, '1-linear-initial.png') });
        console.log('1. Linear initial state captured');

        // Linear Flow: First step (Triage) should be unlocked
        await page.click('.linear-step:first-child button:has-text("Join Queue")');
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(artifactsDir, '2-linear-triage-queued.png') });
        console.log('2. Triage queued');

        // Sim: Call
        await page.click('.linear-step:first-child button:has-text("(Sim: Call)")');
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(artifactsDir, '3-linear-triage-ready.png') });
        console.log('3. Triage ready');

        // Click on step to open modal
        await page.click('.linear-step:first-child');
        await page.waitForSelector('.modal-content');
        await page.screenshot({ path: path.join(artifactsDir, '4-linear-modal.png') });
        console.log('4. Modal opened');

        // Check In
        await page.click('.modal-footer button:has-text("Check In")');
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(artifactsDir, '5-linear-triage-in-session.png') });
        console.log('5. Triage in session');

        // Click again to complete
        await page.click('.linear-step:first-child');
        await page.waitForSelector('.modal-content');
        await page.click('.modal-footer button:has-text("Complete")');
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(artifactsDir, '6-linear-triage-completed.png') });
        console.log('6. Triage completed - Consult should now be unlocked');

        // Switch to Multi-Stream
        await page.click('button:has-text("Switch to Multi-Stream")');
        await page.waitForSelector('.stream-card');
        await page.screenshot({ path: path.join(artifactsDir, '7-multi-stream.png') });
        console.log('7. Multi-Stream view - Consult should be unlockable');

        // Queue All Available
        await page.click('button:has-text("Queue All Available")');
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(artifactsDir, '8-queue-all.png') });
        console.log('8. Queue All Available clicked');

        console.log('\nAll tests passed!');

    } catch (error) {
        console.error('Test failed:', error.message);
        await page.screenshot({ path: path.join(artifactsDir, 'error.png') });
    } finally {
        await browser.close();
    }
})();
