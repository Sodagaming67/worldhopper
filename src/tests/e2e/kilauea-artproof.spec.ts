import { test, expect } from '@playwright/test';
import { seedAdventure } from './helpers/seedAdventure';

test.describe('kilauea art proof (ADR 0001 gate)', () => {
  test('captures the painted kilauea for visual review', async ({ page }) => {
    await seedAdventure(page);
    await page.goto('./world/kilauea');
    await page.getByRole('button', { name: 'Begin world' }).click();
    await expect(page.locator('canvas')).toBeVisible();
    // Let parallax/particles/animation settle before the shot.
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/game/artproof/kilauea-after.png' });
  });
});
