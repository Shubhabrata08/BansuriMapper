import { expect, test } from '@playwright/test';
import { expectFingering, setNote } from './helpers/notes';

test('note sliders snap to all twelve keys, support pointer input and keep the existing octave convention', async ({ page }, testInfo) => {
  await page.goto('./');
  await expect(page.locator('#mapper-ready')).toBeVisible();
  const tanpura = page.getByRole('slider', { name: 'Reference Tanpura', exact: true });
  const bansuri = page.getByRole('slider', { name: 'Mapped bansuri', exact: true });
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const pitches = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3'];
  for (const slider of [tanpura, bansuri]) {
    await expect(slider).toHaveAttribute('min', '0');
    await expect(slider).toHaveAttribute('max', '11');
    await expect(slider).toHaveAttribute('step', '1');
  }
  for (let i = 0; i < keys.length; i++) {
    await tanpura.press(i === 0 ? 'Home' : 'ArrowRight');
    await expect(tanpura).toHaveValue(String(i));
    await expect(tanpura).toHaveAttribute('aria-valuetext', `${keys[i]} tanpura`);
    await expect(page.getByTestId('selected-pitch')).toHaveText(pitches[i]);
  }
  await tanpura.press('ArrowRight');
  await expect(tanpura).toHaveValue('11');
  await tanpura.press('Home');
  await tanpura.press('ArrowLeft');
  await expect(tanpura).toHaveValue('0');
  for (let i = 0; i < keys.length; i++) {
    await bansuri.press(i === 0 ? 'Home' : 'ArrowRight');
    await expect(bansuri).toHaveValue(String(i));
    await expect(bansuri).toHaveAttribute('aria-valuetext', `${keys[i]} bansuri`);
    await expect(page.getByTestId('selected-pitch')).toHaveText('C4');
  }
  await setNote(bansuri, 0);
  await tanpura.scrollIntoViewIfNeeded();
  const box = (await tanpura.boundingBox())!;
  const x = box.x + 12 + (box.width - 24) * 8 / 11;
  const y = box.y + box.height / 2;
  if (testInfo.project.name === 'phone') await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
  await expect(tanpura).toHaveValue('8');
  await expect(page.getByTestId('selected-pitch')).toHaveText('G#3');

  await page.getByRole('button', { name: 'Reset to C Bhairav', exact: true }).click();
  await page.getByTestId('note-P').click();
  await page.getByRole('switch', { name: 'Use alternate Pa fingering', exact: true }).click();
  await expectFingering(page, 'OXXXXX');
  await setNote(tanpura, 1);
  await setNote(tanpura, 0);
  await expectFingering(page, 'XXXXXX');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('desktop mapping starts beside the controls without scrolling; phone layout stays stacked', async ({ page }, testInfo) => {
  await page.goto('./');
  await expect(page.locator('#mapper-ready')).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Reference Tanpura', exact: true })).toBeVisible();
  const controls = (await page.getByTestId('controls-column').boundingBox())!;
  const mapping = (await page.getByTestId('mapping-panel').boundingBox())!;
  const viewport = page.viewportSize()!;
  if (viewport.width >= 768) {
    expect(mapping.x).toBeGreaterThan(controls.x + controls.width);
    await expect(page.getByRole('heading', { name: 'Swara map', exact: true })).toBeInViewport();
    expect(mapping.y).toBeLessThan(viewport.height - 120);
  } else {
    expect(Math.abs(mapping.x - controls.x)).toBeLessThan(30);
    expect(mapping.y).toBeGreaterThan(controls.y + controls.height);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('note-sliders-layout.png') });
});
