# Verification 3: build and export an animated formula figure

## Verdict: PASS

Verified 5 September 2026 UTC.

- Findings: **0**
- Untested claims: **0**
- Live URL: <https://live-figure-deck.sociobot.in/>
- Implementation reviewed: `e348fb0a1f15bcd2b85415a02790d385de67401a`
- Documentation baseline: `0462735d72622df508d49ad525f24de2f10c6126`
- Environment: Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`,
  Chrome for Testing `145.0.7632.6`, Lighthouse `12.8.2`

The product passes with zero findings of every severity and zero untested
claims. The intentional HTTP 404 responses are designed not-found pages and
are not defects.

## Job, audience, and first action

Job: build one formula-driven animated figure for a presentation and export
it as an interactive HTML slide or numbered PNG frames.

Audience: scientists and educators who need one clear moving plot without a
full animation pipeline.

First action before scrolling: **Try it with sample data**. The text beside it
says that it opens a six-second wave figure to edit, play, and export. The
desktop and 390 px phone first screens state the job and audience, show this
action, and list three short facts before scrolling.

## Clean checkout and claim commands

I cloned the documentation baseline into a temporary clean directory and ran
the documented setup with Node 22. The implementation files at that baseline
are unchanged from the candidate.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 61 packages, 0 vulnerabilities |
| `npm test` | PASS — 6 unit tests and 18 browser checks; 16 intentional project-specific skips |
| `npm run build` | PASS — type check and Vite build; `dist/index.html` produced |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

Every command in `.factory/claims.json` was then run separately and passed:

| Claim | Exact command | Evidence |
| --- | --- | --- |
| Formula evaluation | `npm test -- --grep @claim:expression-evaluation` | PASS — supported functions and standard `-x^2` precedence |
| Interval timing | `npm test -- --grep @claim:interval-timing` | PASS — exact seeded times, retained end value, overlap rejection |
| Frame playback | `npm test -- --grep @claim:frame-playback` | PASS — 1 and 60 fps boundaries, frame step, play, pause |
| HTML export | `npm test -- --grep @claim:html-export` | PASS — byte-identical downloads, no remote dependency, offline playback |
| PNG export | `npm test -- --grep @claim:png-export` | PASS — numbered 1280 × 720 PNGs, manifest, FFmpeg command |
| Frame-pack limit | `npm test -- --grep @claim:frame-pack-limit` | PASS — over-600 request gives a useful recovery step |
| Local save and demo isolation | `npm test -- --grep @claim:local-save` | PASS — demo reset and exit leave the real sentinel unchanged |
| Local privacy | `npm test -- --grep @claim:local-privacy` | PASS — same-origin requests, no cookies, no third-party scripts |
| No account | `npm test -- --grep @claim:no-account` | PASS — populated editing and playback open without setup |
| Offline editor | `npm test -- --grep @claim:offline-editor` | PASS — controlled, isolated context reloads the demo offline |

I also audited the landing page, editor, export dialog, README, Privacy, and
Terms against the manifest. Their observable claims map to these ten entries.
There are no missing, false, incomplete, or untested public claims.

## Live end-to-end evidence

Fresh independent Chromium contexts exercised production at 1440 × 1000,
390 × 844 with touch, and a 640 CSS-pixel two-times-scale equivalent. The live
script completed 100 assertions.

- `/demo` opened “A wave gathers amplitude,” the formula
  `a * sin(b * x) + c`, and both realistic named intervals immediately.
- The label “Demo — sample data, nothing is saved to your figures” remained
  visible after scrolling. Reset restored the sample. Starting for real
  removed only `demo:lfd:project:v1`; a sentinel in `lfd:project:v1` never
  changed.
- `-x^2` produced sampled values from -4.00 to -1.00 for x from 1 to 2.
  `mystery(x)` showed an unknown-function error and recovered after correction.
- Frame rate clamped to 1 and 60 at its boundaries. A same-parameter 2–4
  second interval was rejected for overlap.
- Arrow Right stepped to 0.03 seconds. `P` entered presentation mode with
  focus on its exit control; Escape returned focus to Present.
- Two consecutive live HTML exports of one project were byte-identical. The
  exported file contained no remote dependency, opened offline, and stepped
  by one frame.
- A live 1 second, 1 fps PNG download contained two numbered PNG files and
  `manifest.json`. The clean claim check independently verified 1280 × 720
  dimensions and the FFmpeg command.
- A blank start opened an editable empty figure and explained how to add the
  first interval. Damaged stored data showed the recovery message, and
  “Replace with sample” restored a working figure.
- A legacy `?license=` value was removed from the URL and opened only the
  welcome dialog. No paid offer or dead checkout remains; both exports work
  free.
- The live flow produced no unexpected console error, page error, or failed
  subresource request.

Screenshots and machine output are under
`/work/.evidence/live-figure-deck-verify-3/`.

## Accessibility, mobile, and motion

- Playwright Axe found zero violations on `/`, `/app`, `/demo`, `/privacy/`,
  `/terms/`, `/404`, and a random missing route.
- Each page has English language metadata, one `h1`, one `main`, a useful
  title, and the expected landmarks. Controls have accessible names; the
  plot has a text alternative.
- The skip link is the first keyboard target, has a visible 3 px focus ring,
  and moves focus to main. Dialog and presentation focus entry and return
  worked without a trap.
- At 390 px, all visible links, buttons, inputs, selects, and summaries
  measured at least 44 × 44 CSS pixels. Home and demo had no horizontal
  overflow. The two-times-scale equivalent also reflowed without horizontal
  loss.
- With reduced motion requested, the tested UI transition was effectively
  disabled. Authored animation remained paused and user-controlled.
- The factory `verify-url.sh` passed on live `/` and `/demo`: correct title,
  language, heading/main structure, alt checks, and no browser errors.

## Privacy, offline use, links, and routes

- The complete live edit and export flow requested only
  `https://live-figure-deck.sociobot.in` and set no cookies. Static review
  found no analytics, advertising, CDN script/font, upload, or beacon path.
- After one online visit, the service worker controlled `/demo`; an explicit
  update completed with an activated worker and no waiting worker. A fresh
  offline reload kept the populated editor usable and showed its offline
  state.
- `/`, `/app`, `/demo`, `/privacy/`, and `/terms/` return HTTP 200 with their
  own titles. All discovered internal links return 200.
- `/404` and `/qa-missing-verify-3` return HTTP 404 with the designed
  “This page does not exist” page, navigation, and a route back. Chromium's
  document-level 404 console notice is expected; there are no missing assets
  or broken user paths.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy,
  camera/microphone/geolocation denial, and a CSP with
  `frame-ancestors 'none'`. `robots.txt`, `sitemap.xml`, canonical links,
  social metadata, icons, Privacy, and Terms are present.

This is a static product, so backend tenant, restart, health, and 429 checks do
not apply. AI would not improve the brief's deterministic local authoring job,
so the absence of an AI feature is not a missed-leverage finding.

## Performance and deployment identity

Fresh Lighthouse 12.8.2 mobile runs against production:

| Route | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 100 | 100 | 100 | 100 | 0.8 s | 0.9 s | 10 ms | 0 | 12 KiB |
| `/demo` | 100 | 100 | 100 | 100 | 0.9 s | 1.2 s | 40 ms | 0 | 66 KiB |

The candidate build contains 45.51 KB uncompressed application JavaScript,
22.68 KB CSS, no downloaded fonts, a 41.95 KB first-screen illustration, and
a 78.24 KB social image that is not loaded on the first screen. These remain
inside the supplied budgets.

I built exact implementation commit `e348fb0` and compared every served file
in `dist/` except the deployment configuration itself. All 20 checked files
matched production byte-for-byte, including the HTML pages, hashed JS/CSS,
source maps, service worker, manifest, icons, images, robots file, and sitemap.
Representative hashes:

| File | SHA-256 |
| --- | --- |
| `index.html` | `8ac655d1b4dbfc61633047ad8adf2e60726716c594fe5ca66850cfebc90d7f4c` |
| `assets/main-mD5oxo_a.js` | `031acbea0a727b45a3ffe3e2e87a352603b9e45f64310ee8223140bd4be81627` |
| `assets/editor-W6zcwWrA.js` | `821a5465dc784fa6205ce86816dd9cda91a3ffb9692efe7b7b6e5bad312a7846` |
| `assets/main-V2H6hlyb.css` | `01c5c02fc6b2b76d5ad29d429962b654918b749f09878f4660cf4b0fe4bae853` |
| `sw.js` | `05a691a87dfe818ccbdbde80f2185a5cbac25b655c75a078f4d45a164fe48e5d` |
| `404.html` | `c7d965cca24aad1f91cb282db8c9badd9ffa6da6beb17f5ea8190076c0835e2a` |

The only commits after the implementation candidate and before this report
change `.factory/handoff.md` and add `.factory/repair-1-verification.md`.
They do not require a different product image.

## Earlier finding disposition

| Earlier finding | Current disposition and proof |
| --- | --- |
| Dead Studio checkout | Closed — the paid offer and license verification path are absent; both live exports work free. |
| No isolated one-click demo | Closed — `/demo`, persistent label, separate key, reset, and clean exit all passed live. |
| Missing claims evidence | Closed — ten entries exist, each exact command passed, and no public claim is unlisted. |
| Incorrect `-x^2` precedence | Closed — unit, claim, live plot, and exported-expression paths produce negative values. |
| Damaged saved data crashed startup | Closed — live recovery message and replacement action passed. |
| Phone touch targets below 44 px | Closed — every visible interactive target passed the 390 px measurement. |
| Returned license stacked dialogs | Closed — live legacy return strips the token and shows one welcome dialog. |
| First screen did not state job or audience | Closed — job, audience, action, next result, and three facts are visible before scrolling. |
| Demo and unknown routes were not real | Closed — demo has its own state/title; `/404` and random missing paths return designed HTTP 404 pages. |
| Metadata and index files were missing | Closed — metadata, icons, sitemap, robots, CSP, and route titles passed live. |
| Review documents were incomplete | Closed — claims, demo, copy audit, design, repair evidence, and current handoff are present. |

## Release decision

**PASS.** There are zero findings and zero untested claims. No product repair
or redeployment is required for this candidate.
