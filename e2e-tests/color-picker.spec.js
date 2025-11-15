import { test, expect } from './fixtures.js';

test.describe('Color Picker Window Tests', () => {
  
  test('should open color picker window from popup', async ({ page, extensionId }) => {
    // Open the popup
    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    await page.goto(popupUrl);
    await page.waitForTimeout(500);
    
    // Verify the "Manage Custom Colors" button exists
    const manageButton = page.locator('#manage-custom-colors');
    await expect(manageButton).toBeVisible();
    
    const buttonText = await manageButton.textContent();
    expect(buttonText).toContain('Manage Custom Colors');
  });
  
  test('should have all required elements in color picker page', async ({ page, extensionId }) => {
    // Open color picker directly
    const colorPickerUrl = `chrome-extension://${extensionId}/color-picker.html`;
    await page.goto(colorPickerUrl);
    await page.waitForTimeout(500);
    
    // Verify main elements exist
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#redSlider')).toBeVisible();
    await expect(page.locator('#greenSlider')).toBeVisible();
    await expect(page.locator('#blueSlider')).toBeVisible();
    await expect(page.locator('#colorPreview')).toBeVisible();
    await expect(page.locator('#hexValue')).toBeVisible();
    await expect(page.locator('#addColorBtn')).toBeVisible();
    await expect(page.locator('#resetBtn')).toBeVisible();
    
    // Verify preset colors are rendered
    const presetColors = page.locator('.preset-color-item');
    const count = await presetColors.count();
    expect(count).toBeGreaterThan(0);
  });
  
  test('should update color preview when sliders change', async ({ page, extensionId }) => {
    const colorPickerUrl = `chrome-extension://${extensionId}/color-picker.html`;
    await page.goto(colorPickerUrl);
    await page.waitForTimeout(500);
    
    // Get initial color
    const initialHex = await page.locator('#hexValue').textContent();
    expect(initialHex).toBe('#FF00FF');
    
    // Change red slider to 0
    await page.locator('#redSlider').fill('0');
    await page.waitForTimeout(200);
    
    // Verify color changed
    const newHex = await page.locator('#hexValue').textContent();
    expect(newHex).toBe('#00FF00');
  });
  
  test('should reset sliders when reset button is clicked', async ({ page, extensionId }) => {
    const colorPickerUrl = `chrome-extension://${extensionId}/color-picker.html`;
    await page.goto(colorPickerUrl);
    await page.waitForTimeout(500);
    
    // Change all sliders
    await page.locator('#redSlider').fill('100');
    await page.locator('#greenSlider').fill('150');
    await page.locator('#blueSlider').fill('200');
    await page.waitForTimeout(200);
    
    // Click reset
    await page.locator('#resetBtn').click();
    await page.waitForTimeout(200);
    
    // Verify values reset
    const redValue = await page.locator('#redValue').textContent();
    const greenValue = await page.locator('#greenValue').textContent();
    const blueValue = await page.locator('#blueValue').textContent();
    
    expect(redValue).toBe('255');
    expect(greenValue).toBe('0');
    expect(blueValue).toBe('255');
  });
});
