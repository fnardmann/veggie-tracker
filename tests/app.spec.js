import { test, expect } from '@playwright/test';

test.describe('Veggie Tracker', () => {
  test('homepage loads without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Veggie Tracker');
    await expect(page.locator('[data-tab="overview"]')).toBeVisible();
    await expect(page.locator('[data-tab="nutrition"]')).toBeVisible();
    await expect(page.locator('[data-tab="gallery"]')).toBeVisible();

    expect(errors.filter(e => !e.includes('Warning'))).toHaveLength(0);
  });

  test('can switch tabs', async ({ page }) => {
    await page.goto('/');

    await page.click('[data-tab="nutrition"]');
    await expect(page.locator('#tab-nutrition')).toBeVisible();

    await page.click('[data-tab="gallery"]');
    await expect(page.locator('#tab-gallery')).toBeVisible();

    await page.click('[data-tab="overview"]');
    await expect(page.locator('#tab-overview')).toBeVisible();
  });
});
