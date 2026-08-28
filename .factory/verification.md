# Live Figure Deck — independent verification

## Verdict: FAIL

Verified on 2026-08-28 UTC.

- Candidate: `6b0cc6a0343abd145a3284cc30fa1e4ca6ce1d4b`
- Candidate tree: `9a22ec49a7c83a6ad06b43c41a6644abb2319b26`
- Production URL: <https://live-figure-deck.sociobot.in/>
- Environment: Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`,
  Chrome for Testing `145.0.7632.6`

The free editor and both export implementations work, and the live static files
are byte-for-byte the candidate build. The release nevertheless fails because
the advertised production purchase route is not provisioned: a user cannot buy
the Studio feature that the product offers.

## Defects

### High — production Studio checkout is unavailable

The editor advertises “Buy Studio for $29” and links to the required Sociobot
billing route, but that production route returns HTTP 404:

```text
GET https://api.sociobot.in/api/v1/products/live-figure-deck/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

Impact: a new user cannot purchase a license and therefore cannot unlock the
paid PNG frame-pack workflow. The verify endpoint itself is reachable and an
invalid-token request correctly returns `200 {"valid":false,"reason":"invalid"}`.
An intercepted valid verdict was used only to test the otherwise-working frame
export implementation; it does not make the real purchase path usable.

### Medium — exponent precedence reverses a conventional scientific formula

The parser treats unary minus as binding more tightly than exponentiation.
Entering `-x^2` plots `(-x)^2`, not the conventional `-(x^2)`. With x limited
to 1…2, the live chart alternative reported sampled y values 1.00…4.00; the
expected values are -4.00…-1.00. The repository unit test also explicitly
expects `-x^2` at x=3 to equal positive 9.

Impact: a valid, commonplace equation produces the opposite parabola and can
misstate a scientific figure. Parenthesizing as `-(x^2)` is a workaround.

### Medium — an incomplete persisted project can crash editor initialization

Injecting a version-1 local project with the normal scalar fields and
`parameters: {}` passes `safeProject`, then reload raises:

```text
Cannot read properties of undefined (reading 'label')
```

The welcome dialog does not open because the storage key exists, and parameter
controls remain empty. Impact is limited to corrupt, manually altered, or
future-incompatible local storage, but recovery currently requires clearing
site data rather than using an in-product error/recovery state.

### Medium — multiple mobile interactive targets are below 44 × 44 CSS px

At a 390 × 844 touch viewport, computed boxes included:

- License control: 29 × 44 px
- Interval blocks: 172 × 40 px and 126 × 40 px
- Privacy link: 43 × 14 px
- Terms link: 35 × 14 px
- Brand/home link: 23 × 44 px

This violates the supplied mobile accessibility baseline even though axe does
not flag these targets.

### Low — returned-license and first-run dialogs are stacked

On a new browser opened with `?license=qa-valid`, both `welcome-dialog` and
`license-dialog` are modal/open. The welcome dialog is on top and intercepts
the license dialog. Choosing “Start blank” or “Open example” reveals the
already-verified Studio dialog, and the token has already been stripped from
the URL, so the flow is recoverable but confusing immediately after purchase.

## Build and repository gates

Started from a clean checkout exactly at the candidate SHA.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 59 packages installed; 0 vulnerabilities |
| `npm test` | PASS — 5 Vitest tests; 11 Playwright tests passed; 1 intentional desktop skip |
| `npm run build` | PASS — includes `tsc --noEmit`; Vite 7.3.6 emitted `dist/` |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm audit` | PASS — 0 vulnerabilities |
| Lint | Not available — no lint script/configuration in the repository |

Production output was 39,898 bytes JS, 18,832 bytes main CSS, zero font bytes,
and a 41,954-byte WebP. These are below the 200 KB JS, 50 KB CSS, 120 KB font,
and 300 KB mobile image budgets.

## Candidate/deployment identity

The live document names the same Vite assets as the local build. SHA-256 values
matched byte-for-byte for all material deploy artifacts tested:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `0ad550183953ecd3e83b3f4669a9aafc2a8be7b60ca6a5e9a4d9a51b65478622` |
| `assets/main-D0voXLti.js` | `1927a4ce21d96e4f1e0e1d53c34a14f147024de58aa6e64afd9da6d51caf20ea` |
| `assets/main-Dj4fUtd_.css` | `92528f05a35242efbd3f641e47d54221375ea59812acb30d5fff85401d9d24fc` |
| `assets/signal-observatory-v1.webp` | `5163da83b7b61f2c9f4951170970021ea59d01a3bf8518840cb467e694c344fa` |
| `sw.js` | `7e2c50ce06892c017d6207a8e544dcf8c1efd00c4a48ca636fb55f903ddb8c5a` |
| `privacy/index.html` | `a56876bebd0719c53ecb05686262e2e592593096e7647c6265bfb6ed5635e4a4` |
| `terms/index.html` | `b1b3092bfc559141d8a1ab01c98d8c592ff9b9ced9fcae58032c39f20ca0adb9` |

The production failure is therefore billing provisioning, not a stale static
deployment.

## End-to-end product evidence

Fresh browser profiles were exercised against the live URL at 1440 × 1000 and
390 × 844.

- Onboarding into both example and blank projects worked.
- A representative equation (`a * cos(b * x) + c`) rendered and recovered
  after both an unknown-function error and a no-finite-values state.
- Duration and frame-rate inputs clamped 0 to 1 and 61 to 60.
- A same-parameter 2…4 s interval correctly reported overlap with the existing
  0…3 s interval; switching it to parameter b saved successfully.
- Unsafe expression input (`window.alert(1)`) was rejected, and export remained
  blocked until the equation was repaired.
- Playback, pause, single-frame arrows, Space, `P`, Escape, presentation focus
  entry/return, local autosave, and reload persistence worked.
- Two consecutive HTML exports of the same project were byte-identical
  (`c4c3cbe28fbed8d7d9f61bf94abf6131356142ec31a24addf584bc929f2302ac`).
  The 5,342-byte file had no HTTP(S) dependency, opened directly from
  `file://`, drew successfully, stepped one frame to 0.03 s, and
  played/paused without a page error.
- With a mocked valid billing verdict, the 1 s / 1 fps Studio export produced a
  valid 193,461-byte ZIP containing `frame-00000.png`, `frame-00001.png`, and a
  manifest with the correct frame count, duration, rate, and FFmpeg command.
  `unzip -t` reported no errors.
- A real invalid license was rejected, the UI returned to Free, and reload did
  not repeat verification inside the one-day cache window.
- A returned license was removed from the address bar before continuing.

## Accessibility and responsive checks

- Main editor, Privacy, and Terms: zero axe violations of any impact in the
  tested Chromium states; therefore zero serious/critical findings.
- Correct `lang`, title, one `h1`, one `main`, labeled controls, canvas text
  alternative, and image alt text were present.
- Keyboard-only smoke test reached the skip link first with a visible 3 px
  coral outline, activated it, operated playback and frame stepping, focused
  the interval name on dialog entry, and returned focus to the interval add
  button on Escape. No keyboard trap was observed.
- At 390 px, document/client widths were both 390 px with no horizontal
  overflow. The stage-first mobile layout remained usable.
- Under `prefers-reduced-motion: reduce`, tested button and toast transitions
  computed to `0.00001s`; authored figure playback remained paused by default
  and user-controlled.
- Visual inspection at 1440 × 1000 and 390 × 844 found a coherent,
  product-specific signal-console hierarchy and legible canvas. The mobile
  touch-target defect above remains.

## Privacy, network, PWA, and response policy

- A fresh unlicensed editor visit made no cross-origin request and produced no
  console error, page error, or failed request. Static/code review found no
  analytics, tracker, CDN font/script, cookie write, beacon, or project upload.
- The only application cross-origin fetch is license verification to the
  documented Sociobot endpoint; checkout is a normal link to that origin.
- Privacy and Terms are live, have correct document semantics, and each passed
  axe with no violations or browser errors.
- The service worker reached `activated`, controlled the page, used cache
  `live-figure-deck-v2`, completed `registration.update()` with no waiting
  worker, and served a successful offline reload with the offline banner.
- HTML responses use `Cache-Control: public, must-revalidate, max-age=30`;
  hashed assets use one-year immutable caching; `sw.js` uses `no-cache`.
- Production sends HSTS, `nosniff`, strict-origin referrer policy, camera/
  microphone/geolocation denial, and a CSP limited to self plus the Sociobot
  billing API (with inline/blob allowances needed by the shipped design/export
  behavior).

## Lighthouse and runtime budgets

Three Lighthouse 12.8.2 mobile runs against production scored:

| Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 87 | 100 | 100 | 100 | 1.1 s | 1.4 s | 510 ms | 0 |
| 2 | 95 | 100 | 100 | 100 | 0.94 s | 1.24 s | 266 ms | 0 |
| 3 | 90 | 100 | 100 | 100 | 0.98 s | 1.28 s | 398 ms | 0 |

Median performance is 90, meeting the stated threshold, though the 87–95
variance and main-thread blocking should be watched. Lighthouse transferred
63,621 bytes across seven first-load requests, with no third-party request.

## Release decision

Do not approve this candidate for completion. Provision and exercise the real
production checkout first. Fixing the formula precedence and mobile target
sizes is also required to satisfy the scientific-use and accessibility
contracts; persisted-state recovery should be hardened before relying on local
storage as the only project store.
