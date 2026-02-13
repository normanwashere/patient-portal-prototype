import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';

interface DetailedIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  element?: string;
}

async function analyzePageLayout(page: Page, viewport: 'desktop' | 'mobile'): Promise<DetailedIssue[]> {
  const issues: DetailedIssue[] = [];

  // Check for horizontal scrollbar (real overflow issue)
  const hasRealOverflow = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    
    // Check if there's actual horizontal scrollbar
    const hasHorizontalScroll = body.scrollWidth > html.clientWidth;
    
    // Find elements that cause overflow
    const overflowingElements: string[] = [];
    const elements = Array.from(document.querySelectorAll('*'));
    
    elements.forEach(el => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const styles = window.getComputedStyle(el as HTMLElement);
      
      // Check if element extends beyond viewport (with 5px tolerance)
      if (rect.right > window.innerWidth + 5 && styles.position !== 'fixed') {
        const tag = (el as HTMLElement).tagName.toLowerCase();
        const className = (el as HTMLElement).className;
        const id = (el as HTMLElement).id;
        
        let identifier = tag;
        if (id) identifier += `#${id}`;
        if (className) identifier += `.${className.split(' ')[0]}`;
        
        overflowingElements.push(identifier);
      }
    });
    
    return {
      hasHorizontalScroll,
      overflowingElements: overflowingElements.slice(0, 5)
    };
  });

  if (hasRealOverflow.hasHorizontalScroll && hasRealOverflow.overflowingElements.length > 0) {
    issues.push({
      severity: 'high',
      category: 'Layout',
      description: `Horizontal overflow: ${hasRealOverflow.overflowingElements.join(', ')}`,
      element: hasRealOverflow.overflowingElements[0]
    });
  }

  // Check for broken/missing images
  const imageIssues = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    const broken: string[] = [];
    const missing: string[] = [];
    
    images.forEach(img => {
      if (!img.complete || img.naturalHeight === 0) {
        const alt = img.alt || 'no alt';
        const src = img.src.substring(0, 50);
        broken.push(`${alt} (${src})`);
      }
      if (!img.src || img.src === '') {
        missing.push(img.alt || 'unnamed image');
      }
    });
    
    return { broken, missing };
  });

  if (imageIssues.broken.length > 0) {
    issues.push({
      severity: 'medium',
      category: 'Content',
      description: `${imageIssues.broken.length} broken image(s): ${imageIssues.broken.slice(0, 2).join(', ')}`
    });
  }

  // Check for text overflow/truncation issues
  const textOverflow = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const truncated: string[] = [];
    
    elements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const styles = window.getComputedStyle(htmlEl);
      
      // Check if text is being cut off
      if (htmlEl.scrollWidth > htmlEl.clientWidth + 2 && 
          styles.overflow !== 'visible' &&
          htmlEl.textContent && htmlEl.textContent.trim().length > 0) {
        const tag = htmlEl.tagName.toLowerCase();
        const text = htmlEl.textContent.trim().substring(0, 30);
        truncated.push(`${tag}: "${text}..."`);
      }
    });
    
    return truncated.slice(0, 3);
  });

  if (textOverflow.length > 0) {
    issues.push({
      severity: 'medium',
      category: 'Typography',
      description: `Text truncation detected: ${textOverflow.join('; ')}`
    });
  }

  // Check for missing mobile navigation (hamburger menu)
  if (viewport === 'mobile') {
    const hasMobileNav = await page.evaluate(() => {
      // Look for hamburger menu or mobile navigation
      const menuButtons = Array.from(document.querySelectorAll('button, a')).filter(el => {
        const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || '';
        const className = el.className.toLowerCase();
        const hasMenuIcon = el.querySelector('svg') !== null;
        
        return ariaLabel.includes('menu') || 
               className.includes('menu') || 
               className.includes('hamburger') ||
               (hasMenuIcon && className.includes('nav'));
      });
      
      return menuButtons.length > 0;
    });

    if (!hasMobileNav) {
      issues.push({
        severity: 'high',
        category: 'Navigation',
        description: 'Mobile navigation menu not found'
      });
    }
  }

  // Check for overlapping interactive elements (buttons, links)
  const overlappingInteractive = await page.evaluate(() => {
    const interactive = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
    const overlaps: string[] = [];
    
    for (let i = 0; i < interactive.length; i++) {
      const el1 = interactive[i] as HTMLElement;
      const rect1 = el1.getBoundingClientRect();
      
      if (rect1.width === 0 || rect1.height === 0) continue;
      
      for (let j = i + 1; j < interactive.length; j++) {
        const el2 = interactive[j] as HTMLElement;
        const rect2 = el2.getBoundingClientRect();
        
        if (rect2.width === 0 || rect2.height === 0) continue;
        
        // Check if interactive elements overlap
        const overlapX = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
        const overlapY = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
        
        if (overlapX > 10 && overlapY > 10) {
          const tag1 = el1.tagName.toLowerCase();
          const tag2 = el2.tagName.toLowerCase();
          const text1 = el1.textContent?.trim().substring(0, 20) || 'no text';
          const text2 = el2.textContent?.trim().substring(0, 20) || 'no text';
          
          overlaps.push(`${tag1}("${text1}") overlaps ${tag2}("${text2}")`);
        }
      }
    }
    
    return overlaps.slice(0, 3);
  });

  if (overlappingInteractive.length > 0) {
    issues.push({
      severity: 'critical',
      category: 'Interactivity',
      description: `Overlapping interactive elements: ${overlappingInteractive.join('; ')}`
    });
  }

  // Check for insufficient color contrast
  const contrastIssues = await page.evaluate(() => {
    const issues: string[] = [];
    
    // Helper to calculate relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const getContrast = (rgb1: number[], rgb2: number[]) => {
      const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
      const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
      const lighter = Math.max(lum1, lum2);
      const darker = Math.min(lum1, lum2);
      return (lighter + 0.05) / (darker + 0.05);
    };
    
    // Check text elements
    const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label'));
    
    textElements.slice(0, 50).forEach(el => {
      const htmlEl = el as HTMLElement;
      const styles = window.getComputedStyle(htmlEl);
      const color = styles.color;
      const bgColor = styles.backgroundColor;
      
      // Skip if no actual text
      if (!htmlEl.textContent?.trim()) return;
      
      // Parse RGB values
      const colorMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      const bgMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      
      if (colorMatch && bgMatch) {
        const textRgb = [parseInt(colorMatch[1]), parseInt(colorMatch[2]), parseInt(colorMatch[3])];
        const bgRgb = [parseInt(bgMatch[1]), parseInt(bgMatch[2]), parseInt(bgMatch[3])];
        
        const contrast = getContrast(textRgb, bgRgb);
        
        // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
        const fontSize = parseFloat(styles.fontSize);
        const minContrast = fontSize >= 18 || (fontSize >= 14 && styles.fontWeight === 'bold') ? 3 : 4.5;
        
        if (contrast < minContrast) {
          const tag = htmlEl.tagName.toLowerCase();
          const text = htmlEl.textContent.trim().substring(0, 20);
          issues.push(`${tag}: "${text}" (${contrast.toFixed(1)}:1)`);
        }
      }
    });
    
    return issues.slice(0, 3);
  });

  if (contrastIssues.length > 0) {
    issues.push({
      severity: 'medium',
      category: 'Accessibility',
      description: `Low contrast text: ${contrastIssues.join('; ')}`
    });
  }

  // Check for missing form labels
  const formIssues = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'));
    const unlabeled: string[] = [];
    
    inputs.forEach(input => {
      const htmlInput = input as HTMLInputElement;
      const id = htmlInput.id;
      const ariaLabel = htmlInput.getAttribute('aria-label');
      const ariaLabelledBy = htmlInput.getAttribute('aria-labelledby');
      const placeholder = htmlInput.placeholder;
      
      // Check if input has a label
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      
      if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
        const type = htmlInput.type || 'input';
        const name = htmlInput.name || 'unnamed';
        unlabeled.push(`${type}[${name}]`);
      }
    });
    
    return unlabeled.slice(0, 5);
  });

  if (formIssues.length > 0) {
    issues.push({
      severity: 'medium',
      category: 'Accessibility',
      description: `Unlabeled form inputs: ${formIssues.join(', ')}`
    });
  }

  // Check for small touch targets on mobile
  if (viewport === 'mobile') {
    const smallTouchTargets = await page.evaluate(() => {
      const interactive = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
      const small: string[] = [];
      
      interactive.forEach(el => {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();
        
        // WCAG recommends minimum 44x44px touch targets
        if ((rect.width < 44 || rect.height < 44) && rect.width > 0 && rect.height > 0) {
          const tag = htmlEl.tagName.toLowerCase();
          const text = htmlEl.textContent?.trim().substring(0, 20) || 'no text';
          small.push(`${tag}("${text}") ${Math.round(rect.width)}x${Math.round(rect.height)}px`);
        }
      });
      
      return small.slice(0, 5);
    });

    if (smallTouchTargets.length > 0) {
      issues.push({
        severity: 'medium',
        category: 'Mobile UX',
        description: `Small touch targets: ${smallTouchTargets.join('; ')}`
      });
    }
  }

  // Check for console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  return issues;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  const testPages = [
    { name: 'Dashboard', url: '/dashboard' },
    { name: 'Appointments', url: '/appointments' },
    { name: 'Benefits', url: '/benefits' },
    { name: 'Profile', url: '/profile' },
    { name: 'Results', url: '/results' }
  ];

  console.log('\n🔍 DETAILED VISUAL ANALYSIS\n');
  console.log('='.repeat(80));

  for (const pageInfo of testPages) {
    console.log(`\n📄 ${pageInfo.name} (${pageInfo.url})`);
    console.log('-'.repeat(80));

    // Desktop analysis
    const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await desktopPage.goto(`http://localhost:5180${pageInfo.url}`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1000);
    
    const desktopIssues = await analyzePageLayout(desktopPage, 'desktop');
    
    console.log('\n🖥️  DESKTOP (1280x800):');
    if (desktopIssues.length === 0) {
      console.log('  ✅ No issues found');
    } else {
      desktopIssues.forEach(issue => {
        const icon = issue.severity === 'critical' ? '🔴' : 
                     issue.severity === 'high' ? '🟠' : 
                     issue.severity === 'medium' ? '🟡' : '🔵';
        console.log(`  ${icon} [${issue.category}] ${issue.description}`);
      });
    }
    
    await desktopPage.close();

    // Mobile analysis
    const mobilePage = await browser.newPage({ 
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    await mobilePage.goto(`http://localhost:5180${pageInfo.url}`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);
    
    const mobileIssues = await analyzePageLayout(mobilePage, 'mobile');
    
    console.log('\n📱 MOBILE (390x844):');
    if (mobileIssues.length === 0) {
      console.log('  ✅ No issues found');
    } else {
      mobileIssues.forEach(issue => {
        const icon = issue.severity === 'critical' ? '🔴' : 
                     issue.severity === 'high' ? '🟠' : 
                     issue.severity === 'medium' ? '🟡' : '🔵';
        console.log(`  ${icon} [${issue.category}] ${issue.description}`);
      });
    }
    
    await mobilePage.close();
  }

  await browser.close();
  
  console.log('\n' + '='.repeat(80));
  console.log('Analysis complete!\n');
}

main().catch(console.error);
