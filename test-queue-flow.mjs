import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
    // Ensure artifacts dir exists
    const artifactsDir = 'test-artifacts';
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir);
    }

    console.log('Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        console.log('Navigating to Queue page...');
        await page.goto('http://localhost:5173/queue');
        await page.screenshot({ path: path.join(artifactsDir, '1-initial-load.png') });

        // Switch to Multi-Stream
        console.log('Switching to Multi-Stream...');
        await page.click('button.mode-toggle:has-text("Switch to Multi-Stream")');
        await page.waitForTimeout(1000); // Wait for transition
        await page.screenshot({ path: path.join(artifactsDir, '2-multi-stream.png') });

        // Find Triage Card
        const triageCardSelector = '.stream-card:has-text("Triage / Vitals")';

        // Join Queue
        console.log('Joining Queue for Triage...');
        await page.click(`${triageCardSelector} button:has-text("Join Queue")`);
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(artifactsDir, '3-triage-queued.png') });

        // Simulate Call
        console.log('Simulating Call for Triage...');
        await page.click(`${triageCardSelector} button:has-text("(Sim: Call)")`);
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(artifactsDir, '4-triage-ready.png') });

        // Open Modal (Click Card)
        console.log('Opening Modal...');
        await page.click(triageCardSelector);
        await page.waitForSelector('.modal-content');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(artifactsDir, '5-modal-open.png') });

        // Check In
        console.log('Checking In...');
        await page.click('.modal-footer button:has-text("Check In")');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(artifactsDir, '6-triage-in-session.png') });

        // Complete
        console.log('Completing Step...');
        // Open modal again
        await page.click(triageCardSelector);
        await page.waitForSelector('.modal-content');
        await page.click('.modal-footer button:has-text("Simulate Completion")');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(artifactsDir, '7-triage-completed.png') });

        console.log('Success! All steps verified.');
    } catch (error) {
        console.error('Test failed:', error);
        await page.screenshot({ path: path.join(artifactsDir, 'error-state.png') });
    } finally {
        await browser.close();
    }
})();
