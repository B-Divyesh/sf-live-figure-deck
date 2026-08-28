# Live Figure Deck

Live Figure Deck is a local-first editor for scientists and educators who need
one formula-driven animated figure in a talk without adopting a full animation
pipeline. Author an equation, tune three parameters, schedule named animation
intervals, and export a self-contained interactive HTML slide. A one-time
Studio license also unlocks deterministic 1280 × 720 PNG frame packs.

Live site: <https://live-figure-deck.sociobot.in>

## What it does

- Safely evaluates numeric expressions using `x`, `a`, `b`, and `c`, common
  trigonometric/numeric functions, and constants `pi` and `e`.
- Animates parameter values across precise, named intervals with linear,
  smooth, or hold easing. Intervals on the same parameter cannot overlap.
- Plays and frame-steps the result at a configurable 1–60 fps.
- Exports an offline, self-contained HTML slide with no runtime server.
- Exports a ZIP of numbered PNG frames plus an FFmpeg manifest with Studio.
- Autosaves the current figure to browser local storage; equations are never
  uploaded.

This is a numerical communication tool, not a computer algebra system. It does
not prove or validate the mathematical claims entered by the user.

## Develop and verify

Requires Node.js 20 or newer. Playwright 1.58.2 is pinned for browser tests.

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm test` runs Vitest unit coverage for expression/interval semantics and
Playwright tests for desktop, 390 px mobile, accessibility, keyboard/playback,
export, and license return. The production command is exactly `npm run build`;
the static site is emitted to `dist/` with `dist/index.html` at its root.

To inspect a production build locally:

```sh
npm run build
npm run preview
```

## Privacy, billing, and offline behavior

Project data and the optional license token use local storage. License status is
checked against the Sociobot billing API at most once per day and never blocks
the free editor at first paint. Checkout is hosted by Sociobot/Dodo; this app
does not handle card data. A service worker caches the editor shell after the
first successful visit.

See [privacy](https://live-figure-deck.sociobot.in/privacy/) and
[terms](https://live-figure-deck.sociobot.in/terms/).

## Design and project notes

The researched scope is in `.factory/brief.json`; the product-specific signal
console system and generated-image provenance are in `.factory/design.md`.
Factory handoff and verification results are in `.factory/handoff.md`.

## License

MIT © 2026 Sociobot (Param Factory).
