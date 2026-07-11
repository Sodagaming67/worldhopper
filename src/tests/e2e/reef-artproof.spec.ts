import { test, expect } from '@playwright/test';
import { seedAdventure } from './helpers/seedAdventure';

test.describe('reef art proof (ADR 0001 gate)', () => {
  test('captures the re-skinned reef for visual review', async ({ page }) => {
    await seedAdventure(page);
    await page.goto('./world/reef');
    await page.getByRole('button', { name: 'Begin world' }).click();
    await expect(page.locator('canvas')).toBeVisible();
    // Let parallax/particles/animation settle before the shot.
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/game/artproof/reef-after.png' });
  });
});
