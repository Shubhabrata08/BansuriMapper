import { expect, test } from '@playwright/test';
import { setNote } from './helpers/notes';

test('mobile layout and controls match the reference behavior', async ({ page }, testInfo) => {
  const errors: string[] = [];
  const failedRequests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
  page.on('requestfailed', request => failedRequests.push(request.url()));
  await page.goto('./');
  await expect(page.locator('#mapper-ready')).toBeVisible();
  await expect(page).toHaveTitle('Bansuri Fingering Mapper');
  await expect(page.getByTestId('selected-pitch')).toHaveText('C4');
  await expect(page.getByTestId('fingering-code')).toHaveText('XXXOOO');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('initial.png') });

  await setNote(page.getByRole('slider', { name: 'Reference Tanpura', exact: true }), 4);
  await expect(page.getByTestId('selected-swar')).toHaveText('Sa');
  await expect(page.getByTestId('selected-pitch')).toHaveText('E4');
  await expect(page.getByTestId('fingering-code')).toHaveText('XOOOOO');

  await page.getByRole('button', { name: 'Reset to C Bhairav', exact: true }).click();
  await page.getByTestId('note-r').click();
  await page.getByRole('button', { name: 'Flats', exact: true }).click();
  await expect(page.getByTestId('selected-pitch')).toHaveText('Db4');
  await page.getByTestId('note-P').click();
  await page.getByRole('switch', { name: 'Use alternate Pa fingering', exact: true }).click();
  await expect(page.getByTestId('fingering-code')).toHaveText('OXXXXX');
  await page.getByTestId('fingering-detail').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('alternate-pa.png') });

  await page.getByRole('button', { name: /^Raga, / }).click();
  await page.getByRole('radio', { name: 'Marwa', exact: true }).click();
  await expect(page.getByTestId('note-P')).toHaveCount(0);
  await expect(page.getByTestId('selected-swar')).toHaveText('Sa');
  await page.getByRole('button', { name: 'Reset to C Bhairav', exact: true }).click();
  await expect(page.getByTestId('selected-pitch')).toHaveText('C4');
  await page.reload();
  await expect(page.locator('#mapper-ready')).toBeVisible();
  await expect(page.getByTestId('selected-pitch')).toHaveText('C4');
  await page.getByTestId('note-r').click();
  await expect(page.getByTestId('selected-pitch')).toHaveText('C#4');
  expect(errors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test('exports real HTML and serves assets under the configured path', async ({ request, baseURL }) => {
  const response = await request.get(baseURL!);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('Bansuri Fingering Mapper');
  expect(html).toContain('Raga');
  expect(html).toContain('Reference Tanpura');
  expect(html).toMatch(/<html[^>]*lang="en"/);
  const basePath = new URL(baseURL!).pathname.replace(/\/$/, '');
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
  expect(scripts.length).toBeGreaterThan(0);
  for (const script of scripts) {
    expect(new URL(script, baseURL).pathname.startsWith(basePath + '/')).toBe(true);
  }
  const missing = await request.get(new URL('not-a-real-asset.js', baseURL).href);
  expect(missing.status()).toBe(404);
});
