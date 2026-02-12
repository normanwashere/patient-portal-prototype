import { chromium } from 'playwright';

(async () => {
    try {
        const browser = await chromium.launch();
        console.log('Browser launched successfully!');
        console.log('Version:', browser.version());
        await browser.close();
        process.exit(0);
    } catch (error) {
        console.error('Failed to launch browser:', error);
        process.exit(1);
    }
})();
