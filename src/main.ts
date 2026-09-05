import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app) throw new Error('App root is missing.');

const route = location.pathname.replace(/\/$/, '') || '/';

const footer = `
  <footer class="site-footer">
    <p>Build one formula-driven figure for a talk.</p>
    <nav aria-label="Footer">
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
      <span>Built by Param Factory</span>
      <span>Version 1.1.0</span>
    </nav>
  </footer>`;

function header(): string {
  return `<header class="topbar site-header">
    <a class="brand" href="/" aria-label="Live Figure Deck home"><span class="brand-mark" aria-hidden="true">▟</span><span>LIVE FIGURE DECK</span></a>
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/demo">Demo</a>
      <a href="/app">Open editor</a>
      <a href="/privacy/">Privacy</a>
    </nav>
  </header>`;
}

function renderLanding(): void {
  document.title = 'Live Figure Deck — Build animated formula figures';
  app.innerHTML = `${header()}
    <main id="main" class="landing-main" tabindex="-1">
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="eyebrow">FORMULA · MOTION · EXPORT</p>
          <h1 id="page-title" tabindex="-1">Build an animated figure from a formula</h1>
          <p class="hero-lede">For scientists and educators who need one clear moving plot in a talk, without a full animation pipeline.</p>
          <div class="hero-action">
            <a class="button primary" href="/demo">Try it with sample data</a>
            <span>Open a six-second wave figure to edit, play, and export.</span>
          </div>
          <ul class="plain-facts" aria-label="Product facts">
            <li>Free editor and HTML export.</li>
            <li>Your figure stays in this browser.</li>
            <li>No account is needed.</li>
          </ul>
        </div>
        <figure class="hero-preview">
          <figcaption><span>Sample figure</span><strong>A wave gathers amplitude</strong><code>y = a · sin(bx) + c</code></figcaption>
          <svg viewBox="0 0 720 420" role="img" aria-labelledby="preview-title preview-desc">
            <title id="preview-title">Paused sample wave plot</title>
            <desc id="preview-desc">A mint sine wave crosses a dark coordinate grid. Two named intervals appear below it.</desc>
            <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#293349" stroke-width="1"/></pattern></defs>
            <rect width="720" height="330" fill="#080b14"/><rect x="36" y="24" width="648" height="270" fill="url(#grid)"/>
            <path d="M36 160 C88 62 142 62 198 160 S306 258 360 160 S468 62 522 160 S630 258 684 160" fill="none" stroke="#81f7c1" stroke-width="5"/>
            <line x1="36" y1="160" x2="684" y2="160" stroke="#b8c3bd"/><line x1="360" y1="24" x2="360" y2="294" stroke="#b8c3bd"/>
            <rect x="36" y="350" width="310" height="38" fill="#151d2c" stroke="#81f7c1"/><rect x="368" y="350" width="228" height="38" fill="#151d2c" stroke="#ff8f70"/>
            <text x="52" y="375" fill="#f4f7e9">Reveal amplitude · 0–3 s</text><text x="384" y="375" fill="#f4f7e9">Lift baseline · 3.2–5.4 s</text>
          </svg>
        </figure>
      </section>

      <section class="landing-section product-preview" aria-labelledby="preview-heading">
        <div><p class="eyebrow">THE EDITOR</p><h2 id="preview-heading">See the formula, plot, and timing together</h2></div>
        <p>Change three parameters, set named intervals, and step through exact frames before you present or export.</p>
        <a class="text-link" href="/app">Open a blank editor →</a>
      </section>

      <section class="landing-section" aria-labelledby="how-heading">
        <p class="eyebrow">HOW IT WORKS</p><h2 id="how-heading">Make one figure in three steps</h2>
        <ol class="steps">
          <li><strong>Enter a formula.</strong><span>Use x and the a, b, and c sliders.</span></li>
          <li><strong>Name each interval.</strong><span>Set its start, end, values, and easing.</span></li>
          <li><strong>Export the figure.</strong><span>Download an interactive HTML slide or PNG frames.</span></li>
        </ol>
      </section>

      <section class="landing-section limits" aria-labelledby="limits-heading">
        <div><p class="eyebrow">LIMITS AND PRIVACY</p><h2 id="limits-heading">You control the equation and its meaning</h2></div>
        <div><p>The editor evaluates numeric expressions. It does not check whether your mathematics or explanation is correct.</p><p>Project edits stay in browser storage. The editor sends no project data to a server.</p></div>
      </section>

      <section class="landing-section pricing" aria-labelledby="pricing-heading">
        <div><p class="eyebrow">EXPORT FORMATS</p><h2 id="pricing-heading">Download HTML or PNG frames</h2></div>
        <div><p>Both formats are free. The frame pack includes 1280 × 720 PNG files and an FFmpeg manifest.</p><a class="button primary" href="/demo">Try both export formats</a></div>
      </section>
    </main>${footer}`;
}

function renderNotFound(): void {
  document.title = 'Page not found — Live Figure Deck';
  app.innerHTML = `${header()}<main id="main" class="not-found" tabindex="-1"><p class="eyebrow">404</p><h1>This page does not exist</h1><p>Open the sample figure or return to the product page.</p><div><a class="button primary" href="/demo">Try the sample figure</a><a class="button ghost" href="/">Return home</a></div></main>${footer}`;
}

if (route === '/') renderLanding();
else if (route === '/app' || route === '/demo') void import('./editor');
else renderNotFound();
