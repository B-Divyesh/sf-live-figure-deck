# Demo sandbox

## Entry point

Open <https://live-figure-deck.sociobot.in/demo> or `/demo` in local preview.
It enters the sample directly without an account or setup step.

## Sample data

The sample is “A wave gathers amplitude.” It uses the formula
`a * sin(b * x) + c`, a six-second duration, 30 fps, and these intervals:

- “Reveal amplitude,” from 0 to 3 seconds.
- “Lift the baseline,” from 3.2 to 5.4 seconds.

The plot, formula label, parameter controls, interval map, playback, and both
export formats are ready on entry.

## Isolation and reset

Demo edits use only the local-storage key `demo:lfd:project:v1`. The normal
editor uses `lfd:project:v1`. Demo mode does not read or write that normal key.

“Reset demo” replaces the demo key with a new copy of the original sample.
“Start for real” removes the demo key before opening `/app`. It does not copy
sample edits into normal project storage.
