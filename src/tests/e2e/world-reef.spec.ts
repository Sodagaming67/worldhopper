import { test, expect } from '@playwright/test';
import { seedAdventure } from './helpers/seedAdventure';

test.describe('world 4 — kahaluu reef', () => {
  test('mounts the swim game with d-pad and air meter', async ({ page }) => {
    await seedAdventure(page);
    await page.goto('./world/reef');
    await expect(page.getByText('Kahaluʻu Reef')).toBeVisible();
    await page.getByRole('button', { name: 'Begin world' }).click();
    await expect(page.getByTestId('blitz-hud')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Swim up' })).toBeVisible();
    await expect(page.getByLabel('AIR meter')).toBeVisible();
  });
});
