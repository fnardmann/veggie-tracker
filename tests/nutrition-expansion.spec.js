import { test, expect } from '@playwright/test';

test.describe('Nutrition tab - vitamin expansion', () => {
  test.beforeEach(async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.click('[data-tab="nutrition"]');
    await page.waitForSelector('.nutr-progress-row');
  });

  test('clicking one vitamin shows its detail panel', async ({ page }) => {
    const firstRow = page.locator('.nutr-progress-row').first();
    await firstRow.click();

    const detail = page.locator('#nutrientDetail');
    await expect(detail).toBeVisible();
    await expect(detail.locator('.nutr-detail-panel')).toBeVisible();
  });

  test('clicking a second vitamin closes the first and opens the second', async ({ page }) => {
    const rows = page.locator('.nutr-progress-row');
    const firstRow = rows.nth(0);
    const secondRow = rows.nth(1);

    await firstRow.click();
    const detail = page.locator('#nutrientDetail');
    await expect(detail).toBeVisible();

    const firstNutrientName = await firstRow.locator('.nutr-progress-label').textContent();

    await secondRow.click();
    await expect(detail).toBeVisible();

    const secondNutrientName = await secondRow.locator('.nutr-progress-label').textContent();
    const panelNutrient = await detail.locator('.nutr-detail-nutrient').textContent();

    expect(panelNutrient.trim()).toBe(secondNutrientName.trim());
    expect(panelNutrient.trim()).not.toBe(firstNutrientName.trim());
  });

  test('clicking same vitamin twice closes it', async ({ page }) => {
    const firstRow = page.locator('.nutr-progress-row').first();
    await firstRow.click();

    const detail = page.locator('#nutrientDetail');
    await expect(detail).toBeVisible();

    await firstRow.click();
    await expect(detail).toBeHidden();
  });
});
