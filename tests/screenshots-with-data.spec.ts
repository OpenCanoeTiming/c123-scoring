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

// Helper to wait for Results data and select K1m race
async function waitForDataAndSelectRace(page: Page) {
  await page.goto('/');

  // Clear localStorage to reset race selection (must be after navigation)
  await page.evaluate(() => localStorage.clear());

  // Reload to apply cleared storage
  await page.reload();

  // Wait for connection
  await page.waitForTimeout(2000);

  // Try to select K1m 2. jízda (the race with Results data in replay)
  // New RaceSelector uses a select inside .race-selector
  const raceSelector = page.locator('.race-selector select');
  if (await raceSelector.isVisible()) {
    // Find K1m 2. jízda option specifically
    const k1m2Option = page.locator('.race-selector select option:has-text("K1m"):has-text("2. jízda")').first();
    if (await k1m2Option.count() > 0) {
      const value = await k1m2Option.getAttribute('value');
      if (value) {
        await raceSelector.selectOption(value);
        await page.waitForTimeout(2000); // Wait for data to load
      }
    }
  }

  // Wait for grid to appear (with longer timeout) - now uses .results-grid table tbody tr
  await page.waitForSelector('.results-grid tbody tr', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
}

// These tests require c123-server running with data
// Run: cd ../c123-server && npm start
// Or: replay-server + c123-server
test.describe('Screenshot Tests - With Data', () => {
  test('07 - race selector with multiple races', async ({ page }) => {
    await waitForDataAndSelectRace(page);
    await takeDocScreenshot(page, '07-race-selector');
  });

  test('08 - grid with finished competitors', async ({ page }) => {
    await waitForDataAndSelectRace(page);
    await takeDocScreenshot(page, '08-grid-finished');
  });

  test('09 - grid with focus on cell', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Use .penalty-cell for gate cells
    const cells = page.locator('.penalty-cell');
    const cellCount = await cells.count();
    if (cellCount > 5) {
      await cells.nth(5).click();
    }
    await page.waitForTimeout(300);
    await takeDocScreenshot(page, '09-grid-cell-focus');
  });

  test('10 - grid with gate group indicator', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Click on a gate group indicator button to show dimming effect
    const groupButtons = page.locator('.gate-group-indicator-btn');
    if (await groupButtons.count() > 0) {
      await groupButtons.first().click();
      await page.waitForTimeout(300);
    }
    await takeDocScreenshot(page, '10-grid-oncourse-section');
  });

  test('11 - gate group indicators', async ({ page }) => {
    await waitForDataAndSelectRace(page);
    // Gate groups are now shown in the grid header as GateGroupIndicatorRow
    await takeDocScreenshot(page, '11-gate-group-switcher');
  });

  test('12 - settings display tab', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Open settings
    await page.click('button[aria-label="Settings"]');
    await page.waitForTimeout(500);

    // Click on Display tab
    await page.click('[data-testid="settings-tab-display"]');
    await page.waitForTimeout(300);

    await takeDocScreenshot(page, '12-gate-group-editor');
  });

  test('13 - competitor actions menu', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Use table row for right-click menu
    const competitorRow = page.locator('.results-grid tbody tr').first();
    if (await competitorRow.isVisible()) {
      await competitorRow.click({ button: 'right' });
      await page.waitForTimeout(300);
    }
    await takeDocScreenshot(page, '13-competitor-actions');
  });

  test('14 - check progress in footer', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Try to click check buttons if they are enabled (only for finished competitors)
    // New class is .check-btn
    const checkButtons = page.locator('.check-btn:not([disabled])');
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

  // Mobile view removed - targeting tablets, not phones

  test('18 - tablet landscape', async ({ page }) => {
    // iPad Pro 12.9" landscape
    await page.setViewportSize({ width: 1366, height: 1024 });
    await waitForDataAndSelectRace(page);
    await takeDocScreenshot(page, '18-tablet-landscape');
  });

  test('19 - tablet portrait', async ({ page }) => {
    // iPad Pro 12.9" portrait
    await page.setViewportSize({ width: 1024, height: 1366 });
    await waitForDataAndSelectRace(page);
    await takeDocScreenshot(page, '19-tablet-portrait');
  });

  test('17 - dark mode', async ({ page }) => {
    // Enable dark mode via media query emulation BEFORE navigation
    await page.emulateMedia({ colorScheme: 'dark' });
    await waitForDataAndSelectRace(page);
    // Extra wait to ensure K1m data loads
    await page.waitForSelector('.competitor-row', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
    await takeDocScreenshot(page, '17-dark-mode');
  });
});
