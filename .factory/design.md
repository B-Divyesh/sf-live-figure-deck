# Live Figure Deck — visual thesis

## Direction: the signal console

Live Figure Deck uses a **pixel/demoscene language** shaped around the moment a
scientist turns an equation into a moving argument. It should feel like a
compact instrument: a dark phosphor display, a strict 8 px grid, one-pixel
rules, stepped corners, and bright traces. The product is intentionally
single-mode. A dark canvas keeps projected curves luminous, reduces glare in
lecture rooms, and makes authoring and presenting feel continuous.

This is not retro decoration. Pixel ticks expose the time grid, interval blocks
make duration semantics visible, and a persistent frame counter emphasizes that
exports are deterministic. Chrome is restrained so the figure remains the
brightest object.

## Palette

All colors are CSS tokens and have been checked against their intended dark
surfaces.

- `ink-950` `#080b14`: page and presentation background.
- `ink-900` `#0e1421`: primary work surface.
- `ink-850` `#151d2c`: raised controls and selected tracks.
- `grid` `#293349`: dividers and plot grid (non-textual).
- `paper` `#f4f7e9`: primary text, 17.7:1 on `ink-950`.
- `mist` `#b8c3bd`: supporting text, 10.3:1 on `ink-950`.
- `signal` `#81f7c1`: primary action and animated curve, 15.2:1 on `ink-950`;
  dark `#08251c` is used as its contrast text.
- `pulse` `#ff8f70`: playhead, emphasis, and destructive affordances, 8.2:1.
- `ion` `#8cb4ff`: formulas and secondary traces, 9.8:1.
- `warning` `#ffd166`, `danger` `#ff7e9d`, `success` `#81f7c1`.

Color is never the only state marker: selected intervals also use a stepped
outline, errors use an icon and text, and paid status always has a text label.

## Type

- Display and data: **IBM Plex Mono** when available locally, falling back to
  `ui-monospace`, `SFMono-Regular`, `Consolas`, monospace. The square rhythm
  fits equations, frames, and the demoscene system voice. No runtime font is
  downloaded.
- Reading and controls: `Inter`, `Avenir Next`, `Segoe UI`, system sans-serif.
  System faces keep the initial payload tiny and remain legible across teaching
  devices.
- Scale: 12 / 14 / 16 / 20 / 28 / 40 px. Body is 16 px minimum; tiny 12 px
  text is limited to non-essential uppercase machine labels.
- Numeric values use tabular figures. Long copy is capped at 68 characters.

## Spacing and shape

- Base rhythm: 4 px; primary spacing steps are 8, 12, 16, 24, 32, and 48 px.
- Controls are at least 44 px high and adjacent targets have at least 8 px gap.
- Corners are clipped with small `clip-path` steps or kept at 2 px; there are
  no soft pill cards. One-pixel borders and a four-pixel offset shadow create
  depth without imitating a generic dashboard.
- Desktop: 272 px inspector / flexible stage / 292 px timeline. Phone: stage
  first, then controls, then timeline; secondary explanatory copy is removed.

## Interaction grammar

- Mint means “make or play”; coral marks “where time is now”; blue marks
  authored mathematical information.
- Buttons depress by 2 px. Panels do not float arbitrarily: drawers enter from
  the edge they belong to, interval handles stay anchored to their track.
- Sliders update the plot immediately. Keyboard shortcuts: Space plays/pauses,
  arrows step one frame, and `P` opens presentation mode outside text fields.
- Every mutation is followed by a short status message in an ARIA live region.
- Errors appear beside the relevant equation and preserve the last valid plot.

## Motion policy

- UI transitions last 160–220 ms and animate only opacity or transform.
- The authored figure animation is explicitly controlled by Play/Pause and
  never begins automatically. A linear playhead makes frame progression
  intelligible; parameter interpolation follows named interval easing.
- Under `prefers-reduced-motion`, UI movement becomes an instant opacity
  change. Authored playback remains available because it is the core tool, but
  the initial preference is pause and no decorative animation runs.
- Nothing flashes. Presentation controls fade only after user inactivity and
  return on pointer or keyboard input.

## Asset plan and provenance

The main canvas and all icons are hand-authored SVG/Canvas/CSS at runtime. One
original raster illustration, `assets/src/signal-observatory.png`, anchors the
welcome state and social preview. It depicts an impossible pixel-art plotting
observatory—an honest metaphor for building one live figure, not a screenshot
or claim about product capability.

### Prompt sheet

**Subject:** a compact scientific signal observatory with one luminous sine
curve passing through a floating coordinate grid, tiny interval markers and a
single orange playhead, no people. **World/materials:** 1990s demoscene pixel
art, dark navy instrument panels, crisp one-pixel details, subtle dithering,
matte metal and phosphor glass. **Light/lens:** orthographic wide view, high
contrast mint phosphor glow, restrained coral indicator lights, deep shadow.
**Palette words:** midnight ink, paper white, ion blue, signal mint, pulse
coral. **Negative list:** no text, no letters, no watermark, no logos, no
brands, no gradients as the main device, no photorealism, no people, no UI
mockup, no illegible pseudo-interface.

Generated with the factory Azure OpenAI image deployment (`factory-image`) on
2026-08-28. The output is original to this product. The exact derived prompt is
stored in `assets/src/signal-observatory.json`. The 768 × 512 shipping WebP is
42 KB, comfortably below the 300 KB image budget.

The 1200 × 630 social image in
`public/assets/live-figure-deck-social.webp` is a center crop of that original
generated image. The 180 × 180 Apple touch icon is a hand-drawn raster version
of the repository’s original SVG plot mark. Both derivatives were made on
2026-09-05 and contain no third-party artwork, text, logos, or trademarks.
