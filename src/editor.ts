import { blankProject, compileExpression, parametersAt, safeProject, sampleProject, validateProject, type Easing, type FigureProject, type Interval, type ParamKey } from './model';
import { chartDescription, drawPlot } from './plot';
import { exportFramePack, exportHtml } from './export';

const DEMO_MODE = location.pathname.replace(/\/$/, '') === '/demo';
const PROJECT_KEY = DEMO_MODE ? 'demo:lfd:project:v1' : 'lfd:project:v1';
const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root is missing.');

const storedProjectRaw = localStorage.getItem(PROJECT_KEY);
const storedProject = loadProject();
const storedProjectWasInvalid = storedProjectRaw !== null && storedProject === null;
let project = storedProject ?? sampleProject();
let currentTime = 0;
let playing = false;
let animationFrame = 0;
let previousFrameTime = 0;
let playbackStartTime = 0;
let selectedInterval = '';
let saveTimer = 0;

function loadProject(): FigureProject | null {
  try { return safeProject(JSON.parse(localStorage.getItem(PROJECT_KEY) ?? 'null')); } catch { return null; }
}

function hasSavedProject(): boolean { return localStorage.getItem(PROJECT_KEY) !== null; }

app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="/" aria-label="Live Figure Deck home"><span class="brand-mark" aria-hidden="true">▟</span><span>LIVE FIGURE DECK</span></a>
    <div class="top-actions" aria-label="Figure actions">
      <span class="save-state" id="save-state">LOCAL // READY</span>
      <button class="button ghost compact" id="reset-button" type="button">Reset figure</button>
      <button class="button ghost compact" id="present-button" type="button"><span aria-hidden="true">▶</span> Present</button>
      <button class="button primary compact" id="export-button" type="button">Export</button>
    </div>
  </header>
  ${DEMO_MODE ? '<aside class="demo-banner" aria-label="Demo status"><strong>Demo — sample data, nothing is saved to your figures</strong><span><button class="text-button" id="reset-demo" type="button">Reset demo</button><a class="text-link" id="start-real" href="/app">Start for real</a></span></aside>' : ''}
  <div class="offline-banner" id="offline-banner" role="status" hidden>OFFLINE // The editor and HTML export remain available.</div>
  <section class="recovery-banner" id="recovery-banner" role="alert" ${storedProjectWasInvalid ? '' : 'hidden'}><div><strong>Your saved figure could not be opened.</strong><span>Its stored data is incomplete or damaged. Replace it with the sample to continue safely.</span></div><button class="button ghost" id="recover-project" type="button">Replace with sample</button></section>
  <main id="main" class="workspace" tabindex="-1">
    <section class="inspector" aria-labelledby="inspector-heading">
      <div class="panel-heading"><span class="eyebrow">01 / SOURCE</span><h2 id="inspector-heading">Figure controls</h2></div>
      <div class="control-stack">
        <label class="field"><span>Figure title</span><input id="title-input" maxlength="80" autocomplete="off"></label>
        <label class="field"><span>Equation <span class="hint">Use x, a, b, c</span></span><input id="formula-input" spellcheck="false" autocomplete="off" aria-describedby="formula-help formula-error"></label>
        <p class="microcopy" id="formula-help">Functions: sin, cos, tan, sqrt, abs, exp, log, min, max. Use ^ for powers.</p>
        <p class="field-error" id="formula-error" role="alert" hidden></p>
        <label class="field"><span>Displayed formula</span><input id="label-input" maxlength="100" autocomplete="off"></label>
      </div>
      <fieldset class="parameter-set"><legend>Live parameters</legend><div id="parameter-controls"></div></fieldset>
      <details class="plot-window"><summary>Plot window</summary>
        <div class="range-grid">
          <label class="field"><span>x min</span><input id="x-min" type="number" step="0.1"></label>
          <label class="field"><span>x max</span><input id="x-max" type="number" step="0.1"></label>
          <label class="field"><span>y min</span><input id="y-min" type="number" step="0.1"></label>
          <label class="field"><span>y max</span><input id="y-max" type="number" step="0.1"></label>
        </div>
      </details>
    </section>

    <section class="stage-panel" aria-labelledby="stage-title">
      <div class="stage-meta"><div><span class="eyebrow">02 / LIVE CANVAS</span><h1 id="stage-title">${escapeHtml(project.title)}</h1></div><span class="frame-readout" id="frame-readout">FRAME 0000</span></div>
      <div class="formula-display" id="formula-display" aria-label="Formula label"></div>
      <figure class="plot-figure">
        <canvas id="plot-canvas" role="img" aria-label="Animated figure plot" aria-describedby="chart-description"></canvas>
        <figcaption id="chart-description" class="sr-only"></figcaption>
        <div class="empty-plot" id="empty-plot" hidden><span aria-hidden="true">∅</span><strong>No finite values in this window</strong><small>Adjust the equation or plot bounds.</small></div>
      </figure>
      <div class="transport" aria-label="Playback controls">
        <button class="play-button" id="play-button" type="button" aria-label="Play animation"><span aria-hidden="true">▶</span><span>Play</span></button>
        <label class="scrubber-label" for="scrubber">Timeline position</label>
        <input id="scrubber" class="scrubber" type="range" min="0" value="0" step="1">
        <output id="time-output" class="time-output" for="scrubber">0.00 / 6.00 s</output>
      </div>
      <p class="shortcut-line"><kbd>Space</kbd> play/pause <span>·</span> <kbd>←</kbd><kbd>→</kbd> step frame <span>·</span> <kbd>P</kbd> present</p>
    </section>

    <section class="timeline-panel" aria-labelledby="timeline-heading">
      <div class="panel-heading timeline-heading"><div><span class="eyebrow">03 / INTERVALS</span><h2 id="timeline-heading">Animation map</h2></div><button class="icon-button" id="add-interval" type="button" aria-label="Add animation interval">+</button></div>
      <div class="deck-settings">
        <label class="field"><span>Duration</span><span class="with-unit"><input id="duration-input" type="number" min="1" max="60" step="0.1"><small>s</small></span></label>
        <label class="field"><span>Frame rate</span><span class="with-unit"><input id="fps-input" type="number" min="1" max="60" step="1"><small>fps</small></span></label>
      </div>
      <div class="timeline-ruler" aria-hidden="true"><span>0</span><span id="ruler-mid">3s</span><span id="ruler-end">6s</span></div>
      <div id="interval-track" class="interval-track" aria-label="Animation intervals"></div>
      <div id="interval-list" class="interval-list"></div>
      <div class="timeline-empty" id="timeline-empty" hidden><strong>No intervals yet.</strong><span>Add one to animate a parameter between two precise times.</span><button class="text-button" type="button" data-add-interval>Add first interval →</button></div>
      <p class="interval-note"><span aria-hidden="true">◎</span> Intervals on the same parameter cannot overlap. End values persist.</p>
    </section>
  </main>

  <footer class="site-footer"><p>Build one formula-driven figure for a talk.</p><nav aria-label="Footer"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><span>Built by Param Factory</span><span>Version 1.1.0</span></nav></footer>

  <section class="presenter" id="presenter" aria-label="Presentation mode" hidden>
    <button class="presenter-exit" id="presenter-exit" type="button">Exit presentation <kbd>Esc</kbd></button>
    <div class="presenter-content"><p id="presenter-formula"></p><canvas id="presenter-canvas" role="img" aria-label="Presentation plot"></canvas><div class="presenter-time" id="presenter-time"></div></div>
  </section>

  <dialog class="modal welcome-modal" id="welcome-dialog" aria-labelledby="welcome-title">
    <div class="welcome-art"><picture><img src="/assets/signal-observatory-v1.webp" width="768" height="512" alt="Pixel-art scientific observatory tracing a luminous wave across a coordinate grid" fetchpriority="high"></picture><span>LOCAL SIGNAL // 01</span></div>
    <div class="welcome-copy"><span class="eyebrow">START A FIGURE</span><h2 id="welcome-title">Build an animated figure from a formula</h2><p>Choose the sample to see a complete wave figure, or start with a blank plot.</p><div class="welcome-actions"><a class="button primary" href="/demo">Try it with sample data</a><button class="button ghost" id="blank-start" type="button">Start a blank figure</button></div><small>Your figure stays in this browser.</small></div>
  </dialog>

  <dialog class="modal form-modal" id="interval-dialog" aria-labelledby="interval-dialog-title">
    <form id="interval-form"><div class="modal-top"><div><span class="eyebrow">DURATION EVENT</span><h2 id="interval-dialog-title">Add interval</h2></div><button class="close-button" type="button" data-close="interval-dialog" aria-label="Close interval editor">×</button></div>
      <input type="hidden" id="interval-id">
      <label class="field"><span>Interval name</span><input id="interval-name" maxlength="50" required autocomplete="off"></label>
      <div class="range-grid"><label class="field"><span>Parameter</span><select id="interval-param"><option value="a">a · Amplitude</option><option value="b">b · Frequency</option><option value="c">c · Offset</option></select></label><label class="field"><span>Easing</span><select id="interval-easing"><option value="linear">Linear</option><option value="smooth">Smooth</option><option value="hold">Hold, then jump</option></select></label></div>
      <div class="range-grid"><label class="field"><span>Start time</span><span class="with-unit"><input id="interval-start" type="number" min="0" step="0.01" required><small>s</small></span></label><label class="field"><span>End time</span><span class="with-unit"><input id="interval-end" type="number" min="0" step="0.01" required><small>s</small></span></label></div>
      <div class="range-grid"><label class="field"><span>Start value</span><input id="interval-from" type="number" step="0.01" required></label><label class="field"><span>End value</span><input id="interval-to" type="number" step="0.01" required></label></div>
      <p class="field-error" id="interval-error" role="alert" hidden></p>
      <div class="modal-actions"><button class="button danger" id="delete-interval" type="button" hidden>Delete interval</button><span></span><button class="button ghost" type="button" data-close="interval-dialog">Cancel</button><button class="button primary" id="save-interval" type="submit">Save interval</button></div>
    </form>
  </dialog>

  <dialog class="modal export-modal" id="export-dialog" aria-labelledby="export-title">
    <div class="modal-top"><div><span class="eyebrow">TAKE IT WITH YOU</span><h2 id="export-title">Export figure</h2></div><button class="close-button" data-close="export-dialog" aria-label="Close export options">×</button></div>
    <p class="modal-lede">HTML keeps playback controls. PNG gives one image for each frame.</p>
    <div class="export-options">
      <article><span class="format-mark">.HTML</span><h3>Interactive slide</h3><p>One self-contained offline file with playback and keyboard controls.</p><button class="button primary" id="html-export" type="button">Download HTML</button><small>Included free</small></article>
      <article><span class="format-mark">.ZIP</span><h3>PNG frame pack</h3><p>1280 × 720 numbered frames, manifest, and ready-to-run FFmpeg command.</p><button class="button ghost" id="frames-export" type="button">Export PNG frames</button><small>Included free · Up to 600 images</small><progress id="export-progress" max="1" value="0" hidden></progress>
      </article>
    </div>
    <p class="export-warning" id="export-warning" role="alert" hidden></p>
  </dialog>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char); }
function byId<T extends HTMLElement>(id: string): T { const element = document.getElementById(id); if (!element) throw new Error(`Missing #${id}`); return element as T; }
const canvas = byId<HTMLCanvasElement>('plot-canvas');
const presenterCanvas = byId<HTMLCanvasElement>('presenter-canvas');

function setInputValue(id: string, value: string | number): void { byId<HTMLInputElement>(id).value = String(value); }

function populateInputs(): void {
  setInputValue('title-input', project.title); setInputValue('formula-input', project.formula); setInputValue('label-input', project.formulaLabel);
  setInputValue('x-min', project.xMin); setInputValue('x-max', project.xMax); setInputValue('y-min', project.yMin); setInputValue('y-max', project.yMax);
  setInputValue('duration-input', project.duration); setInputValue('fps-input', project.fps);
  renderParameterControls(); renderIntervals(); updateDurationUi(); updateFigure(true);
}

function renderParameterControls(): void {
  byId('parameter-controls').innerHTML = (['a', 'b', 'c'] as ParamKey[]).map(key => { const parameter = project.parameters[key]; return `<div class="parameter-row"><label for="param-${key}"><strong>${key}</strong><span>${escapeHtml(parameter.label)}</span></label><input id="param-${key}" type="range" min="${parameter.min}" max="${parameter.max}" step="${parameter.step}" value="${parameter.value}"><output for="param-${key}" id="param-${key}-output">${parameter.value.toFixed(2)}</output></div>`; }).join('');
  for (const key of ['a', 'b', 'c'] as ParamKey[]) byId<HTMLInputElement>(`param-${key}`).addEventListener('input', event => { project.parameters[key].value = Number((event.target as HTMLInputElement).value); byId<HTMLOutputElement>(`param-${key}-output`).value = project.parameters[key].value.toFixed(2); currentTime = 0; stopPlayback(); updateFigure(); scheduleSave(); });
}

function renderIntervals(): void {
  const track = byId('interval-track'); const list = byId('interval-list'); const empty = byId('timeline-empty');
  empty.hidden = project.intervals.length > 0; track.hidden = project.intervals.length === 0;
  const ordered = [...project.intervals].sort((a, b) => a.start - b.start);
  track.innerHTML = `<div class="track-lane">${ordered.map(interval => `<button class="interval-block param-${interval.parameter}" style="--left:${interval.start / project.duration * 100}%;--width:${(interval.end - interval.start) / project.duration * 100}%" data-edit="${interval.id}" aria-label="Edit ${escapeHtml(interval.name)}, ${interval.start} to ${interval.end} seconds"><span>${escapeHtml(interval.name)}</span></button>`).join('')}<span class="track-playhead" style="--time:${currentTime / project.duration * 100}%"></span></div>`;
  list.innerHTML = ordered.map(interval => `<button class="interval-item${selectedInterval === interval.id ? ' selected' : ''}" data-edit="${interval.id}"><span class="interval-glyph param-${interval.parameter}">${interval.parameter}</span><span><strong>${escapeHtml(interval.name)}</strong><small>${interval.start.toFixed(2)}–${interval.end.toFixed(2)} s · ${interval.from} → ${interval.to} · ${interval.easing}</small></span><span aria-hidden="true">›</span></button>`).join('');
  document.querySelectorAll<HTMLElement>('[data-edit]').forEach(button => button.addEventListener('click', () => openInterval(button.dataset.edit ?? '')));
}

function updateDurationUi(): void {
  const totalFrames = Math.round(project.duration * project.fps);
  const scrubber = byId<HTMLInputElement>('scrubber'); scrubber.max = String(totalFrames); scrubber.value = String(Math.min(totalFrames, Math.round(currentTime * project.fps)));
  byId('ruler-mid').textContent = `${(project.duration / 2).toFixed(1)}s`; byId('ruler-end').textContent = `${project.duration.toFixed(1)}s`;
}

function formulaError(): string {
  try { compileExpression(project.formula); return ''; } catch (error) { return (error as Error).message; }
}

function updateFigure(forceLayout = false): void {
  const error = formulaError(); const errorElement = byId('formula-error'); errorElement.hidden = !error; errorElement.textContent = error;
  byId('formula-input').setAttribute('aria-invalid', String(Boolean(error)));
  byId('stage-title').textContent = project.title || 'Untitled figure'; byId('formula-display').textContent = project.formulaLabel || project.formula || 'Enter an equation';
  const frame = Math.round(currentTime * project.fps); byId('frame-readout').textContent = `FRAME ${String(frame).padStart(4, '0')}`;
  byId<HTMLOutputElement>('time-output').value = `${currentTime.toFixed(2)} / ${project.duration.toFixed(2)} s`;
  byId<HTMLInputElement>('scrubber').value = String(frame);
  const playhead = document.querySelector<HTMLElement>('.track-playhead'); if (playhead) playhead.style.setProperty('--time', `${currentTime / project.duration * 100}%`);
  if (error) return;
  try {
    const result = drawPlot(canvas, project, currentTime); byId('chart-description').textContent = chartDescription(project, result, currentTime); byId('empty-plot').hidden = result.finitePoints > 0;
    if (!byId('presenter').hidden) { if (forceLayout) presenterCanvas.width = 0; drawPlot(presenterCanvas, project, currentTime); byId('presenter-time').textContent = `${currentTime.toFixed(2)} s · frame ${frame}`; }
  } catch (caught) { errorElement.hidden = false; errorElement.textContent = (caught as Error).message; }
}

function scheduleSave(): void {
  byId('save-state').textContent = 'LOCAL // SAVING'; window.clearTimeout(saveTimer); saveTimer = window.setTimeout(() => { localStorage.setItem(PROJECT_KEY, JSON.stringify(project)); byId('save-state').textContent = 'LOCAL // SAVED'; }, 250);
}

function announce(message: string): void { const toast = byId('toast'); toast.textContent = message; toast.classList.add('visible'); setTimeout(() => toast.classList.remove('visible'), 2400); }

function bindText(id: string, key: 'title' | 'formula' | 'formulaLabel'): void {
  byId<HTMLInputElement>(id).addEventListener('input', event => { project[key] = (event.target as HTMLInputElement).value; updateFigure(); scheduleSave(); });
}
bindText('title-input', 'title'); bindText('formula-input', 'formula'); bindText('label-input', 'formulaLabel');

for (const [id, key] of [['x-min', 'xMin'], ['x-max', 'xMax'], ['y-min', 'yMin'], ['y-max', 'yMax']] as const) {
  byId<HTMLInputElement>(id).addEventListener('change', event => { const value = Number((event.target as HTMLInputElement).value); if (!Number.isFinite(value)) return; project[key] = value; const errors = validateProject(project); if (errors.some(item => item.includes('minimum'))) announce('Check the plot bounds: each minimum must be below its maximum.'); updateFigure(); scheduleSave(); });
}

byId<HTMLInputElement>('duration-input').addEventListener('change', event => { project.duration = Math.max(1, Math.min(60, Number((event.target as HTMLInputElement).value) || 1)); currentTime = Math.min(currentTime, project.duration); setInputValue('duration-input', project.duration); updateDurationUi(); renderIntervals(); updateFigure(); scheduleSave(); });
byId<HTMLInputElement>('fps-input').addEventListener('change', event => { project.fps = Math.max(1, Math.min(60, Math.round(Number((event.target as HTMLInputElement).value) || 1))); setInputValue('fps-input', project.fps); updateDurationUi(); updateFigure(); scheduleSave(); });
byId<HTMLInputElement>('scrubber').addEventListener('input', event => { stopPlayback(); currentTime = Number((event.target as HTMLInputElement).value) / project.fps; updateFigure(); });

function stopPlayback(): void { playing = false; cancelAnimationFrame(animationFrame); const button = byId('play-button'); button.innerHTML = '<span aria-hidden="true">▶</span><span>Play</span>'; button.setAttribute('aria-label', 'Play animation'); }
function togglePlayback(): void {
  if (playing) { stopPlayback(); return; }
  if (currentTime >= project.duration) currentTime = 0; playing = true; previousFrameTime = 0; playbackStartTime = currentTime; const button = byId('play-button'); button.innerHTML = '<span aria-hidden="true">Ⅱ</span><span>Pause</span>'; button.setAttribute('aria-label', 'Pause animation'); animationFrame = requestAnimationFrame(tick);
}
function tick(timestamp: number): void { if (!playing) return; if (!previousFrameTime) previousFrameTime = timestamp; const elapsed = timestamp - previousFrameTime; currentTime = Math.min(project.duration, playbackStartTime + Math.floor(elapsed * project.fps / 1000) / project.fps); updateFigure(); if (currentTime >= project.duration) stopPlayback(); else animationFrame = requestAnimationFrame(tick); }
byId('play-button').addEventListener('click', togglePlayback);

function openInterval(id = ''): void {
  const interval = project.intervals.find(item => item.id === id); selectedInterval = id;
  byId('interval-dialog-title').textContent = interval ? 'Edit interval' : 'Add interval'; setInputValue('interval-id', interval?.id ?? ''); setInputValue('interval-name', interval?.name ?? 'Animate parameter'); setInputValue('interval-param', interval?.parameter ?? 'a'); setInputValue('interval-easing', interval?.easing ?? 'smooth'); setInputValue('interval-start', interval?.start ?? Math.min(currentTime, project.duration - 1)); setInputValue('interval-end', interval?.end ?? Math.min(project.duration, Math.max(1, currentTime + 2))); setInputValue('interval-from', interval?.from ?? project.parameters.a.value); setInputValue('interval-to', interval?.to ?? Math.min(project.parameters.a.max, project.parameters.a.value + 1)); byId('delete-interval').hidden = !interval; byId('interval-error').hidden = true; byId<HTMLDialogElement>('interval-dialog').showModal(); requestAnimationFrame(() => byId<HTMLInputElement>('interval-name').focus());
}
document.querySelectorAll<HTMLElement>('#add-interval,[data-add-interval]').forEach(button => button.addEventListener('click', () => openInterval()));

byId<HTMLFormElement>('interval-form').addEventListener('submit', event => {
  event.preventDefault(); const id = byId<HTMLInputElement>('interval-id').value || crypto.randomUUID();
  const candidate: Interval = { id, name: byId<HTMLInputElement>('interval-name').value.trim(), parameter: byId<HTMLSelectElement>('interval-param').value as ParamKey, easing: byId<HTMLSelectElement>('interval-easing').value as Easing, start: Number(byId<HTMLInputElement>('interval-start').value), end: Number(byId<HTMLInputElement>('interval-end').value), from: Number(byId<HTMLInputElement>('interval-from').value), to: Number(byId<HTMLInputElement>('interval-to').value) };
  const next = { ...project, intervals: [...project.intervals.filter(item => item.id !== id), candidate] }; const errors = validateProject(next).filter(error => error.includes(candidate.name || 'Untitled') || error.includes('Every interval'));
  if (errors.length) { const target = byId('interval-error'); target.textContent = errors[0] ?? 'Check this interval.'; target.hidden = false; return; }
  project = next; selectedInterval = id; byId<HTMLDialogElement>('interval-dialog').close(); renderIntervals(); updateFigure(); scheduleSave(); announce(`Saved “${candidate.name}”.`);
});
byId('delete-interval').addEventListener('click', () => { const id = byId<HTMLInputElement>('interval-id').value; const item = project.intervals.find(interval => interval.id === id); if (!item || !confirm(`Delete the interval “${item.name}”?`)) return; project.intervals = project.intervals.filter(interval => interval.id !== id); byId<HTMLDialogElement>('interval-dialog').close(); renderIntervals(); updateFigure(); scheduleSave(); announce(`Deleted “${item.name}”.`); });

function resetProject(): void { if (!confirm('Reset this figure? Your saved equation and intervals will be replaced by the sample.')) return; localStorage.removeItem(PROJECT_KEY); project = sampleProject(); currentTime = 0; populateInputs(); scheduleSave(); announce('Figure reset to the sample.'); }
byId('reset-button').addEventListener('click', resetProject);

function replaceWithSample(message: string): void {
  localStorage.removeItem(PROJECT_KEY);
  project = sampleProject();
  currentTime = 0;
  populateInputs();
  localStorage.setItem(PROJECT_KEY, JSON.stringify(project));
  byId('recovery-banner').hidden = true;
  announce(message);
}
byId('recover-project').addEventListener('click', () => replaceWithSample('Saved data replaced with the sample.'));
if (DEMO_MODE) {
  byId('reset-demo').addEventListener('click', () => replaceWithSample('Demo reset to the original sample.'));
  byId('start-real').addEventListener('click', () => localStorage.removeItem(PROJECT_KEY));
}

function enterPresentation(): void { stopPlayback(); byId('presenter').hidden = false; document.body.classList.add('presenting'); byId('presenter-formula').textContent = project.formulaLabel || project.formula; updateFigure(true); byId('presenter-exit').focus(); }
function exitPresentation(): void { if (byId('presenter').hidden) return; byId('presenter').hidden = true; document.body.classList.remove('presenting'); byId('present-button').focus(); }
byId('present-button').addEventListener('click', enterPresentation); byId('presenter-exit').addEventListener('click', exitPresentation);

function isTyping(target: EventTarget | null): boolean { return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || (target instanceof HTMLElement && target.isContentEditable); }
addEventListener('keydown', event => { if (event.key === 'Escape' && !byId('presenter').hidden) { exitPresentation(); return; } if (isTyping(event.target) || document.querySelector('dialog[open]')) return; if (event.code === 'Space') { event.preventDefault(); togglePlayback(); } if (event.key === 'ArrowRight') { stopPlayback(); currentTime = Math.min(project.duration, currentTime + 1 / project.fps); updateFigure(); } if (event.key === 'ArrowLeft') { stopPlayback(); currentTime = Math.max(0, currentTime - 1 / project.fps); updateFigure(); } if (event.key.toLowerCase() === 'p') enterPresentation(); });

function showDialog(id: string): void { byId<HTMLDialogElement>(id).showModal(); }
byId('export-button').addEventListener('click', () => { const warning = byId('export-warning'); const errors = validateProject(project); warning.hidden = errors.length === 0; warning.textContent = errors[0] ?? ''; showDialog('export-dialog'); });
document.querySelectorAll<HTMLElement>('[data-close]').forEach(button => button.addEventListener('click', () => byId<HTMLDialogElement>(button.dataset.close ?? '').close()));
byId('html-export').addEventListener('click', () => { const errors = validateProject(project); if (errors.length) { byId('export-warning').textContent = errors[0] ?? 'Fix the figure before export.'; byId('export-warning').hidden = false; return; } exportHtml(project); announce('Interactive HTML downloaded.'); });
byId('frames-export').addEventListener('click', async () => {
  const errors = validateProject(project); if (errors.length) { byId('export-warning').textContent = errors[0] ?? ''; byId('export-warning').hidden = false; return; }
  const button = byId<HTMLButtonElement>('frames-export'); const progress = byId<HTMLProgressElement>('export-progress'); button.disabled = true; progress.hidden = false;
  try { await exportFramePack(project, (done, total) => { progress.max = total; progress.value = done; button.textContent = `Rendering ${done} / ${total}`; }); button.textContent = 'Download again'; announce('PNG frame pack downloaded.'); }
  catch (error) { byId('export-warning').textContent = `Frame export failed: ${(error as Error).message}`; byId('export-warning').hidden = false; button.textContent = 'Export PNG frames'; }
  finally { button.disabled = false; progress.hidden = true; }
});

function updateOnlineState(): void { byId('offline-banner').hidden = navigator.onLine; }
addEventListener('online', updateOnlineState); addEventListener('offline', updateOnlineState); addEventListener('resize', () => updateFigure(true));

function stripLegacyLicenseReturn(): void {
  const url = new URL(location.href);
  if (!url.searchParams.has('license')) return;
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function startWith(next: FigureProject): void { project = next; currentTime = 0; localStorage.setItem(PROJECT_KEY, JSON.stringify(project)); byId<HTMLDialogElement>('welcome-dialog').close(); populateInputs(); announce('Figure ready. Edit the equation or press Play.'); }
byId('blank-start').addEventListener('click', () => startWith(blankProject()));

stripLegacyLicenseReturn(); populateInputs(); updateOnlineState();
document.title = DEMO_MODE ? 'Demo — Live Figure Deck' : 'Editor — Live Figure Deck';
document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://live-figure-deck.sociobot.in${DEMO_MODE ? '/demo' : '/app'}`);
document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', `https://live-figure-deck.sociobot.in${DEMO_MODE ? '/demo' : '/app'}`);
document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', DEMO_MODE ? 'Demo — Live Figure Deck' : 'Editor — Live Figure Deck');
if (DEMO_MODE && !hasSavedProject()) localStorage.setItem(PROJECT_KEY, JSON.stringify(project));
if (!DEMO_MODE && !hasSavedProject()) byId<HTMLDialogElement>('welcome-dialog').showModal();
if ('serviceWorker' in navigator) {
  const registerWorker = () => { void navigator.serviceWorker.register('/sw.js').catch(() => undefined); };
  if (document.readyState === 'loading') addEventListener('load', registerWorker, { once: true });
  else registerWorker();
}
