import { test, expect } from '@playwright/test';
import { seedAdventure } from './helpers/seedAdventure';

test.describe('world 3 — sunline tram dash (chase-cam)', () => {
  test('mounts the chase-cam runner with a dash button and swipe hint', async ({ page }) => {
    await seedAdventure(page);
    await page.goto('./world/tramDash');
    await expect(page.getByText('Sunline Tram Dash')).toBeVisible();
    await page.getByRole('button', { name: 'Begin world' }).click();
    await expect(page.getByTestId('blitz-hud')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dash' })).toBeVisible();
    // The old button controls are gone — swipes replace them.
    await expect(page.getByRole('button', { name: 'Lane up' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Lane down' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Jump' })).toHaveCount(0);
    await expect(page.getByTestId('swipe-hint')).toBeVisible();
    await expect(page.getByLabel('DASH meter')).toBeVisible();
  });

  test('keyboard and swipe input drive the run without crashing', async ({ page }) => {
    await seedAdventure(page);
    await page.goto('./world/tramDash');
    await page.getByRole('button', { name: 'Begin world' }).click();
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    // Keyboard: lane switches, jump, slide, dash key.
    for (const key of ['ArrowLeft', 'ArrowRight', 'Space', 'ArrowDown', 'e']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(180);
    }
    // Swipes: left, up (jump), down (slide) across the canvas.
    const box = (await canvas.boundingBox())!;
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    for (const [dx, dy] of [[-120, 0], [0, -120], [0, 120]] as const) {
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx + dx, cy + dy, { steps: 4 });
      await page.mouse.up();
      await page.waitForTimeout(200);
    }
    // The run survived a burst of every input: HUD still live, canvas intact.
    await expect(page.getByTestId('blitz-hud')).toBeVisible();
    await expect(canvas).toBeVisible();
  });
});
