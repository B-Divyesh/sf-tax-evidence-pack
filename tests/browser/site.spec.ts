import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('loads a same-origin manifest without browser errors and keeps release metadata', async ({ page }) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('#download-button')).toHaveAttribute('href', /Tax-Evidence-Pack\.AppImage/);
  await expect(page.locator('#download-copy')).toContainText('SHA-256');
  await expect(page.locator('#release-assets li')).toHaveCount(4);
  await expect(page.locator('#release-assets')).toContainText('Tax-Evidence-Pack.deb');
  expect(requests.filter((url) => url.endsWith('/latest.json'))).toEqual(['http://127.0.0.1:4173/latest.json']);
  expect(requests.some((url) => url.includes('github.com/B-Divyesh/sf-tax-evidence-pack/releases/latest/download'))).toBe(false);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(errors).toEqual([]);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('works with keyboard, mobile layout, and an updated offline shell', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toHaveText('Your evidence, ready to review.');
  const caches = await page.evaluate(() => caches.keys());
  expect(caches).toContain('tax-evidence-pack-site-v2');
});
