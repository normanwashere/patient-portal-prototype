import { chromium } from 'playwright';

async function captureLogin() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  console.log('📄 Checking Login Page (/login)');
  
  try {
    await page.goto('http://localhost:5180/login', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    await page.waitForTimeout(1000);
    
    // Check page content
    const content = await page.evaluate(() => {
      return {
        title: document.title,
        heading: document.querySelector('h1, h2')?.textContent || 'No heading',
        hasEmailInput: !!document.querySelector('input[type="email"]'),
        hasPasswordInput: !!document.querySelector('input[type="password"]'),
        hasSubmitButton: !!document.querySelector('button[type="submit"]'),
        bodyText: document.body.textContent?.substring(0, 200) || 'No text'
      };
    });
    
    console.log('Content:', content);
    
    await page.screenshot({ path: 'critical-screenshots/Login.png', fullPage: true });
    console.log('✅ Screenshot saved: critical-screenshots/Login.png');
    
  } catch (error) {
    console.log('❌ Error:', error);
  }
  
  await browser.close();
}

captureLogin();
