import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 900 }
  });
  const page = await context.newPage();
  
  // Open the preview HTML file
  const previewPath = path.join(__dirname, '../color-picker-preview.html');
  await page.goto(`file://${previewPath}`);
  await page.waitForTimeout(1000);
  
  // Take initial screenshot
  await page.screenshot({ 
    path: 'color-picker-preview-initial.png',
    fullPage: true 
  });
  console.log('Screenshot saved: color-picker-preview-initial.png');
  
  // Change sliders to create a bright cyan color
  await page.locator('#redSlider').fill('0');
  await page.locator('#greenSlider').fill('255');
  await page.locator('#blueSlider').fill('255');
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: 'color-picker-preview-cyan.png',
    fullPage: true 
  });
  console.log('Screenshot saved: color-picker-preview-cyan.png');
  
  // Change to bright neon green
  await page.locator('#redSlider').fill('57');
  await page.locator('#greenSlider').fill('255');
  await page.locator('#blueSlider').fill('20');
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: 'color-picker-preview-neon-green.png',
    fullPage: true 
  });
  console.log('Screenshot saved: color-picker-preview-neon-green.png');
  
  await browser.close();
  console.log('Screenshots complete!');
})();
