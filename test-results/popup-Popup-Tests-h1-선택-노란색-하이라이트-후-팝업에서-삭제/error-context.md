# Test info

- Name: Popup Tests >> h1 선택, 노란색 하이라이트 후 팝업에서 삭제
- Location: /home/runner/work/highweb/highweb/e2e-tests/popup.spec.js:81:7

# Error details

```
Error: browserType.launchPersistentContext: Executable doesn't exist at /home/runner/.cache/ms-playwright/chromium-1169/chrome-linux/chrome
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
    at Object.context (/home/runner/work/highweb/highweb/e2e-tests/fixtures.js:7:21)
```

# Test source

```ts
   1 | import { test as base, chromium } from '@playwright/test';
   2 | import path from 'path';
   3 |
   4 | export const test = base.extend({
   5 |   context: async ({ }, use) => {
   6 |     const pathToExtension = path.join(__dirname, '../');
>  7 |     const context = await chromium.launchPersistentContext('', {
     |                     ^ Error: browserType.launchPersistentContext: Executable doesn't exist at /home/runner/.cache/ms-playwright/chromium-1169/chrome-linux/chrome
   8 |       //headless: false,
   9 |       channel: 'chromium',
  10 |       args: [
  11 |         `--disable-extensions-except=${pathToExtension}`,
  12 |         `--load-extension=${pathToExtension}`,
  13 |       ],
  14 |     });
  15 |     await use(context);
  16 |     await context.close();
  17 |   },
  18 |   background: async ({ context }, use) => {
  19 |     // for manifest v3:
  20 |     let [background] = context.serviceWorkers();
  21 |     if (!background)
  22 |       background = await context.waitForEvent('serviceworker');
  23 |
  24 |     await use(background);
  25 |   },
  26 |   extensionId: async ({ background }, use) => {
  27 |     const extensionId = background.url().split('/')[2];
  28 |     await use(extensionId);
  29 |   },
  30 | });
  31 | export const expect = test.expect;
  32 |
  33 | export async function sendHighlightMessage(background, color) {
  34 |   await background.evaluate(async (color) => {
  35 |     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  36 |     if (tab && tab.id) {
  37 |       chrome.tabs.sendMessage(tab.id, {
  38 |         action: 'highlight',
  39 |         color
  40 |       });
  41 |     } else {
  42 |       console.error('Active tab not found to send highlight message.');
  43 |     }
  44 |   }, color);
  45 | }
  46 |
  47 | export async function expectHighlightSpan(spanLocator, { color, text }) {
  48 |   await expect(spanLocator).toBeVisible();
  49 |   await expect(spanLocator).toHaveCSS('background-color', color);
  50 |   if (typeof text === 'string') {
  51 |     await expect(spanLocator).toHaveText(text.trim());
  52 |   }
  53 | }
  54 |
  55 | /**
  56 |  * Helper function to select a specific text string within a given element.
  57 |  * @param {import('@playwright/test').Locator} locator - The Playwright locator for the element.
  58 |  * @param {string} textToSelect - The text string to select within the element.
  59 |  */
  60 | export async function selectTextInElement(locator, textToSelect) {
  61 |   await locator.evaluate((element, text) => {
  62 |     const textNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.includes(text));
  63 |     if (textNode) {
  64 |       const range = document.createRange();
  65 |       const startIndex = textNode.textContent.indexOf(text);
  66 |       range.setStart(textNode, startIndex);
  67 |       range.setEnd(textNode, startIndex + text.length);
  68 |       window.getSelection().removeAllRanges();
  69 |       window.getSelection().addRange(range);
  70 |     } else {
  71 |       throw new Error(`Text "${text}" not found in element for selection.`);
  72 |     }
  73 |   }, textToSelect);
  74 | }
```