# Review 2: build and export an animated formula figure

## Verdict: PASS

Reviewed 5 September 2026 UTC.

- Findings: **0**
- Untested claims: **0**
- Live URL: <https://live-figure-deck.sociobot.in/>
- Implementation reviewed: `e348fb0a1f15bcd2b85415a02790d385de67401a`
- Documentation baseline: `aa3a9b9a2faf56a37386a24b6c382a84efb0ef95`

The product passes this fresh strict review. The deliberate HTTP 404 responses
show the designed not-found page and are not defects.

## Job, audience, and first action

Job: build one formula-driven animated figure for a presentation, then export
an interactive HTML slide or numbered PNG frames.

Audience: scientists and educators who need one clear moving plot without a
full animation pipeline.

First action before scrolling: **Try it with sample data**. The adjacent text
says it opens a six-second wave figure to edit, play, and export. The job,
audience, action, result, and three facts are visible before scrolling at both
1440 × 1000 and 390 × 844.

## Clean checkout and claim commands

I cloned documentation commit `aa3a9b9` into a new temporary directory and ran
the documented setup with Node `v22.23.2`, npm `10.9.8`, and pinned Playwright
`1.58.2`. Product files at that commit are unchanged from `e348fb0`.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 61 packages installed; 0 vulnerabilities |
| `npm test` | PASS — 6 unit tests and 18 browser checks; 16 intentional cross-project skips |
| `npm run build` | PASS — type check and Vite build; `dist/index.html` exists |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

Every command declared in `.factory/claims.json` was then run separately from
that clean checkout:

| Claim | Exact command | Result |
| --- | --- | --- |
| Formula evaluation | `npm test -- --grep @claim:expression-evaluation` | PASS — supported functions and standard exponent precedence |
| Interval timing | `npm test -- --grep @claim:interval-timing` | PASS — exact times, retained end values, and overlap rejection |
| Frame playback | `npm test -- --grep @claim:frame-playback` | PASS — 1 and 60 fps limits, frame step, play, and pause |
| HTML export | `npm test -- --grep @claim:html-export` | PASS — byte-identical downloads and offline playback |
| PNG export | `npm test -- --grep @claim:png-export` | PASS — numbered 1280 × 720 images, manifest, and FFmpeg command |
| Frame-pack limit | `npm test -- --grep @claim:frame-pack-limit` | PASS — more than 600 images gives a recovery instruction |
| Local save | `npm test -- --grep @claim:local-save` | PASS — demo changes, reset, and exit leave real storage unchanged |
| Local privacy | `npm test -- --grep @claim:local-privacy` | PASS — same-origin requests, no cookies, and no third-party scripts |
| No account | `npm test -- --grep @claim:no-account` | PASS — the populated editor opens without setup |
| Offline editor | `npm test -- --grep @claim:offline-editor` | PASS — a dedicated context reloads the populated demo offline |

Each of the ten claim identifiers appears on exactly one browser test. I also
audited the landing page, editor, export dialog, README, Privacy, and Terms.
All public claims map to the manifest. None is missing, false, incomplete, or
untested.

## Fresh live browser review

Fresh Chromium contexts covered desktop, phone, reduced motion, downloads,
offline use, and damaged storage. The combined live review completed 120
passing assertions.

- One click from the home page opened `/demo` with “A wave gathers amplitude,”
  `a * sin(b * x) + c`, a populated plot, and two named intervals.
- “Demo — sample data, nothing is saved to your figures” remained visible
  after scrolling. Reset restored the original sample. Starting for real
  removed the demo key and did not read or change a real-data sentinel.
- `-x^2` produced values from -4.00 to -1.00 over x = 1…2.
  `window.alert(1)` and `mystery(x)` were rejected, and a valid formula
  restored the plot.
- Frame rate and duration clamped at 1 and 60. A same-parameter interval from
  2 to 4 seconds was rejected because it overlapped the sample interval.
- Arrow Right stepped one frame to 0.03 seconds. Space played and paused.
  `P` entered presentation mode, Escape left it, and focus returned correctly.
- Two live HTML exports were byte-identical. The file had no remote dependency,
  opened offline, stepped one frame, and played.
- A live one-second, one-fps frame pack contained two numbered PNG files at
  1280 × 720 plus the correct manifest and FFmpeg command.
- A 3,601-image request showed the 600-image limit and told the user to lower
  duration or frame rate.
- A damaged saved project showed a recovery message. “Replace with sample”
  restored a working figure. A blank start explained how to add an interval.
- A legacy `?license=` value was removed after route load and only one welcome
  dialog opened. The removed paid offer and dead checkout did not return.
- No unexpected console error, page error, failed subresource, or horizontal
  page overflow occurred in the exercised user paths.

Screenshots and machine evidence are in
`/work/.evidence/live-figure-deck-review-2/`.

## Accessibility, mobile, and motion

- Playwright Axe found zero violations on `/`, `/app`, `/demo`, `/privacy/`,
  `/terms/`, `/404`, and a random missing route.
- Every route has `lang="en"`, one `h1`, one `main`, a useful title, and the
  expected landmarks. The canvas has a text alternative.
- The skip link is first in keyboard order, has a visible 3 px focus outline,
  and moves focus to main. Dialog and presentation focus entry and return
  passed without a trap.
- At 390 px, every visible link, button, input, select, and summary measured at
  least 44 × 44 CSS pixels. Home and demo had no horizontal overflow.
- The 200% layout check kept all task content available without horizontal
  loss. At reduced motion, the checked UI transition was effectively instant.
  Figure playback remained paused until requested.
- The factory URL verifier passed on both `/` and `/demo` with correct title,
  language, structure, alternative text, and no browser errors.

The design is intentionally single-mode. Its documented dark signal-console
palette has sufficient contrast, and Axe's color checks passed.

## Privacy, offline use, routes, and response policy

- The complete live edit and export flow requested only the product origin and
  set no cookies. Static inspection found no analytics, advertising, remote
  font, upload, or beacon path.
- After one online visit, the service worker controlled `/demo`. An explicit
  update left an activated worker with none waiting. The populated editor then
  reloaded offline and showed the offline state.
- `/`, `/app`, `/demo`, `/privacy/`, and `/terms/` return HTTP 200 with their
  own titles. All internal links tested successfully. Privacy and Terms each
  expose their contact link.
- `/404` and `/qa-missing-review-2` return HTTP 404 with the designed “This page
  does not exist” page and routes back to useful content.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy,
  camera/microphone/geolocation denial, and a CSP with
  `frame-ancestors 'none'`. Metadata, icons, `robots.txt`, and `sitemap.xml`
  are present.

This is a static product. Backend tenant isolation, restart persistence,
health, and 429 checks do not apply. The brief calls for deterministic local
authoring, so an AI step would not improve the core job.

## Performance and deployment identity

Fresh Lighthouse 12.8.2 mobile runs completed without runtime errors:

| Route | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 100 | 100 | 100 | 100 | 0.8 s | 0.8 s | 10 ms | 0 | 10.7 KB |
| `/demo` | 100 | 100 | 100 | 100 | 0.8 s | 1.0 s | 30 ms | 0 | 66.0 KB |

The candidate build contains 45.51 KB of uncompressed application JavaScript,
22.68 KB of main CSS, no downloaded fonts, a 41.95 KB source illustration, and
a social image that is not loaded on the first screen. These are inside the
supplied budgets.

I checked out exact implementation commit `e348fb0`, built it, and compared
every deployable file except `staticwebapp.config.json`. All 21 checked files
match production byte-for-byte. Representative SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `index.html` | `8ac655d1b4dbfc61633047ad8adf2e60726716c594fe5ca66850cfebc90d7f4c` |
| `assets/main-mD5oxo_a.js` | `031acbea0a727b45a3ffe3e2e87a352603b9e45f64310ee8223140bd4be81627` |
| `assets/editor-W6zcwWrA.js` | `821a5465dc784fa6205ce86816dd9cda91a3ffb9692efe7b7b6e5bad312a7846` |
| `assets/main-V2H6hlyb.css` | `01c5c02fc6b2b76d5ad29d429962b654918b749f09878f4660cf4b0fe4bae853` |
| `sw.js` | `05a691a87dfe818ccbdbde80f2185a5cbac25b655c75a078f4d45a164fe48e5d` |
| `404.html` | `c7d965cca24aad1f91cb282db8c9badd9ffa6da6beb17f5ea8190076c0835e2a` |

The documentation commits after `e348fb0` do not change product output and do
not require a new deployment.

## Earlier finding disposition

| Review 1 finding | Current disposition and fresh proof |
| --- | --- |
| Dead Studio checkout | Closed — no paid offer, license check, or checkout remains; both exports work free. |
| No isolated one-click demo | Closed — `/demo`, its persistent label, separate key, reset, and clean exit passed live. |
| Missing claims evidence | Closed — ten manifest entries exist, each exact command passed, and the public-claim audit found no gap. |
| Incorrect `-x^2` precedence | Closed — unit, claim, live plot, and exported expression use standard precedence. |
| Damaged saved data crashed startup | Closed — the live recovery message and replacement action passed. |
| Phone targets below 44 px | Closed — every visible phone target passed measurement at 390 px. |
| Returned license stacked dialogs | Closed — the legacy token is stripped and one welcome dialog opens. |
| First screen did not state job or audience | Closed — the job, audience, action, result, and three facts appear before scrolling. |
| Demo and unknown routes were not real | Closed — demo has its own state/title; deliberate missing routes return the designed HTTP 404 page. |
| Metadata and index files were missing | Closed — route metadata, icons, sitemap, robots, CSP, and titles passed live. |
| Review documents were incomplete | Closed — claims, demo, copy audit, design, prior verifications, and current handoff exist. |

The 14 statements that lacked tests in Review 1 are now covered by the ten
combined claim tests, except the former paid-license claim, which was removed
with the unavailable paid flow.

## Release decision

**PASS — 0 findings and 0 untested claims.** No product change or deployment is
required.
