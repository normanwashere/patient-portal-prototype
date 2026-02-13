import { chromium } from 'playwright';

const pages = [
  { name: 'Login', url: '/login' },
  { name: 'App Selector', url: '/apps' },
  { name: 'Patient Dashboard', url: '/dashboard' },
  { name: 'Patient Health', url: '/health' },
  { name: 'Doctor Dashboard', url: '/doctor' },
  { name: 'Provider Dashboard', url: '/provider' },
  { name: 'Provider Integrations', url: '/provider/integrations' },
  { name: 'Provider Architecture', url: '/provider/architecture' },
  { name: 'Provider Analytics', url: '/provider/analytics' }
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  console.log('\n🔍 CRITICAL PAGES VISUAL VERIFICATION\n');
  console.log('='.repeat(80));

  for (const pageInfo of pages) {
    console.log(`\n📄 ${pageInfo.name} (${pageInfo.url})`);
    console.log('-'.repeat(80));

    try {
      // Navigate to page
      await page.goto(`http://localhost:5180${pageInfo.url}`, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      await page.waitForTimeout(1000);
      
      // Check for errors
      const hasError = await page.evaluate(() => {
        const errorMessages = document.body.textContent?.toLowerCase() || '';
        return errorMessages.includes('error') || 
               errorMessages.includes('404') || 
               errorMessages.includes('not found');
      });
      
      // Check if page is blank
      const isBlank = await page.evaluate(() => {
        const text = document.body.textContent?.trim() || '';
        const hasImages = document.querySelectorAll('img').length > 0;
        const hasButtons = document.querySelectorAll('button').length > 0;
        return text.length < 20 && !hasImages && !hasButtons;
      });
      
      // Get page title or heading
      const heading = await page.evaluate(() => {
        const h1 = document.querySelector('h1, h2, [class*="title"]');
        return h1?.textContent?.trim() || 'No heading found';
      });
      
      // Check for main content
      const hasContent = await page.evaluate(() => {
        const main = document.querySelector('main, [role="main"], .main-content, .content');
        return main !== null;
      });
      
      // Count interactive elements
      const interactiveCount = await page.evaluate(() => {
        return document.querySelectorAll('button, a, input').length;
      });
      
      // Get page-specific elements
      let pageSpecific = '';
      
      if (pageInfo.url === '/login') {
        pageSpecific = await page.evaluate(() => {
          const emailInput = document.querySelector('input[type="email"], input[name="email"]');
          const passwordInput = document.querySelector('input[type="password"]');
          const loginButton = document.querySelector('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
          return `Email input: ${emailInput ? '✅' : '❌'}, Password input: ${passwordInput ? '✅' : '❌'}, Login button: ${loginButton ? '✅' : '❌'}`;
        });
      } else if (pageInfo.url === '/apps') {
        pageSpecific = await page.evaluate(() => {
          const appCards = document.querySelectorAll('[class*="app"], [class*="card"]').length;
          return `App cards found: ${appCards}`;
        });
      } else if (pageInfo.url === '/doctor') {
        pageSpecific = await page.evaluate(() => {
          const aiAssistant = Array.from(document.querySelectorAll('*')).some(el => 
            el.textContent?.toLowerCase().includes('ai') || 
            el.textContent?.toLowerCase().includes('assistant')
          );
          const interop = Array.from(document.querySelectorAll('*')).some(el => 
            el.textContent?.toLowerCase().includes('interop') || 
            el.textContent?.toLowerCase().includes('integration')
          );
          return `AI Assistant: ${aiAssistant ? '✅' : '❌'}, Interop Status: ${interop ? '✅' : '❌'}`;
        });
      } else if (pageInfo.url === '/health') {
        pageSpecific = await page.evaluate(() => {
          const carePlans = Array.from(document.querySelectorAll('*')).some(el => 
            el.textContent?.toLowerCase().includes('care plan')
          );
          return `Care Plans section: ${carePlans ? '✅' : '❌'}`;
        });
      } else if (pageInfo.url === '/provider/analytics') {
        pageSpecific = await page.evaluate(() => {
          const charts = document.querySelectorAll('canvas, svg[class*="chart"]').length;
          return `Charts found: ${charts}`;
        });
      }
      
      // Take screenshot
      const screenshotPath = `critical-screenshots/${pageInfo.name.replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Report status
      if (hasError) {
        console.log('❌ STATUS: ERROR PAGE DETECTED');
      } else if (isBlank) {
        console.log('⚠️  STATUS: BLANK OR MINIMAL CONTENT');
      } else {
        console.log('✅ STATUS: Page loaded successfully');
      }
      
      console.log(`📋 Heading: "${heading}"`);
      console.log(`📦 Main content area: ${hasContent ? '✅ Found' : '❌ Not found'}`);
      console.log(`🔘 Interactive elements: ${interactiveCount}`);
      
      if (pageSpecific) {
        console.log(`🎯 Page-specific: ${pageSpecific}`);
      }
      
      console.log(`📸 Screenshot: ${screenshotPath}`);
      
    } catch (error) {
      console.log(`❌ ERROR: Failed to load page`);
      console.log(`   ${error}`);
    }
  }

  await browser.close();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Visual verification complete!\n');
}

main().catch(console.error);
