# Cascadia Rolling Counter

A small web page that replaces the paper tally sheet for Cascadia: Rolling Hills and Cascadia: Rolling Rivers.

Six counters (bear, elk, fox, hawk, salmon, pinecone), each with `-3 -2 -1` and `+1 +2 +3` buttons. The `+` button in the header toggles a second line with `-6 -5 -4` and `+4 +5 +6`. Counts are saved in the browser, so every player tracks their own on their own device and a refresh does not lose them. Each animal starts at 1 and the pinecone at 2, as on the tally sheet; `Reset` returns to those values for a new game.

`History` lists every change since the last reset, newest first. Quick taps on the same counter are logged as one entry (`+3 +3 +1` is `+7`).

## Running

It is a static site with no build step: open `index.html`, or serve the folder with any static host (for example GitHub Pages from the repository root).

The icons in `icons/` were extracted from the official Cascadia Rolling tally sheet PDF.
