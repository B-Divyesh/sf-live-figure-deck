# Live Figure Deck — verification 3 handoff

## Release status

Independent verification 3 passed the deployed product at
<https://live-figure-deck.sociobot.in/>.

- Verdict: **PASS** — 0 findings and 0 untested claims.
- Implementation and deployed commit:
  `e348fb0a1f15bcd2b85415a02790d385de67401a`.
- Documentation baseline before this report:
  `0462735d72622df508d49ad525f24de2f10c6126`.
- Current report: `.factory/verification-3.md`.
- Historical failed review: `.factory/review-1.md`.
- Repair verification: `.factory/repair-1-verification.md`.
- Current browser and Lighthouse evidence:
  `/work/.evidence/live-figure-deck-verify-3/`.

Verification 3 reran every declared claim command from a clean checkout, the
full unit/browser suite, build, audits, fresh desktop and phone flows, Axe,
the factory URL verifier, offline/update checks, both exports, legal routes,
intentional 404s, and Lighthouse. A clean build of the exact implementation
candidate matched all 20 checked production artifacts byte-for-byte.

## What changed

- Added a plain-language landing page that states the job, audience, first
  action, and three facts before scrolling on a 390 px phone.
- Added `/app` for real work and `/demo` for an immediate populated sample.
  Demo storage uses `demo:lfd:project:v1`; real storage uses
  `lfd:project:v1`.
- Added the persistent demo label, “Reset demo,” and “Start for real.” Leaving
  the demo removes its key without reading or changing the real key.
- Corrected exponent precedence. `-x^2` now evaluates as `-(x^2)`, while
  `(-x)^2`, `2^3^2`, and `2^-2` keep their standard meanings.
- Added complete saved-project shape checks and a visible recovery action for
  incomplete or damaged local data.
- Raised visible phone controls to at least 44 × 44 CSS pixels and retained
  visible focus, keyboard dialog behavior, and reduced-motion handling.
- Added route-specific titles and canonical URLs, full social metadata, an
  Apple touch icon, sitemap, security headers, and a designed 404 response.
- Added `.factory/claims.json`, `.factory/demo.md`, the landing copy audit, and
  ten outcome-based claim tests.
- Added a 600-image browser-memory guard for PNG frame packs with a clear
  recovery instruction.
- Removed the unavailable Studio purchase path and made PNG frame export free.
  The product no longer links to the unprovisioned 404 checkout.

## Review 1 disposition

| Finding | Disposition |
| --- | --- |
| Studio checkout returned 404 | Closed in the product: the dead offer and paywall were removed; both exports are free. Billing registration remains an external dependency before paid access can return. |
| No isolated demo | Fixed with `/demo`, a separate `demo:` key, persistent label, reset, and clean exit. |
| No claims evidence | Fixed with ten declared claims and one tagged observable test for each. |
| Wrong `-x^2` precedence | Fixed in the parser and both editor/export paths; unit and browser outcomes cover it. |
| Malformed saved data crashed startup | Fixed with full shape validation and an in-product replacement action. |
| Phone targets below 44 px | Fixed and measured across every visible link, button, input, select, and summary in the demo. |
| Stacked license dialogs | Fixed by removing the unavailable license flow; legacy return tokens are stripped and only onboarding opens. |
| Unclear first screen | Replaced with a job-first landing page and required section order. |
| Demo and unknown routes were not real | `/demo` has its own state/title; `/404` and arbitrary missing routes return HTTP 404 with a designed page. |
| Metadata and index files missing | Added canonical, Open Graph, Twitter, touch icon, sitemap, and response-header `frame-ancestors`. |
| Review documents missing | Added the demo guide, claims manifest, copy audit, catalog description, and this verification record. |

The 14 previously untested statements are either covered by the ten combined
claim tests or removed. The removed statement was the once-daily Studio license
check because the unavailable paid flow is no longer presented.

## Clean verification

Run from the repository root with Node.js 20 or newer:

```sh
npm ci
npm test
npm run build
```

Results on 5 September 2026:

- `npm ci`: pass; 61 packages installed; 0 audit vulnerabilities.
- `npm test`: pass; 6 unit tests, 18 browser tests passed, and 16 intentional
  project-specific skips.
- Every command in `.factory/claims.json`: pass from the clean install.
- `npm run build`: pass; `dist/index.html` exists.
- `npm audit` and `npm audit --omit=dev`: pass with 0 vulnerabilities.
- Playwright axe scan: 0 violations on `/`, `/app`, `/demo`, `/privacy/`,
  `/terms/`, and both tested 404 routes.
- Worker URL verifier: pass on live `/` and `/demo`; no console or page errors.
- Live fresh Chromium: desktop 1440 × 1000 and phone 390 × 844 pass. The first
  action is visible before scrolling, the sample is populated, and no
  horizontal overflow occurs.
- Live sample flow: formula precedence, HTML download, PNG ZIP download,
  isolated reset, and offline reload pass.
- Live routes: `/`, `/app`, `/demo`, `/privacy/`, and `/terms/` return 200;
  `/404` and an arbitrary missing route return the designed page with 404.
- Live security headers include CSP `frame-ancestors 'none'`, HSTS, nosniff,
  a strict-origin referrer policy, and camera/microphone/geolocation denial.
- All 20 checked served files match the exact candidate build byte-for-byte.

## Performance

Lighthouse 12.8.2 mobile results against production:

| Route | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 100 | 100 | 100 | 100 | 0.8 s | 0.9 s | 10 ms | 0 |
| `/demo` | 100 | 100 | 100 | 100 | 0.9 s | 1.2 s | 40 ms | 0 |

The production build emits 45.5 KB of uncompressed application JavaScript in
two route-loaded files and 22.7 KB of main CSS. It uses no downloaded fonts.
The generated source artwork is 42.0 KB; the social image is 78.2 KB and is not
loaded into the first screen.

## Known limits and next steps

- Direct MP4 encoding remains outside this browser-only product. The PNG pack
  includes an FFmpeg command, matching the brief’s MP4-ready requirement.
- The evaluator is numerical, not a computer algebra system or correctness
  checker.
- Frame packs are limited to 600 images to prevent unbounded browser memory
  use. Lower the duration or frame rate for a larger request, or use HTML.
- One-time billing is not provisioned for this slug. Both exports remain free
  until the factory registers and verifies the Sociobot billing product. Do not
  restore paid copy or a checkout link before that external dependency works.
