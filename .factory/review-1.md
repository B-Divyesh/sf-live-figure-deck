# Review: author and export a formula-driven animated figure

## Verdict: FAIL

Reviewed 2026-09-05 UTC.

Job: create one formula-driven animated figure for a presentation and export it.
Audience: scientists and educators who need a short explanatory figure without
adopting an animation pipeline. First action before scrolling: the live first
screen offers **Open example**; it loads a realistic wave figure, but it is not
the required isolated sample sandbox.

- Live URL: <https://live-figure-deck.sociobot.in/>
- Implementation reviewed: `6b0cc6a0343abd145a3284cc30fa1e4ca6ce1d4b`
  (`test: verify cached offline editor`).
- Documentation/report commit: `b1f1cf5ea929d0ef5656c07502ee410982d3267f`
  (`docs: record independent verification failure`).
- The only changes from the implementation to the documentation commit are
  `.factory/handoff.md` and `.factory/verification.md`.
- The live `index.html`, JS, and CSS SHA-256 values match the clean local build
  byte-for-byte. This is the implementation above, not a later deployment.

There are **11 findings** and **14 untested public claims**. This product does
not pass release review.

## What I ran

From the clean checkout at `b1f1cf5`:

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 59 packages installed, 0 audit vulnerabilities reported |
| `npm test` | PASS — 5 Vitest tests; 11 Playwright tests passed; 1 mobile-only test skipped on desktop |
| `npm run build` | PASS — TypeScript check and Vite build; `dist/index.html` produced |
| Every declared claim command | NOT RUNNABLE — `.factory/claims.json` does not exist, so no claim commands are declared |
| Live desktop and fresh phone browser | Completed at 1440 × 1000 and 390 × 844 |
| Live axe scan after opening the example | PASS — 0 axe violations on desktop |

The required `verify-url.sh` is not in this repository. No lint command is
declared. The passing test suite is not a substitute for the missing claim
tests: it has no `@claim:` tags and does not use the required demo entry point.

## Findings

### 1. High — Studio checkout cannot be bought

`GET https://api.sociobot.in/api/v1/products/live-figure-deck/checkout`
returns HTTP 404 with `{"error":"enabled factory product","status":404}`.
The live product advertises “Buy Studio for $29”, but a customer cannot start
that purchase. The invalid-license verify endpoint returned 200 with
`valid:false`; that does not make checkout work.

Disposition of the earlier high finding: **unresolved**. The live implementation
hash is unchanged.

### 2. High — the one-click sample is not an isolated demo sandbox

The required `/demo` opens the normal welcome dialog, has the normal landing
title, no sample banner, and no “Reset demo” control. Clicking “Open example”
stores the sample under the real key `lfd:project:v1`; there is no `demo:`
storage namespace. It therefore cannot prove that sample work never reads or
writes real data. `.factory/demo.md` is also absent.

### 3. High — claims evidence is entirely absent

`.factory/claims.json` is absent, `rg '@claim:'` found no tagged tests, and
there are no declared claim commands to run. The following 14 distinct public
claims are consequently unlisted and untested under the claims contract:

1. supported numeric expression evaluation;
2. named interval precision and non-overlap;
3. configurable 1–60 fps playback and frame stepping;
4. self-contained interactive HTML export;
5. HTML export works offline with no runtime server;
6. deterministic export frame timing;
7. 1280 × 720 PNG frame packs and FFmpeg manifest;
8. current-project autosave in browser storage;
9. equations, labels, and exports are not uploaded;
10. no account, tracking, or runtime server;
11. no cookies or analytics scripts;
12. license checks occur at most once per day and do not block first paint;
13. the service worker caches the editor shell after first visit;
14. the free editor and downloaded HTML slides work without a runtime server.

The prior implementation test suite gives useful incidental coverage, but it
does not satisfy the required one observable demo-flow test for each claim.

### 4. High — a standard scientific expression has incorrect precedence

The evaluator and export compiler parse `-x^2` as `(-x)^2`, yielding positive
9 at `x=3`. In standard mathematical notation this is `-(x^2)`, yielding
negative 9. The repository test explicitly asserts the incorrect positive
result, so the defect is also encoded as expected behaviour.

Disposition of the earlier medium finding: **unresolved**.

### 5. Medium — malformed saved data crashes recovery

In a fresh browser, saving a version-1 project with the normal scalar fields,
`intervals: []`, and `parameters: {}` then reloading produces:

```text
Cannot read properties of undefined (reading 'label')
```

The welcome dialog remains closed and the parameter controls are empty. A
local-first editor needs schema validation plus an in-product recovery path.

Disposition of the earlier medium finding: **unresolved**.

### 6. Medium — phone touch targets are below the required minimum

At 390 × 844 after opening the example, measured controls include the brand
link (23 × 44 px), license control (29 × 44 px), interval blocks (172 × 40 and
126 × 40 px), Privacy (43 × 14 px), and Terms (35 × 14 px). Each misses the
44 × 44 px touch-target baseline in at least one dimension.

Disposition of the earlier medium finding: **unresolved**.

### 7. Low — license return stacks two modal dialogs

With a fresh context and `?license=qa-valid` (verification response intercepted
only for this UI check), the URL is cleaned but both `welcome-dialog` and
`license-dialog` are open. The welcome dialog is in front of the confirmation.

Disposition of the earlier low finding: **unresolved**.

### 8. Medium — the first screen does not state the job, audience, and first action in plain words

The first visible heading is “Animate the idea, not the slide.” It is not the
job in the user's words, does not name scientists or educators, and is a
metaphor prohibited by the plain-words contract. The action is “Open example”,
not “Try it with sample data”, and does not say what happens next. The route is
an editor behind a dialog rather than the required landing-page structure with
plain facts, live preview, how-it-works, limits/privacy, and consistent
navigation.

### 9. Medium — demo and unknown routes are not real routes

`/demo`, `/404`, and `/this-route-does-not-exist` all return the editor shell
with HTTP 200. `/demo` has the landing title rather than “Demo — Live Figure
Deck”. Unknown routes are not a deliberate HTTP 404 page with a way back.
The required `public/404.html` is absent and `navigationFallback` rewrites the
unknown paths to `/index.html`.

### 10. Medium — required site metadata and index files are missing

The home document lacks a canonical URL, Open Graph tags, Twitter card, and
apple-touch icon. `public/sitemap.xml` is absent. The deployed CSP also lacks
the required response-header `frame-ancestors` directive. These gaps reduce
route identity, sharing, crawlability, and clickjacking protection.

### 11. Low — required review documentation is incomplete

`.factory/copy-audit.md` and `.factory/demo.md` are absent. The handoff still
lists the earlier defects but is not a current review record until this review
is appended. No worker `verify-url.sh` exists despite the accessibility review
requirement.

## User-path evidence

The normal authoring path works in a fresh desktop and phone browser: opening
the example produces “A wave gathers amplitude”, `a * sin(b * x) + c`, and two
realistic named intervals. The page had no console error during that flow and
there was no 390 px horizontal overflow. Invalid `mystery(x)` produces
“Unknown function”; an overlapping 2–4 second interval is rejected. These are
passing checks, not proof of the unlisted claims above.

The new-browser page initially made no cross-origin request before a license
action. Privacy and Terms return 200 with their own titles. The home page,
Privacy, and Terms have `lang`, one visible main landmark, and expected basic
semantics; axe found no serious or critical issue in the exercised desktop
editor. These checks do not remove the touch-target, claims, demo, or route
findings.

## Required fixes before another review

1. Provision and live-test the real Studio checkout.
2. Implement `/demo` as a separate `demo:` storage namespace with the persistent
   sample label, Reset demo, Start for real, and `.factory/demo.md`.
3. Add `.factory/claims.json` and one clean-demo observable test per claim;
   remove any claim that cannot be tested.
4. Correct exponent precedence and its unit/export tests.
5. Validate the full stored schema and offer safe recovery.
6. Make all touch controls at least 44 × 44 px, prevent stacked return dialogs,
   and repair the first-screen copy and structure.
7. Add proper `/demo` and 404 routes, metadata, sitemap, required headers, and
   the missing review records; then rerun the full review.
