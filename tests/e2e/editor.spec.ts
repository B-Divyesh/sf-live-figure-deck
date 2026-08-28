import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('authors, animates, and exports an offline HTML slide', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await expect(page.getByRole('heading', { name: 'Animate the idea, not the slide.' })).toBeVisible();
  await page.getByRole('button', { name: 'Open example' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A wave gathers amplitude');

  const formula = page.getByLabel(/Equation/);
  await formula.fill('a * cos(b * x) + c');
  await expect(formula).toHaveAttribute('aria-invalid', 'false');
  await page.getByRole('button', { name: 'Play animation' }).click();
  await expect(page.getByRole('button', { name: 'Pause animation' })).toBeVisible();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Pause animation' }).click();
  await expect(page.locator('#time-output')).not.toHaveText(/^0\.00/);

  await page.getByRole('button', { name: 'Export' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download HTML' }).click();
  expect((await download).suggestedFilename()).toMatch(/wave-gathers-amplitude\.html/);
  expect(errors).toEqual([]);
});

test('reports formula errors and supports interval creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Start blank' }).click();
  await page.getByLabel(/Equation/).fill('mystery(x)');
  await expect(page.getByRole('alert')).toContainText('Unknown function');
  await page.getByLabel(/Equation/).fill('a * x + c');
  await page.getByRole('button', { name: 'Add animation interval' }).click();
  await page.getByLabel('Interval name').fill('Rise');
  await page.getByLabel('Start time').fill('0');
  await page.getByLabel('End time').fill('2');
  await page.getByRole('button', { name: 'Save interval' }).click();
  await expect(page.getByRole('button', { name: /Rise/ }).last()).toBeVisible();
});

test('passes automated accessibility checks after onboarding', async ({ page }) => {
  await page.getByRole('button', { name: 'Open example' }).click();
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('restores a returned Studio license without exposing it in the URL', async ({ page }) => {
  await page.route('**/verify?license=token-123', route => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.goto('/?license=token-123');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#license-label')).toHaveText('Studio');
  await expect(page.locator('#license-message')).toContainText('active');
});

test('fits the editor at 390 CSS pixels without horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.getByRole('button', { name: 'Open example' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
  await expect(page.getByRole('button', { name: 'Play animation' })).toBeVisible();
});
