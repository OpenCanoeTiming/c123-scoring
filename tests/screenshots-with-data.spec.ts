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
  // RaceSelector uses select[aria-label="Select race"] from DS Select component
  const raceSelector = page.locator('select[aria-label="Select race"]');
  if (await raceSelector.isVisible()) {
    // Get all options and find K1m 2. jízda
    const options = page.locator('select[aria-label="Select race"] option');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text?.includes('K1m') && text?.includes('2.')) {
        const value = await options.nth(i).getAttribute('value');
        if (value) {
          await raceSelector.selectOption(value);
          await page.waitForTimeout(2000); // Wait for data to load
          break;
        }
      }
    }
  }

  // Wait for grid to appear (with longer timeout) - uses .results-grid table tbody tr
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

  test('10 - grid with gate group indicator active', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Click on a gate group indicator button to show dimming effect
    const groupButtons = page.locator('.gate-group-indicator-btn');
    if (await groupButtons.count() > 0) {
      await groupButtons.first().click();
      await page.waitForTimeout(300);
    }
    await takeDocScreenshot(page, '10-gate-group-active');
  });

  test('11 - gate group indicators row', async ({ page }) => {
    await waitForDataAndSelectRace(page);
    // Gate groups are shown in the grid header as GateGroupIndicatorRow
    // Make sure gate groups are visible (deactivate any active group)
    const activeGroup = page.locator('.gate-group-indicator--active');
    if (await activeGroup.count() > 0) {
      await activeGroup.click();
      await page.waitForTimeout(300);
    }
    await takeDocScreenshot(page, '11-gate-group-indicators');
  });

  test('12 - gate group editor in settings', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Open settings
    await page.click('button[aria-label="Settings"]');
    await page.waitForSelector('[data-testid="settings-panel"]', { timeout: 5000 });
    await page.waitForTimeout(300);

    // Click on Display tab to show gate group options
    await page.click('[data-testid="settings-tab-display"]');
    await page.waitForTimeout(300);

    await takeDocScreenshot(page, '12-settings-display');
  });

  test('13 - competitor actions menu', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Use table row for right-click context menu
    const competitorRow = page.locator('.results-grid tbody tr').first();
    if (await competitorRow.isVisible()) {
      await competitorRow.click({ button: 'right' });
      await page.waitForTimeout(300);
    }
    await takeDocScreenshot(page, '13-competitor-actions');
  });

  test('14 - check progress in footer', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Click check buttons for some finished competitors
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

  test('17 - dark mode', async ({ page }) => {
    // Enable dark mode via media query emulation BEFORE navigation
    await page.emulateMedia({ colorScheme: 'dark' });
    await waitForDataAndSelectRace(page);
    // Wait for grid rows to appear
    await page.waitForSelector('.results-grid tbody tr', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
    await takeDocScreenshot(page, '17-dark-mode');
  });

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

  test('20 - horizontal scroll with sticky columns', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Scroll the grid horizontally to the right
    const grid = page.locator('.results-grid');
    await grid.evaluate((el) => {
      el.scrollLeft = 400; // Scroll right to show sticky columns in action
    });
    await page.waitForTimeout(300);
    await takeDocScreenshot(page, '20-horizontal-scroll');
  });

  test('21 - vertical scroll with sticky header', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Scroll the grid vertically down
    const grid = page.locator('.results-grid');
    await grid.evaluate((el) => {
      el.scrollTop = 200; // Scroll down to show sticky header
    });
    await page.waitForTimeout(300);
    await takeDocScreenshot(page, '21-vertical-scroll');
  });

  test('22 - debug header visibility', async ({ page }) => {
    await waitForDataAndSelectRace(page);

    // Debug: check if thead exists and is visible
    const thead = page.locator('.results-grid thead');
    const theadVisible = await thead.isVisible();
    const theadCount = await thead.count();
    const headerCells = await page.locator('.results-grid thead th').count();

    console.log(`[Debug] thead visible: ${theadVisible}, count: ${theadCount}, header cells: ${headerCells}`);

    // Get thead bounding box
    const box = await thead.boundingBox();
    console.log(`[Debug] thead bounding box:`, box);

    // Get positions of various elements
    const gridBox = await page.locator('.results-grid').boundingBox();
    const appHeaderBox = await page.locator('header').first().boundingBox();
    const mainBox = await page.locator('main').boundingBox();
    const tbodyBox = await page.locator('.results-grid tbody').boundingBox();
    const firstRow = await page.locator('.results-grid tbody tr').first().boundingBox();

    console.log(`[Debug] App header:`, appHeaderBox);
    console.log(`[Debug] Main:`, mainBox);
    console.log(`[Debug] Grid:`, gridBox);
    console.log(`[Debug] Tbody:`, tbodyBox);
    console.log(`[Debug] First data row:`, firstRow);

    // Check thead row count
    const theadRows = await page.locator('.results-grid thead tr').count();
    console.log(`[Debug] Thead rows: ${theadRows}`);

    // Get first header row height
    const firstHeaderRow = await page.locator('.results-grid thead tr').first().boundingBox();
    console.log(`[Debug] First header row:`, firstHeaderRow);

    await takeDocScreenshot(page, '22-debug-header');
  });
});
