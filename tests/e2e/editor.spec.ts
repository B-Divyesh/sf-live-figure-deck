import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const isMobileProject = (name: string) => name === 'mobile';

async function openCleanDemo(page: Page): Promise<void> {
  await page.goto('/demo');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved to your figures')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A wave gathers amplitude');
}

async function downloadedText(page: Page, action: () => Promise<void>): Promise<string> {
  const pending = page.waitForEvent('download');
  await action();
  const download = await pending;
  const path = await download.path();
  if (!path) throw new Error('The browser did not provide a downloaded file.');
  return readFile(path, 'utf8');
}

function storedZipEntries(data: Buffer): Map<string, Buffer> {
  const entries = new Map<string, Buffer>();
  let offset = 0;
  while (offset + 30 <= data.length && data.readUInt32LE(offset) === 0x04034b50) {
    const size = data.readUInt32LE(offset + 18);
    const nameLength = data.readUInt16LE(offset + 26);
    const extraLength = data.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const bodyStart = nameStart + nameLength + extraLength;
    const name = data.subarray(nameStart, nameStart + nameLength).toString('utf8');
    entries.set(name, data.subarray(bodyStart, bodyStart + size));
    offset = bodyStart + size;
  }
  return entries;
}

test('first screen states the job, audience, and first action', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Live Figure Deck — Build animated formula figures');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Build an animated figure from a formula');
  await expect(page.getByText(/For scientists and educators/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' }).first()).toBeVisible();
  await expect(page.locator('.plain-facts li')).toHaveCount(3);
  if (isMobileProject(testInfo.project.name)) {
    const action = await page.getByRole('link', { name: 'Try it with sample data' }).first().boundingBox();
    expect(action?.y).toBeLessThan(844);
  }
});

test('@claim:expression-evaluation evaluates supported formulas with standard exponent precedence', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'claim runs once in desktop Chromium');
  await openCleanDemo(page);
  await page.getByLabel(/Equation/).fill('-x^2');
  await page.getByText('Plot window', { exact: true }).click();
  for (const [label, value] of [['x min', '1'], ['x max', '2'], ['y min', '-5'], ['y max', '0']] as const) {
    const input = page.getByLabel(label, { exact: true });
    await input.fill(value);
    await input.press('Tab');
  }
  await expect(page.locator('#chart-description')).toContainText('Visible sampled y values range from -4.00 to -1.00');
  await page.getByLabel(/Equation/).fill('sqrt(abs(x)) + cos(pi) + a');
  await expect(page.getByLabel(/Equation/)).toHaveAttribute('aria-invalid', 'false');
});

test('@claim:interval-timing uses named exact intervals and rejects overlap', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'claim runs once in desktop Chromium');
  await openCleanDemo(page);
  await expect(page.getByRole('button', { name: /Edit Reveal amplitude, 0 to 3 seconds/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Edit Lift the baseline, 3.2 to 5.4 seconds/ })).toBeVisible();
  await page.locator('#scrubber').fill('180');
  await expect(page.locator('#chart-description')).toContainText('a 2.00, b 1.00, c 0.80');
  await page.getByRole('button', { name: 'Add animation interval' }).click();
  await page.getByLabel('Interval name').fill('Overlapping rise');
  await page.getByLabel('Start time').fill('2');
  await page.getByLabel('End time').fill('4');
  await page.getByRole('button', { name: 'Save interval' }).click();
  await expect(page.locator('#interval-error')).toContainText('overlap on a');
  await page.getByLabel('Parameter').selectOption('b');
  await page.getByRole('button', { name: 'Save interval' }).click();
  await expect(page.getByRole('button', { name: /Overlapping rise/ }).last()).toBeVisible();
});

test('@claim:frame-playback clamps 1–60 fps and steps exact frames', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'claim runs once in desktop Chromium');
  await openCleanDemo(page);
  const fps = page.getByLabel('Frame rate');
  await fps.fill('0'); await fps.press('Tab'); await expect(fps).toHaveValue('1');
  await fps.fill('61'); await fps.press('Tab'); await expect(fps).toHaveValue('60');
  await fps.fill('30'); await fps.press('Tab');
  const duration = page.getByLabel('Duration');
  await duration.fill('0'); await duration.press('Tab'); await expect(duration).toHaveValue('1');
  await duration.fill('61'); await duration.press('Tab'); await expect(duration).toHaveValue('60');
  await duration.fill('6'); await duration.press('Tab');
  await page.locator('.formula-display').click();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#time-output')).toHaveText('0.03 / 6.00 s');
  await page.locator('body').press('Space');
  await expect(page.getByRole('button', { name: 'Pause animation' })).toBeVisible();
  await page.getByRole('button', { name: 'Pause animation' }).click();
});

test('@claim:html-export downloads a deterministic interactive slide that runs offline', async ({ browser }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'claim runs once in desktop Chromium');
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  await openCleanDemo(page);
  await page.getByRole('button', { name: 'Export' }).click();
  const first = await downloadedText(page, () => page.getByRole('button', { name: 'Download HTML' }).click());
  const second = await downloadedText(page, () => page.getByRole('button', { name: 'Download HTML' }).click());
  expect(first).toBe(second);
  expect(first).not.toMatch(/(?:src|href)=["']https?:/i);
  expect(first).toContain('frame/p.fps');
  const slide = await context.newPage();
  await context.setOffline(true);
  await slide.setContent(first, { waitUntil: 'load' });
  await expect(slide.getByRole('heading', { level: 1 })).toHaveText('A wave gathers amplitude');
  await slide.locator('body').press('ArrowRight');
  await expect(slide.locator('output')).toHaveText('0.03 s');
  await slide.getByRole('button', { name: 'Play' }).click();
  await expect(slide.getByRole('button', { name: 'Pause' })).toBeVisible();
  await context.close();
});

test('@claim:png-export downloads 1280 × 720 frames and an FFmpeg manifest', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'claim runs once in desktop Chromium');
  test.setTimeout(60_000);
  await openCleanDemo(page);
  await page.evaluate(() => {
    const value = JSON.parse(localStorage.getItem('demo:lfd:project:v1') ?? '{}');
    value.duration = 1; value.fps = 1; value.intervals = [];
    localStorage.setItem('demo:lfd:project:v1', JSON.stringify(value));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Export' }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG frames' }).click();
  const download = await pending;
  const path = await download.path();
  if (!path) throw new Error('The browser did not provide a frame pack.');
  const entries = storedZipEntries(await readFile(path));
  expect([...entries.keys()]).toEqual(['frame-00000.png', 'frame-00001.png', 'manifest.json']);
  const firstFrame = entries.get('frame-00000.png');
  expect(firstFrame?.subarray(1, 4).toString()).toBe('PNG');
  expect(firstFrame?.readUInt32BE(16)).toBe(1280);
  expect(firstFrame?.readUInt32BE(20)).toBe(720);
  const manifest = JSON.parse(entries.get('manifest.json')?.toString('utf8') ?? '{}');
  expect(manifest).toMatchObject({ fps: 1, frames: 2, duration: 1 });
  expect(manifest.command).toContain('ffmpeg -framerate 1');
});

test('@claim:local-save autosaves demo edits separately and resets them', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'claim runs once in desktop Chromium');
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('lfd:project:v1', 'real-project-data'));
  await page.goto('/demo');
  await page.getByLabel('Figure title').fill('Changed demo title');
  await expect(page.locator('#save-state')).toHaveText('LOCAL // SAVED');
  const stored = await page.evaluate(() => ({ real: localStorage.getItem('lfd:project:v1'), demo: localStorage.getItem('demo:lfd:project:v1') }));
  expect(stored.real).toBe('real-project-data');
  expect(JSON.parse(stored.demo ?? '{}').title).toBe('Changed demo title');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Reset figure' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A wave gathers amplitude');
  await page.getByLabel('Figure title').fill('Another demo title');
  await expect(page.locator('#save-state')).toHaveText('LOCAL // SAVED');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A wave gathers amplitude');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/app$/);
  expect(await page.evaluate(() => localStorage.getItem('demo:lfd:project:v1'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('lfd:project:v1'))).toBe('real-project-data');
});

test('@claim:local-privacy keeps project actions same-origin and sets no cookies', async ({ page, context }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'claim runs once in desktop Chromium');
  const origins = new Set<string>();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  await openCleanDemo(page);
  await page.getByLabel(/Equation/).fill('a * cos(b * x) + c');
  await page.getByRole('button', { name: 'Export' }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download HTML' }).click();
  await pending;
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  expect(await context.cookies()).toEqual([]);
  expect(await page.locator('script[src]').evaluateAll(scripts => scripts.every(script => new URL((script as HTMLScriptElement).src).origin === location.origin))).toBe(true);
});

test('@claim:no-account opens a populated editor without account setup', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'claim runs once in desktop Chromium');
  await openCleanDemo(page);
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(page.getByLabel(/Equation/)).toHaveValue('a * sin(b * x) + c');
  await expect(page.getByRole('button', { name: 'Play animation' })).toBeEnabled();
});

test('@claim:offline-editor reloads the populated demo from its cache', async ({ browser }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'claim runs once in desktop Chromium');
  const context = await browser.newContext();
  const page = await context.newPage();
  await openCleanDemo(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'load' });
  await expect(page).toHaveTitle('Demo — Live Figure Deck');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A wave gathers amplitude');
  await expect(page.locator('#offline-banner')).toBeVisible();
  await context.close();
});

test('recovers safely from malformed saved data', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'recovery runs once in desktop Chromium');
  await page.goto('/app');
  await page.evaluate(() => localStorage.setItem('lfd:project:v1', JSON.stringify({
    version: 1, title: 'Broken', formula: 'x', formulaLabel: 'x', xMin: -1, xMax: 1,
    yMin: -1, yMax: 1, duration: 2, fps: 30, parameters: {}, intervals: []
  })));
  await page.reload();
  await expect(page.getByText('Your saved figure could not be opened.')).toBeVisible();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Replace with sample' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A wave gathers amplitude');
});

test('reports invalid formulas and oversized frame packs with a recovery step', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'error recovery runs once in desktop Chromium');
  await openCleanDemo(page);
  const formula = page.getByLabel(/Equation/);
  await formula.fill('mystery(x)');
  await expect(page.locator('#formula-error')).toContainText('Unknown function');
  await formula.fill('a * x + c');
  await expect(formula).toHaveAttribute('aria-invalid', 'false');
  await page.evaluate(() => {
    const value = JSON.parse(localStorage.getItem('demo:lfd:project:v1') ?? '{}');
    value.duration = 60; value.fps = 60; value.intervals = [];
    localStorage.setItem('demo:lfd:project:v1', JSON.stringify(value));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Export' }).click();
  await page.getByRole('button', { name: 'Export PNG frames' }).click();
  await expect(page.locator('#export-warning')).toContainText('Lower the duration or frame rate');
  await expect(page.getByRole('button', { name: 'Export PNG frames' })).toBeEnabled();
});

test('uses one modal after a legacy license return and removes the token from the URL', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'regression runs once in desktop Chromium');
  await page.goto('/app?license=legacy-token');
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await expect(page.locator('#welcome-dialog')).toBeVisible();
});

test('meets semantic and automated accessibility checks on public routes', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'axe route scan runs once in desktop Chromium');
  const browserErrors: string[] = [];
  page.on('pageerror', error => browserErrors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()); });
  for (const route of ['/', '/demo', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? '')), route).toEqual([]);
  }
  expect(browserErrors).toEqual([]);
});

test('supports keyboard focus, dialog escape, and reduced motion', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'keyboard smoke runs once in desktop Chromium');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openCleanDemo(page);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.getByRole('button', { name: 'Add animation interval' }).click();
  await expect(page.getByLabel('Interval name')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Add animation interval' })).toBeFocused();
  expect(parseFloat(await page.locator('.toast').evaluate(element => getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(0.00001);
});

test('keeps all visible phone controls at least 44 by 44 CSS pixels', async ({ page }, testInfo) => {
  test.skip(!isMobileProject(testInfo.project.name), 'mobile project only');
  await openCleanDemo(page);
  const undersized = await page.locator('a,button,input,select,summary').evaluateAll(elements => elements
    .filter(element => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return style.visibility !== 'hidden' && style.display !== 'none' && box.width > 0 && box.height > 0;
    })
    .map(element => {
      const box = element.getBoundingClientRect();
      return { name: element.getAttribute('aria-label') || element.textContent?.trim() || element.tagName, width: box.width, height: box.height };
    })
    .filter(item => item.width < 44 || item.height < 44));
  expect(undersized).toEqual([]);
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
});

test('sets route titles, metadata, and working internal links', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo.project.name), 'route scan runs once in desktop Chromium');
  const routes = [
    ['/', 'Live Figure Deck — Build animated formula figures'],
    ['/demo', 'Demo — Live Figure Deck'],
    ['/app', 'Editor — Live Figure Deck'],
    ['/privacy/', 'Privacy — Live Figure Deck'],
    ['/terms/', 'Terms — Live Figure Deck'],
    ['/404.html', 'Page not found — Live Figure Deck']
  ] as const;
  for (const [route, title] of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  }
  await page.goto('/');
  const internal = await page.locator('a[href^="/"]').evaluateAll(links => [...new Set(links.map(link => (link as HTMLAnchorElement).getAttribute('href')!))]);
  for (const href of internal) expect((await page.request.get(href)).ok(), href).toBe(true);
});
