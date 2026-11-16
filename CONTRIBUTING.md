# Contributing

Contributions, bug fixes, new game artwork motifs, and polish improvements are welcome!

## Guidelines

1. **Zero External Dependencies:** Keep games self-contained (inline HTML/CSS/JS) with no external CDN assets so every game works offline and on GitHub Pages.
2. **English UI:** All portal text, game titles, and in-game instructions should be in English.
3. **AAA Layer Compatibility:** Games load `../assets/aaa-arcade.js`. Keep score counters in clear elements (e.g. `id="score"`) so automatic combo chimes and particle popups trigger seamlessly.
4. **Verify Before PR:** Confirm zero console/syntax errors and clean rendering on both desktop and mobile viewports.
