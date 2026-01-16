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

// These tests require c123-server running with data
// Run: cd ../c123-server && npm start
// Or: replay-server + c123-server
test.describe('Screenshot Tests - With Data', () => {
  test('07 - race selector with multiple races', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    await takeDocScreenshot(page, '07-race-selector');
  });

  test('08 - grid with finished competitors', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    await takeDocScreenshot(page, '08-grid-finished');
  });

  test('09 - grid with focus on cell', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const cells = page.locator('.gate-cell');
    const cellCount = await cells.count();
    if (cellCount > 5) {
      await cells.nth(5).click();
    }
    await page.waitForTimeout(300);
    await takeDocScreenshot(page, '09-grid-cell-focus');
  });

  test('10 - grid with on-course section', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    await page.evaluate(() => {
      const grid = document.querySelector('.oncourse-grid');
      if (grid) {
        grid.scrollTop = grid.scrollHeight;
      }
    });
    await page.waitForTimeout(300);
    await takeDocScreenshot(page, '10-grid-oncourse-section');
  });

  test('11 - gate group switcher', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    await takeDocScreenshot(page, '11-gate-group-switcher');
  });

  test('12 - gate group editor', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const editButton = page.locator('.gate-group-switcher .edit-button');
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(500);
    }
    await takeDocScreenshot(page, '12-gate-group-editor');
  });

  test('13 - competitor actions menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const competitorRow = page.locator('.competitor-row').first();
    if (await competitorRow.isVisible()) {
      await competitorRow.click({ button: 'right' });
      await page.waitForTimeout(300);
    }
    await takeDocScreenshot(page, '13-competitor-actions');
  });

  test('14 - check progress in footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Try to click check buttons if they are enabled (only for finished competitors)
    const checkButtons = page.locator('.check-button:not([disabled])');
    const count = await checkButtons.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      try {
        await checkButtons.nth(i).click({ timeout: 1000 });
        await page.waitForTimeout(100);
      } catch {
        // Button might be disabled or detached, continue
      }
    }
    await page.waitForTimeout(300);
    await takeDocScreenshot(page, '14-check-progress');
  });

  test('15 - mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(3000);
    await takeDocScreenshot(page, '15-mobile-view');
  });
});
