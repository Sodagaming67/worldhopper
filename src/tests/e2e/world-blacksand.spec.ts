import { test, expect } from '@playwright/test';
import { seedAdventure } from './helpers/seedAdventure';

test.describe('world 5 — punaluu black sands', () => {
  test('mounts the platformer with the apoc HUD at dusk', async ({ page }) => {
    await seedAdventure(page);
    await page.goto('./world/blackSand');
    await expect(page.getByText('Punaluʻu Black Sands')).toBeVisible();
    await page.getByRole('button', { name: 'Begin world' }).click();
    await expect(page.getByTestId('apoc-hud')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Jump' })).toBeVisible();
  });
});
