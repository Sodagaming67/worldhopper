import { test, expect } from '@playwright/test';
import { seedAdventure } from './helpers/seedAdventure';

test.describe('world 1 — lagoon', () => {
  test('intro is skippable and the platformer mounts with HUD', async ({ page }) => {
    await seedAdventure(page);
    await page.goto('./world/lagoon');
    await expect(page.getByRole('heading', { name: 'Lagoon of First Light' })).toBeVisible();
    await page.getByRole('button', { name: 'Begin world' }).click();
    await expect(page.getByTestId('apoc-hud')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Jump' })).toBeVisible();
  });

  test('intro auto-dismisses after ~4s without clicking', async ({ page }) => {
    await seedAdventure(page);
    await page.goto('./world/lagoon');
    await expect(page.getByRole('heading', { name: 'Lagoon of First Light' })).toBeVisible();
    // Don't click Skip — prove the 4s auto-dismiss timer (WorldIntro) itself works.
    await expect(page.getByTestId('apoc-hud')).toBeVisible({ timeout: 7000 });
  });
});
