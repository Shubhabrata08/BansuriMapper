import { expect, test } from '@playwright/test';
import { ragas } from '../src/domain/raga-catalog.web';

test('web raga catalog is complete and alphabetical; Tanpura options do not rename the mapped flute', async ({ page }, testInfo) => {
  await page.goto('./');
  await page.getByRole('button', { name: /^Raga, / }).click();
  const labels = await page.locator('[role="radio"][aria-label]').evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')));
  expect(labels).toHaveLength(66);
  expect(labels).toEqual(ragas.map(raga => raga.name));
  expect(labels).toEqual([...labels].sort((a, b) => a!.localeCompare(b!, 'en')));
  await page.screenshot({ path: testInfo.outputPath('alphabetical-ragas.png') });
  await page.getByRole('radio', { name: 'Bhoopali', exact: true }).click();
  await expect(page.getByTestId('note-M')).toHaveCount(0);
  await expect(page.getByTestId('note-N')).toHaveCount(0);
  await expect(page.getByTestId('note-P')).toHaveCount(1);

  await page.getByRole('button', { name: /^Reference Tanpura, / }).click();
  const expectedKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  for (const key of expectedKeys) await expect(page.getByRole('radio', { name: `${key} tanpura`, exact: true })).toHaveCount(1);
  await page.screenshot({ path: testInfo.outputPath('tanpura-options.png') });
  await page.getByRole('radio', { name: 'E tanpura', exact: true }).click();
  await expect(page.getByTestId('selected-pitch')).toHaveText('E4');
  await expect(page.getByTestId('fingering-code')).toHaveText('XOOOOO');
  await page.getByRole('button', { name: /^Flute being mapped, / }).click();
  await expect(page.getByRole('radio', { name: 'E bansuri \u00b7 Sa sounds E', exact: true })).toHaveCount(1);
  await page.getByRole('radio', { name: 'E bansuri \u00b7 Sa sounds E', exact: true }).click();
  await expect(page.getByTestId('selected-pitch')).toHaveText('E4');
  await expect(page.getByTestId('fingering-code')).toHaveText('XXXOOO');

  await page.getByRole('button', { name: 'Flats', exact: true }).click();
  await page.getByRole('button', { name: /^Reference Tanpura, / }).click();
  await expect(page.getByRole('radio', { name: 'Db tanpura', exact: true })).toHaveCount(1);
  await expect(page.getByRole('radio', { name: 'Eb tanpura', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Close Reference Tanpura', exact: true }).click();

  await page.getByRole('button', { name: 'Reset to C Bhairav', exact: true }).click();
  await page.getByRole('button', { name: /^Raga, / }).click();
  await page.getByRole('radio', { name: 'Khamaj', exact: true }).click();
  await expect(page.getByTestId('note-n')).toHaveCount(1);
  await expect(page.getByTestId('note-N')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /^Thaat, / })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Reference bansuri/ })).toHaveCount(0);
});
