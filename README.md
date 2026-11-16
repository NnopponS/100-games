# 100-games

**100 zero-dependency, single-file HTML5 arcade games with a unified web portal.**

[**Play Live on GitHub Pages →**](https://nnoppons.github.io/100-games/)

---

## Overview

`100-games` is a collection of 100 standalone browser games engineered without external game engines, bundlers, or runtime dependencies. Each game lives in its own self-contained HTML5 file (`game-001` through `game-100`) using native `<canvas>`, `requestAnimationFrame`, and procedural WebAudio synthesis, indexed by a fast, searchable arcade launcher (`index.html`).

## Architecture Highlights

- **Zero External Dependencies:** Every game runs directly from a single `.html` file with inline rendering, physics, collision detection, and state management.
- **60 FPS Canvas Loop:** Deterministic delta-time stepping, keyboard + touch/mouse input handling, and responsive viewport scaling.
- **Instant Portal Launcher:** Filter by genre, search by title, and launch any game in-place or in a dedicated tab.

## Running Locally

No build step is required. Serve the root directory with any static HTTP server:

```bash
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:8080`.
