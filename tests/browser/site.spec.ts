import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('@claim:sample-data shows a realistic populated evidence binder in one click', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review a populated evidence binder');
  await expect(page.getByText('Demo — sample data.')).toBeVisible();
  await expect(page.getByText('5', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Luma Rail client visit' })).toBeVisible();
  await expect(page.getByText('Needs support', { exact: true }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start for real' })).toHaveAttribute('href', '/#download');
});

test('@claim:demo-isolation keeps sample changes separate and makes no third-party requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/');
  await page.evaluate(() => localStorage.setItem('tax-evidence-pack:real-data', 'leave-this-alone'));
  await page.getByRole('button', { name: 'Add sample reminder' }).click();
  await expect(page.getByText('6 records shown')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('tax-evidence-pack:real-data'))).toBe('leave-this-alone');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('demo:')))).toEqual(['demo:tax-evidence-pack:records']);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('5 records shown')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('demo:tax-evidence-pack:records'))).toBeNull();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:sample-export downloads a ZIP with a PDF index and sample originals', async ({ page }) => {
  await page.goto('/demo/');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export sample review pack' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('tax-evidence-pack-2025-sample.zip');
  const path = await download.path();
  expect(path).not.toBeNull();
  const bytes = await readFile(path!);
  expect(bytes.subarray(0, 4).toString('binary')).toBe('PK\u0003\u0004');
  const output = bytes.toString('utf8');
  expect(output).toContain('Tax Evidence Pack 2025 sample review index.pdf');
  expect(output).toContain('originals/2025-05-14-luma-rail.txt');
  await expect(page.locator('#demo-status')).toContainText('PDF index and four original-file entries');
});

test('@claim:offline-demo reloads the sample after the first visit', async ({ browser }) => {
  const demoContext = await browser.newContext();
  const demoPage = await demoContext.newPage();
  try {
    await demoPage.goto('http://127.0.0.1:4173/demo/');
    await demoPage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await demoContext.setOffline(true);
    await demoPage.reload();
    await expect(demoPage.getByRole('heading', { level: 1 })).toHaveText('Review a populated evidence binder');
    await expect(demoPage.getByText('Demo — sample data.')).toBeVisible();
  } finally {
    await demoContext.close();
  }
});

test('@claim:release-manifest resolves a same-origin published installer and checksum', async ({ page }) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#download-button')).toHaveAttribute('href', /Tax-Evidence-Pack\.AppImage/);
  await expect(page.locator('#download-copy')).toContainText('SHA-256');
  await expect(page.locator('#release-assets li')).toHaveCount(4);
  expect(requests.filter((url) => url.endsWith('/latest.json'))).toEqual(['http://127.0.0.1:4173/latest.json']);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(errors).toEqual([]);
});

test('has accessible routes, keyboard focus, a responsive demo, and a designed 404 page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeInViewport();
  expect((await page.locator('#restore').boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect((await page.locator('footer a[href="/privacy/"]').boundingBox())?.height).toBeGreaterThanOrEqual(44);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Tax Evidence Pack');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review a populated evidence binder');
  const response = await page.goto('/not-a-real-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page is not in the evidence binder');
  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Tax Evidence Pack');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('How Tax Evidence Pack handles data');
  await page.goto('/terms');
  await expect(page).toHaveTitle('Terms — Tax Evidence Pack');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms for Tax Evidence Pack');
});
