const { test, expect } = require('@playwright/test');
const { test: base } = require('./fixtures');
const path = require('path');

test.use(base);

test.describe('Enhanced Color Picker Tests', () => {
  
  test('should display metallic colors in color picker', async ({ page, background }) => {
    await page.goto(`file:///${path.join(__dirname, 'test-page.html')}`);
    
    const h1 = page.locator('h1');
    await h1.click({ clickCount: 3 });
    
    // Apply yellow highlight
    await background.evaluate(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'highlight',
          color: '#FFFF00'
        });
      });
    });
    
    // Wait for highlight
    const h1Span = h1.locator('span.text-highlighter-extension');
    await expect(h1Span).toBeVisible();
    
    // Click highlight to show controls
    await h1Span.click();
    const controls = page.locator('.text-highlighter-controls');
    await expect(controls).toBeVisible();
    
    // Open color picker
    const addColorBtn = controls.locator('.add-color-button');
    await addColorBtn.click();
    
    const customColorPicker = page.locator('.custom-color-picker');
    await expect(customColorPicker).toBeVisible();
    
    // Verify metallic colors are present
    const metallicColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#B87333', '#E5E4E2'];
    for (const color of metallicColors) {
      const colorPreset = customColorPicker.locator(`[data-color="${color}"]`);
      await expect(colorPreset).toBeVisible();
      
      // Verify metallic effect class is applied
      const hasMetallicEffect = await colorPreset.evaluate(el => 
        el.classList.contains('metallic-effect')
      );
      expect(hasMetallicEffect).toBe(true);
    }
  });
  
  test('should display super bright colors in color picker', async ({ page, background }) => {
    await page.goto(`file:///${path.join(__dirname, 'test-page.html')}`);
    
    const h1 = page.locator('h1');
    await h1.click({ clickCount: 3 });
    
    // Apply yellow highlight
    await background.evaluate(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'highlight',
          color: '#FFFF00'
        });
      });
    });
    
    const h1Span = h1.locator('span.text-highlighter-extension');
    await expect(h1Span).toBeVisible();
    await h1Span.click();
    
    const controls = page.locator('.text-highlighter-controls');
    await expect(controls).toBeVisible();
    
    const addColorBtn = controls.locator('.add-color-button');
    await addColorBtn.click();
    
    const customColorPicker = page.locator('.custom-color-picker');
    await expect(customColorPicker).toBeVisible();
    
    // Verify super bright colors are present
    const brightColors = ['#FF0099', '#00FF00', '#00FFFF', '#FF00FF', '#FFFF00'];
    for (const color of brightColors) {
      const colorPreset = customColorPicker.locator(`[data-color="${color}"]`);
      await expect(colorPreset).toBeVisible();
      
      // Verify bright effect class is applied
      const hasBrightEffect = await colorPreset.evaluate(el => 
        el.classList.contains('bright-effect')
      );
      expect(hasBrightEffect).toBe(true);
    }
  });
  
  test('should display glow colors in color picker', async ({ page, background }) => {
    await page.goto(`file:///${path.join(__dirname, 'test-page.html')}`);
    
    const h1 = page.locator('h1');
    await h1.click({ clickCount: 3 });
    
    // Apply yellow highlight
    await background.evaluate(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'highlight',
          color: '#FFFF00'
        });
      });
    });
    
    const h1Span = h1.locator('span.text-highlighter-extension');
    await expect(h1Span).toBeVisible();
    await h1Span.click();
    
    const controls = page.locator('.text-highlighter-controls');
    await expect(controls).toBeVisible();
    
    const addColorBtn = controls.locator('.add-color-button');
    await addColorBtn.click();
    
    const customColorPicker = page.locator('.custom-color-picker');
    await expect(customColorPicker).toBeVisible();
    
    // Verify glow colors are present
    const glowColors = ['#39FF14', '#FF073A', '#FE4164', '#08F7FE', '#FFF01F'];
    for (const color of glowColors) {
      const colorPreset = customColorPicker.locator(`[data-color="${color}"]`);
      await expect(colorPreset).toBeVisible();
      
      // Verify glow effect class is applied
      const hasGlowEffect = await colorPreset.evaluate(el => 
        el.classList.contains('glow-effect')
      );
      expect(hasGlowEffect).toBe(true);
    }
  });
  
  test('should be able to highlight with metallic gold color', async ({ page, background }) => {
    await page.goto(`file:///${path.join(__dirname, 'test-page.html')}`);
    
    const h1 = page.locator('h1');
    const h1Text = await h1.textContent();
    await h1.click({ clickCount: 3 });
    
    // Apply yellow highlight first
    await background.evaluate(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'highlight',
          color: '#FFFF00'
        });
      });
    });
    
    const h1Span = h1.locator('span.text-highlighter-extension');
    await expect(h1Span).toBeVisible();
    await h1Span.click();
    
    const controls = page.locator('.text-highlighter-controls');
    await expect(controls).toBeVisible();
    
    const addColorBtn = controls.locator('.add-color-button');
    await addColorBtn.click();
    
    const customColorPicker = page.locator('.custom-color-picker');
    await expect(customColorPicker).toBeVisible();
    
    // Select gold color
    const goldColor = '#FFD700';
    await customColorPicker.locator(`[data-color="${goldColor}"]`).click();
    
    // Wait for color picker to close and controls to update
    await page.waitForTimeout(500);
    
    // Find the newly added gold color button and click it
    const goldRgb = 'rgb(255, 215, 0)'; // #FFD700 in RGB
    await page.waitForFunction((rgb) => {
      const controls = document.querySelector('.text-highlighter-controls');
      if (!controls) return false;
      return Array.from(controls.querySelectorAll('.color-button')).some(
        b => getComputedStyle(b).backgroundColor === rgb
      );
    }, goldRgb);
    
    await page.evaluate((rgb) => {
      const controls = document.querySelector('.text-highlighter-controls');
      const btn = Array.from(controls.querySelectorAll('.color-button')).find(
        b => getComputedStyle(b).backgroundColor === rgb
      );
      if (btn) btn.click();
    }, goldRgb);
    
    // Verify highlight changed to gold
    await page.waitForTimeout(300);
    const bgColor = await h1Span.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe(goldRgb);
  });
  
  test('should be able to highlight with neon green glow color', async ({ page, background }) => {
    await page.goto(`file:///${path.join(__dirname, 'test-page.html')}`);
    
    const h1 = page.locator('h1');
    await h1.click({ clickCount: 3 });
    
    // Apply yellow highlight first
    await background.evaluate(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'highlight',
          color: '#FFFF00'
        });
      });
    });
    
    const h1Span = h1.locator('span.text-highlighter-extension');
    await expect(h1Span).toBeVisible();
    await h1Span.click();
    
    const controls = page.locator('.text-highlighter-controls');
    await expect(controls).toBeVisible();
    
    const addColorBtn = controls.locator('.add-color-button');
    await addColorBtn.click();
    
    const customColorPicker = page.locator('.custom-color-picker');
    await expect(customColorPicker).toBeVisible();
    
    // Select neon green color
    const neonGreen = '#39FF14';
    await customColorPicker.locator(`[data-color="${neonGreen}"]`).click();
    
    // Wait for color picker to close and controls to update
    await page.waitForTimeout(500);
    
    // Find the newly added neon green button and click it
    const neonGreenRgb = 'rgb(57, 255, 20)'; // #39FF14 in RGB
    await page.waitForFunction((rgb) => {
      const controls = document.querySelector('.text-highlighter-controls');
      if (!controls) return false;
      return Array.from(controls.querySelectorAll('.color-button')).some(
        b => getComputedStyle(b).backgroundColor === rgb
      );
    }, neonGreenRgb);
    
    await page.evaluate((rgb) => {
      const controls = document.querySelector('.text-highlighter-controls');
      const btn = Array.from(controls.querySelectorAll('.color-button')).find(
        b => getComputedStyle(b).backgroundColor === rgb
      );
      if (btn) btn.click();
    }, neonGreenRgb);
    
    // Verify highlight changed to neon green
    await page.waitForTimeout(300);
    const bgColor = await h1Span.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe(neonGreenRgb);
  });
});
