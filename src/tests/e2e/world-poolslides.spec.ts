import { test, expect } from '@playwright/test';
import { seedAdventure } from './helpers/seedAdventure';

test.describe('world 2 — sunsplash slides', () => {
  test('intro skips into the slide game with the blitz HUD', async ({ page }) => {
    await seedAdventure(page);
    await page.goto('./world/poolSlides');
    await expect(page.getByText('Sunsplash Slides')).toBeVisible();
    await page.getByRole('button', { name: 'Begin world' }).click();
    await expect(page.getByTestId('blitz-hud')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Jump' })).toBeVisible();
    await expect(page.getByLabel('SPEED meter')).toBeVisible();
  });
});
