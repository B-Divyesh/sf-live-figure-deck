# Live Figure Deck — build handoff

## What shipped

- A complete local-first, responsive figure editor in Vite + vanilla TypeScript.
- Safe numeric expression parsing for `x`, parameters `a`/`b`/`c`, constants,
  powers, and common functions. User expressions are not passed to `eval` in
  the editor.
- Immediate canvas plotting with editable bounds, live sliders, an accessible
  text alternative, formula errors, and a useful no-finite-values state.
- Precise, named parameter intervals with start/end time and value,
  linear/smooth/hold easing, overlap rejection per parameter, timeline blocks,
  deterministic frame stepping, and keyboard controls.
- Pausable playback and a distraction-free presentation mode.
- Free self-contained interactive HTML export with playback, scrubbing, and
  keyboard controls and no runtime server or third-party asset.
- Studio PNG frame-pack export: numbered 1280 × 720 frames, a JSON manifest,
  and an FFmpeg command in an uncompressed ZIP generated entirely in-browser.
- $29 one-time Studio checkout link, returned-license capture, local token
  storage, optimistic cached unlock, once-daily Sociobot verification, revoked
  license handling, restore-by-token, and remove-license controls.
- Local autosave, first-run sample/blank onboarding, offline status, service
  worker shell caching, privacy and terms pages, and no analytics or CDN calls.
- A product-specific pixel/demoscene “signal console” system plus an original
  generated observatory illustration. The shipping WebP is 41,954 bytes;
  prompt and provenance are in `.factory/design.md` and `assets/src/`.

## Run and deploy

```sh
npm ci
npm test
npm run build
```

The exact production command is `npm run build`. Output lands in `dist/`, with
`dist/index.html` at the deploy root. Deploy the contents as an Azure Static Web
App; `public/staticwebapp.config.json` is copied into the build.

## Verification completed

- `npm test`: 5 Vitest unit tests plus 9 passing Playwright scenarios across
  desktop Chromium and a 390 px mobile viewport (1 intentional desktop skip
  for the mobile-only width assertion).
- Playwright covers first-run onboarding, equation errors, interval creation,
  playback, HTML download, returned-license verification, URL token removal,
  no console errors, mobile overflow, and axe serious/critical checks.
- Axe: 0 serious or critical violations on desktop and mobile editor states.
- `npm run build`: passes TypeScript strict checking and Vite production build.
- `npm audit --omit=dev`: 0 vulnerabilities. Full install audit also reports 0.
- Lighthouse 12.8.2, mobile defaults against the production preview:
  Performance **100**, Accessibility **100**, Best Practices **100**, SEO
  **100**; FCP 0.9 s, LCP 1.5 s, CLS 0, total blocking time 70 ms.
- Production budgets (uncompressed): initial JS 39.9 KB, main CSS 18.8 KB,
  fonts 0 KB, hero WebP 42.0 KB. All are well below the required ceilings.
- Visual inspection completed at 1440 × 1000 and 390 × 844. The phone layout
  intentionally puts the stage first, then source controls and interval map.
- `prefers-reduced-motion` removes UI transition duration; authored motion is
  user-started and always pausable.

## Known gaps and next steps

- The tool intentionally provides numerical expression evaluation rather than
  a CAS or mathematical correctness checking. Display labels use offline
  system math characters/Unicode, not a full LaTeX dialect.
- PNG frame export is in-memory because this is a static application. Very long
  high-frame-rate decks can consume substantial memory; v1 is optimized for the
  brief’s short explanatory figures. HTML export remains lightweight.
- The factory still needs to register the production billing product/return URL
  and exercise a live purchase. No product ID or payment-provider secret is
  embedded in this repository.
- Browser-provided MP4 encoding is inconsistent, so v1 honestly supplies an
  MP4-ready PNG sequence and exact FFmpeg command instead of claiming native
  MP4 output.
