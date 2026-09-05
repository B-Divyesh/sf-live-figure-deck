# Live Figure Deck — review 2 handoff

## Release status

Strict review 2 passed the deployed product at
<https://live-figure-deck.sociobot.in/>.

- Verdict: **PASS — 0 findings and 0 untested claims.**
- Implementation and deployed commit:
  `e348fb0a1f15bcd2b85415a02790d385de67401a`.
- Documentation baseline reviewed:
  `aa3a9b9a2faf56a37386a24b6c382a84efb0ef95`.
- Current report: `.factory/review-2.md`.
- Evidence: `/work/.evidence/live-figure-deck-review-2/`.

No product code changed. The commits after the implementation candidate contain
only reports and handoff records, so no new product image is needed.

## What review 2 verified

- The home page states the job, audience, sample action, result, and three facts
  before scrolling on desktop and phone.
- The one-click demo opens a populated six-second wave figure. Its persistent
  label, reset, separate storage key, and clean exit leave real data unchanged.
- Normal, invalid, boundary, empty, damaged-storage, and export-limit paths all
  give usable output or a clear recovery step.
- Live HTML exports are deterministic and run offline. Live PNG packs contain
  numbered 1280 × 720 images, a manifest, and an FFmpeg command.
- Keyboard playback, frame stepping, presentation mode, dialog focus return,
  reduced motion, 200% reflow, phone targets, and screen structure passed.
- Axe found zero violations across all public page types. The factory URL
  verifier passed on `/` and `/demo`.
- Editing and export used only same-origin requests and no cookies. Offline
  reload and service-worker update passed.
- Legal pages, internal links, metadata, security headers, route titles, and
  designed HTTP 404 responses passed.
- All 21 deployable files checked from exact implementation `e348fb0` match the
  live site byte-for-byte.

## Clean verification

Use Node.js 20 or newer from the repository root:

```sh
npm ci
npm test
npm run build
```

Review 2 results on 5 September 2026:

- `npm ci`: pass; 61 packages installed; 0 vulnerabilities.
- `npm test`: pass; 6 unit tests and 18 browser checks passed, with 16
  intentional cross-project skips.
- Every command in `.factory/claims.json`: pass when run separately.
- `npm run build`: pass; `dist/index.html` exists.
- `npm audit` and `npm audit --omit=dev`: pass with 0 vulnerabilities.
- Fresh live browser review: 120 assertions passed across desktop and phone.
- Lighthouse 12.8.2 on `/`: 100 performance, accessibility, best practices,
  and SEO; LCP 0.8 s, TBT 10 ms, CLS 0.
- Lighthouse 12.8.2 on `/demo`: 100 in all four categories; LCP 1.0 s,
  TBT 30 ms, CLS 0.

## Earlier findings

All 11 Review 1 findings remain closed. Fresh review 2 evidence covers the dead
checkout removal, demo isolation, claim tests, exponent precedence, damaged
storage recovery, phone targets, legacy license return, first-screen copy,
real routes, metadata, and documentation. The earlier 14 untested statements
are covered by current claims or were removed with the paid flow.

## Known limits and next steps

- Direct MP4 encoding remains outside this browser-only product. The PNG pack
  includes an FFmpeg command, which meets the brief's MP4-ready requirement.
- The evaluator is numerical. It does not check the meaning or correctness of
  the user's equation.
- Frame packs are limited to 600 images to protect browser memory. Users can
  lower duration or frame rate, or use HTML export.
- One-time billing is not provisioned. Both exports remain free. Do not restore
  paid copy or checkout until the factory registers and verifies the product.
- No repair or deployment is required for this review.
