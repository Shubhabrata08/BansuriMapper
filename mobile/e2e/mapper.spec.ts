import { expect, test } from '@playwright/test';
import { expectFingering, setNote } from './helpers/notes';

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
  await expectFingering(page, 'XXXOOO');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('initial.png') });

  await setNote(page.getByRole('slider', { name: 'Reference Tanpura', exact: true }), 4);
  await expect(page.getByTestId('selected-swar')).toHaveText('Sa');
  await expect(page.getByTestId('selected-pitch')).toHaveText('E4');
  await expectFingering(page, 'XOOOOO');

  await page.getByRole('button', { name: 'Reset to C Bhairav', exact: true }).click();
  await page.getByTestId('note-r').click();
  await page.getByRole('button', { name: 'Flats', exact: true }).click();
  await expect(page.getByTestId('selected-pitch')).toHaveText('Db4');
  await page.getByTestId('note-P').click();
  await page.getByRole('switch', { name: 'Use alternate Pa fingering', exact: true }).click();
  await expectFingering(page, 'OXXXXX');
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

test('swara details use diagrams without redundant instructions and natural swaras omit Shuddha', async ({ page }, testInfo) => {
  await page.goto('./');
  await expect(page.locator('#mapper-ready')).toBeVisible();
  const detail = page.getByTestId('fingering-detail');
  await expectFingering(page, 'XXXOOO');
  await expect(detail).not.toContainText(/normal register|Close H1|Fingering code|XXXOOO/);
  await expect(page.getByTestId('technique-title')).toHaveCount(0);
  await expect(page.getByTestId('technique-hint')).toHaveCount(0);
  await expect(page.getByTestId('fingering-code')).toHaveCount(0);
  await expect(page.getByTestId('note-r')).toHaveAccessibleName(/^Komal Re,/);

  await page.getByRole('button', { name: /^Raga, / }).click();
  await page.getByRole('radio', { name: 'Khamaj', exact: true }).click();
  for (const [key, name] of [['R', 'Re'], ['G', 'Ga'], ['M', 'Ma'], ['D', 'Dha'], ['N', 'Ni']]) {
    const note = page.getByTestId(`note-${key}`);
    await expect(note.getByText(name, { exact: true })).toBeVisible();
    await expect(note).toHaveAccessibleName(new RegExp(`^${name},`));
  }
  await expect(page.getByTestId('note-n')).toHaveAccessibleName(/^Komal Ni,/);
  await expect(page.getByTestId('raga-variant-note')).toContainText('Ni in ascent');
  await expect(page.locator('#mapper-ready')).not.toContainText(/shuddha/i);
  await page.getByTestId('note-G').click();
  await expect(page.getByTestId('selected-relative')).toContainText('flute Sa \u00b7 Ga');
  await expectFingering(page, 'XOOOOO');
  await detail.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('simplified-swara.png') });

  await page.getByRole('button', { name: /^Raga, / }).click();
  await page.getByRole('radio', { name: 'Marwa', exact: true }).click();
  await expect(page.getByTestId('note-M#')).toHaveAccessibleName(/^Tivra Ma,/);
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
