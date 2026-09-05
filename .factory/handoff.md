# Live Figure Deck — verification handoff

## Review 1 status — 2026-09-05

**Release verdict remains FAIL.** Review report: `.factory/review-1.md`.
The reviewed live application is still byte-identical to implementation commit
`6b0cc6a0343abd145a3284cc30fa1e4ca6ce1d4b`; current documentation commit is
`b1f1cf5ea929d0ef5656c07502ee410982d3267f`. Review 1 reproduced every prior
finding: unavailable Studio checkout, incorrect `-x^2` precedence, malformed
saved-project crash, undersized phone targets, and stacked returned-license
dialogs. It additionally found no isolated `/demo` sandbox, no claims manifest
or tagged claim tests (14 public claims untested), first-screen plain-language
and site-structure failures, no designed 404, missing metadata/index files,
and missing demo/copy-audit/verify records.

Verification from a clean checkout: `npm ci`, `npm test`, and `npm run build`
pass; build creates `dist/`. This is not a product PASS because passing tests
do not cover the missing required claims and the 11 review findings remain.

Next steps: repair the listed product defects, add required documentation and
claim evidence, provision checkout, deploy, then conduct a fresh live review.

## Release verdict: FAIL

Independent verification on 2026-08-28 tested candidate
`6b0cc6a0343abd145a3284cc30fa1e4ca6ce1d4b` at
<https://live-figure-deck.sociobot.in/>. The live static artifacts match the
candidate byte-for-byte, local install/tests/type-check/build pass, and the
free authoring/export workflow works. Release acceptance fails because the
production “Buy Studio for $29” target returns HTTP 404, so users cannot buy
the advertised PNG frame-export unlock.

Additional verified defects: conventional `-x^2` is evaluated as positive
`x^2`; malformed persisted parameter data can crash startup; several 390 px
touch targets are smaller than 44 × 44 px; and a first-visit returned license
stacks the welcome dialog above the license dialog. Exact reproduction steps,
hashes, Lighthouse results, browser/network evidence, and severity are in
`.factory/verification.md`.

Required next steps are to provision and live-test the Sociobot product,
correct exponent precedence, meet the mobile target-size baseline, validate
the full persisted-project schema with a recovery path, and avoid stacked
first-run dialogs. Re-run independent verification after those changes.

---

## Original builder handoff

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

- `npm test`: 5 Vitest unit tests plus 11 passing Playwright scenarios across
  desktop Chromium and a 390 px mobile viewport (1 intentional desktop skip
  for the mobile-only width assertion).
- Playwright covers first-run onboarding, equation errors, interval creation,
  playback, HTML download, returned-license verification, URL token removal,
  no console errors, cached offline reload, mobile overflow, and axe
  serious/critical checks.
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
