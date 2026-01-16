import { test, Page } from '@playwright/test';

// Force serial execution
test.describe.configure({ mode: 'serial' });

// Output directory for documentation screenshots
const DOCS_SCREENSHOTS = './docs/screenshots';

// Helper to take screenshot and save to docs
async function takeDocScreenshot(page: Page, name: string) {
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${DOCS_SCREENSHOTS}/${name}.png`,
    fullPage: false,
  });
  console.log(`[Screenshot] Saved: ${name}.png`);
}

test.describe('Screenshot Tests - Static States', () => {
  test('01 - disconnected state', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000);
    await takeDocScreenshot(page, '01-disconnected');
  });

  test('02 - connecting state', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(100);
    await takeDocScreenshot(page, '02-connecting');
  });

  test('03 - settings panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    await page.click('button[aria-label="Settings"]');
    await page.waitForTimeout(500);
    await takeDocScreenshot(page, '03-settings-panel');
  });

  test('04 - settings keyboard tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    await page.click('button[aria-label="Settings"]');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Keyboard")');
    await page.waitForTimeout(300);
    await takeDocScreenshot(page, '04-settings-keyboard');
  });

  test('16 - mobile settings', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(500);
    await page.click('button[aria-label="Settings"]');
    await page.waitForTimeout(500);
    await takeDocScreenshot(page, '16-mobile-settings');
  });
});
