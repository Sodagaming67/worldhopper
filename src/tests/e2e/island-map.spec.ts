import { test, expect, type Page } from '@playwright/test';
import { seedAdventure } from './helpers/seedAdventure';

test.describe('island map', () => {
  test('shows all 8 world nodes with genre variety', async ({ page }: { page: Page }) => {
    await seedAdventure(page);
    await page.goto('./map');
    for (const id of ['lagoon', 'poolSlides', 'tramDash', 'reef', 'blackSand', 'lavaTube', 'lavaFlow', 'kilauea']) {
      await expect(page.getByTestId(`world-node-${id}`)).toBeVisible();
    }
    await expect(page.getByRole('heading', { name: 'Big Island Blitz' })).toBeVisible();
  });

  test('coming-soon world shows the placeholder, not a game', async ({ page }: { page: Page }) => {
    await seedAdventure(page);
    await page.goto('./map');
    await page.getByTestId('world-node-lavaTube').click();
    await expect(page.getByText(/still forming/i)).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
    await page.getByRole('button', { name: 'Back to map' }).click();
    await expect(page.getByTestId('world-node-lagoon')).toBeVisible();
  });

  test('the island hero waits at the next uncleared world', async ({ page }: { page: Page }) => {
    await seedAdventure(page);
    await page.goto('./map');
    // Fresh save → World 1 is next up; the painted hero token marks it.
    await expect(page.getByTestId('map-hero-token')).toBeVisible();
    await expect(page.getByAltText(/You are here: Lagoon of First Light/)).toBeVisible();
  });
});
