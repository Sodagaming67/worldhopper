import { test, expect } from '@playwright/test';
import { seedAdventure } from './helpers/seedAdventure';

test.describe('tram dash art proof (ADR 0001 gate)', () => {
  test('captures the chase-cam tram dash for visual review', async ({ page }) => {
    await seedAdventure(page);
    await page.goto('./world/tramDash');
    await page.getByRole('button', { name: 'Begin world' }).click();
    await expect(page.locator('canvas')).toBeVisible();
    // Dodge out of the tram's starting lane so this captures live gameplay
    // rather than an idle-in-the-tram's-lane game-over screen — the tram is
    // now a real in-lane hazard, unlike the old distant end-of-level reveal.
    await page.waitForTimeout(400);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1100);
    await page.screenshot({ path: 'docs/game/artproof/tramdash-chase-after.png' });
  });
});
