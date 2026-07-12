import { test, expect } from '@playwright/test';

test.describe('Smoke — island map is the default screen', () => {
  test('root loads straight into the map, no onboarding gate', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('heading', { name: 'Big Island Blitz' })).toBeVisible();
  });

  test('fresh visitor can open World 1 without any setup', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /World 1:/ }).click();
    await expect(page).toHaveURL(/\/world\//);
  });
});

test.describe('SPA routing via CloudFront Function', () => {
  test('deep link to /map serves the app', async ({ page }) => {
    const response = await page.goto('./map');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Big Island Blitz' })).toBeVisible();
  });

  test('deep link to /settings serves the app, not a 403', async ({ page }) => {
    const response = await page.goto('./settings');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
  });

  test('deep link to unknown route shows 404 component', async ({ page }) => {
    await page.goto('./this-route-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
  });
});

test.describe('PWA / meta', () => {
  test('page title is set', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle(/World Hopper/i);
  });

  test('manifest.json is reachable', async ({ request }) => {
    const resp = await request.get('./manifest.webmanifest');
    expect(resp.status()).toBe(200);
  });
});
