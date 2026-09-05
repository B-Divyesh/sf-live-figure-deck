# Live Figure Deck

Live Figure Deck helps scientists and educators build one formula-driven,
animated figure for a talk. Enter a numeric formula, tune three parameters,
schedule named intervals, and export the result.

Try the isolated sample at
<https://live-figure-deck.sociobot.in/demo>. The normal editor is at
<https://live-figure-deck.sociobot.in/app>.

## What it does

- Evaluates numeric expressions using `x`, `a`, `b`, and `c`, common functions,
  and the constants `pi` and `e`.
- Animates values across named intervals and rejects overlap on one parameter.
- Plays and steps frames at a configurable 1–60 fps.
- Exports a deterministic, self-contained interactive HTML slide.
- Exports numbered 1280 × 720 PNG frames with an FFmpeg manifest.
- Limits each frame pack to 600 images and explains how to reduce larger jobs.
- Autosaves the current figure in browser storage.
- Works offline after one successful visit.

Both export formats are free. No account is needed. The editor does not upload
project data or load analytics and advertising scripts.

This is a numerical communication tool, not a computer algebra system. It does
not verify the meaning or correctness of an equation.

## Clean setup and verification

Use Node.js 20 or newer. Playwright 1.58.2 is pinned in `package.json`.

```sh
npm ci
npm test
npm run build
```

`npm test` runs unit and browser checks. The browser suite covers every entry
in `.factory/claims.json`, desktop, a 390 px phone viewport, keyboard use,
accessibility, recovery, routing, offline reload, and both downloads.

Run one declared claim with its exact manifest command:

```sh
npm test -- --grep @claim:html-export
```

For local development:

```sh
npm run dev
```

For a production preview:

```sh
npm run build
npm run preview
```

The build output is `dist/`, with `dist/index.html` at its root.

## Demo and storage

`/demo` starts with a six-second wave figure and two named intervals. Its edits
use `demo:lfd:project:v1`. Resetting or leaving the demo removes that key and
does not read or change the normal `lfd:project:v1` key.

See `.factory/demo.md` for the exact sample and reset behavior. See
`.factory/claims.json` for public claims and their commands.

## Privacy and project notes

See [privacy](https://live-figure-deck.sociobot.in/privacy/) and
[terms](https://live-figure-deck.sociobot.in/terms/). The researched scope is
in `.factory/brief.json`. The visual system and original-image provenance are
in `.factory/design.md`.

## Deployment

Build with `npm run build`, then deploy `dist/` as the Azure Static Web App for
this product. The repository includes route, security-header, cache, 404,
robots, and sitemap configuration.

## License

MIT © 2026 Sociobot (Param Factory).
