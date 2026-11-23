import { expect, test } from '@playwright/test';

test('mobile layout and controls match the reference behavior', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByTestId('selected-pitch')).toHaveText('C4');
  await expect(page.getByTestId('fingering-code')).toHaveText('XXXOOO');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('initial.png') });

  await page.getByRole('button', { name: /^Reference bansuri \u00b7 Sa, / }).click();
  await page.getByRole('radio', { name: 'E bansuri \u00b7 Sa sounds E', exact: true }).click();
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

  await page.getByRole('button', { name: /^Thaat, / }).click();
  await page.getByRole('radio', { name: 'Marwa', exact: true }).click();
  await expect(page.getByTestId('note-P')).toHaveCount(0);
  await expect(page.getByTestId('selected-swar')).toHaveText('Sa');
  await page.getByRole('button', { name: 'Reset to C Bhairav', exact: true }).click();
  await expect(page.getByTestId('selected-pitch')).toHaveText('C4');
  expect(errors).toEqual([]);
});
