import { test, expect } from '@playwright/test';
import { seedAdventure } from './helpers/seedAdventure';

test.describe('world 7 — kilauea', () => {
  test('finale world mounts full-screen with hearts, score and weapon HUD for Ember', async ({ page }) => {
    await seedAdventure(page, { heroSkin: 'blaze' });
    await page.goto('./world/kilauea');
    await page.getByRole('button', { name: 'Begin world' }).click();

    const hud = page.getByTestId('apoc-hud');
    await expect(hud).toBeVisible();
    await expect(hud.getByLabel(/lives/)).toBeVisible();
    await expect(hud.getByLabel(/Weapon/)).toBeVisible(); // arsenal hero shows weapon slot
    await expect(page.getByRole('button', { name: 'Difficulty: chill' })).toBeVisible();
  });
});
