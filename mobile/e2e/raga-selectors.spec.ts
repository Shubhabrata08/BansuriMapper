import { expect, test } from '@playwright/test';
import { ragas } from '../src/domain/raga-catalog.web';
import { expectFingering, setNote } from './helpers/notes';

test('web raga catalog stays alphabetical and both note sliders preserve independent keys', async ({ page }, testInfo) => {
  await page.goto('./');
  await expect(page.locator('#mapper-ready')).toBeVisible();
  await page.getByRole('button', { name: /^Raga, / }).click();
  await expect(page.locator('[role="radio"][aria-label]')).toHaveCount(66);
  const labels = await page.locator('[role="radio"][aria-label]').evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')));
  expect(labels).toHaveLength(66);
  expect(labels).toEqual(ragas.map(raga => raga.name));
  expect(labels).toEqual([...labels].sort((a, b) => a!.localeCompare(b!, 'en')));
  await page.screenshot({ path: testInfo.outputPath('alphabetical-ragas.png') });
  await page.getByRole('radio', { name: 'Bhoopali', exact: true }).click();
  await expect(page.getByTestId('note-M')).toHaveCount(0);
  await expect(page.getByTestId('note-N')).toHaveCount(0);
  await expect(page.getByTestId('note-P')).toHaveCount(1);

  const tanpura = page.getByRole('slider', { name: 'Reference Tanpura', exact: true });
  const bansuri = page.getByRole('slider', { name: 'Mapped bansuri', exact: true });
  const expectedKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  expect(await page.getByTestId('reference-slider').locator('[data-note]').allTextContents()).toEqual(expectedKeys);
  expect(await page.getByTestId('flute-slider').locator('[data-note]').allTextContents()).toEqual(expectedKeys);
  await setNote(tanpura, 4);
  await expect(tanpura).toHaveAttribute('aria-valuetext', 'E tanpura');
  await expect(page.getByTestId('selected-pitch')).toHaveText('E4');
  await expectFingering(page, 'XOOOOO');
  await setNote(bansuri, 4);
  await expect(bansuri).toHaveAttribute('aria-valuetext', 'E bansuri');
  await expect(page.getByTestId('selected-pitch')).toHaveText('E4');
  await expectFingering(page, 'XXXOOO');

  await page.getByRole('button', { name: 'Flats', exact: true }).click();
  const flatKeys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  expect(await page.getByTestId('reference-slider').locator('[data-note]').allTextContents()).toEqual(flatKeys);
  expect(await page.getByTestId('flute-slider').locator('[data-note]').allTextContents()).toEqual(flatKeys);
  await setNote(tanpura, 1);
  await expect(tanpura).toHaveAttribute('aria-valuetext', 'Db tanpura');
  await expect(bansuri).toHaveValue('4');

  await page.getByRole('button', { name: 'Reset to C Bhairav', exact: true }).click();
  await expect(tanpura).toHaveValue('0');
  await expect(bansuri).toHaveValue('0');
  await page.getByRole('button', { name: /^Raga, / }).click();
  await page.getByRole('radio', { name: 'Khamaj', exact: true }).click();
  await expect(page.getByTestId('note-n')).toHaveCount(1);
  await expect(page.getByTestId('note-N')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /^Thaat, / })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Reference bansuri/ })).toHaveCount(0);
});
