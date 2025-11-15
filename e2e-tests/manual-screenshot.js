import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const pathToExtension = path.join(__dirname, '../');
  
  const context = await chromium.launchPersistentContext('', {
    headless: true,
    channel: 'chromium',
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  // Get the background page
  let background = context.serviceWorkers()[0];
  if (!background) {
    background = await context.waitForEvent('serviceworker');
  }
  
  // Get the extension ID
  const extensionId = background.url().split('/')[2];
  
  // Open the popup
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;
  const popupPage = await context.newPage();
  await popupPage.goto(popupUrl);
  await popupPage.waitForTimeout(1000);
  
  // Take screenshot of the popup with the new button
  await popupPage.screenshot({ path: 'popup-with-manage-button.png' });
  console.log('Screenshot saved: popup-with-manage-button.png');
  
  // Click the "Manage Custom Colors" button
  await popupPage.click('#manage-custom-colors');
  await popupPage.waitForTimeout(2000);
  
  // Get all pages
  const pages = context.pages();
  const colorPickerPage = pages.find(p => p.url().includes('color-picker.html'));
  
  if (colorPickerPage) {
    await colorPickerPage.waitForTimeout(1000);
    
    // Take screenshot of the color picker
    await colorPickerPage.screenshot({ path: 'color-picker-initial.png', fullPage: true });
    console.log('Screenshot saved: color-picker-initial.png');
    
    // Adjust sliders to create a bright cyan color
    await colorPickerPage.locator('#redSlider').fill('0');
    await colorPickerPage.locator('#greenSlider').fill('255');
    await colorPickerPage.locator('#blueSlider').fill('255');
    await colorPickerPage.waitForTimeout(500);
    
    // Take screenshot with cyan color
    await colorPickerPage.screenshot({ path: 'color-picker-cyan.png', fullPage: true });
    console.log('Screenshot saved: color-picker-cyan.png');
    
    // Click a preset glow color
    const presetColors = await colorPickerPage.locator('.preset-color-item.glow').first();
    await presetColors.click();
    await colorPickerPage.waitForTimeout(1000);
    
    // Take screenshot showing added color
    await colorPickerPage.screenshot({ path: 'color-picker-with-saved.png', fullPage: true });
    console.log('Screenshot saved: color-picker-with-saved.png');
  }
  
  await context.close();
  console.log('Screenshots complete!');
})();
