import { expect, type Locator, type Page } from '@playwright/test';

export async function setNote(slider: Locator, pitchClass: number) {
  await slider.press('Home');
  for (let i = 0; i < pitchClass; i++) await slider.press('ArrowRight');
  await expect(slider).toHaveValue(String(pitchClass));
}

export async function expectFingering(page: Page, pattern: string) {
  const states: Record<string, string> = { X: 'Closed', H: 'Half-covered', O: 'Open' };
  const description = [...pattern].map((hole, index) => `Hole ${index + 1}: ${states[hole]}`).join(', ');
  await expect(page.getByTestId('fingering-detail').getByRole('img')).toHaveAttribute('aria-label', description);
}
