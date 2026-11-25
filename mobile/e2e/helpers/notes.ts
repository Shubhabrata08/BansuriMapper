import { expect, type Locator } from '@playwright/test';

export async function setNote(slider: Locator, pitchClass: number) {
  await slider.press('Home');
  for (let i = 0; i < pitchClass; i++) await slider.press('ArrowRight');
  await expect(slider).toHaveValue(String(pitchClass));
}
