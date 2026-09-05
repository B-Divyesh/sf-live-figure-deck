# Repair 1 verification

Verified 5 September 2026 against implementation
`e348fb0a1f15bcd2b85415a02790d385de67401a` and the production URL.

## Result

PASS for the current free product. All prior product, accessibility, recovery,
demo, claims, routing, and metadata findings are resolved. The unprovisioned
billing product is no longer exposed as a purchase path; PNG export is free.

## Evidence summary

- Clean setup, unit, browser, build, and audit checks passed.
- All ten commands declared in `.factory/claims.json` passed individually.
- Fresh live desktop and phone contexts completed landing → demo → populated
  sample with no console errors or horizontal overflow.
- Live formula, HTML export, PNG export, demo reset/isolation, and offline
  reload checks passed.
- Axe reported zero violations on all public page types.
- Live Lighthouse scored 100 in performance, accessibility, best practices,
  and SEO on both `/` and `/demo`.
- Both `/404` and a random missing URL returned HTTP 404 with the designed
  not-found document.
- Local and live hashes matched for `index.html` and `sw.js` after the final
  deployment.

Detailed machine artifacts and screenshots are under
`/work/.evidence/live-figure-deck-repair-1/`.
