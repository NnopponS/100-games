# Arcade 100

**100 games, one bright arcade. No install or sign-in.**

[Open the arcade →](https://nnoppons.github.io/100-games/)

## Pick a game

Search by name, browse by genre, save favorites, or resume from your recent games. The **Daily Challenge** rotates on a UTC calendar and keeps a separate medal record on your device.

All 100 games offer **Classic** and **Medal Trial**. Choose Classic for original play, or enter Medal Trial for a fresh run with a time budget and three game-specific medal targets. Switch modes in the arcade player or via **Modes** on a standalone game page. The mission measures actual play, from safe squares uncovered in Minesweeper to connected pipes, darts checkout progress, and objects pocketed in Pool. The trial doesn't overwrite the game's own score or save.

### New signature modes

- **Snake:** solid-wall Classic, edge-wrapping Wraparound, and Maze Rush with barriers. Variant runs add golden apples and separate records.
- **Breakout:** Brick Lab adds armored formations, clearer level progression, paddle widening, and a one-use ball shield. Classic stays separate.
- **2048:** Daily Sprint uses the same seeded layout sequence on the same UTC date and has a 120-move limit. Practice offers three undos without touching ranked records.

## Run locally

No build step. Every game still runs at its original numbered directory.

```sh
python3 -m http.server 8080
# Open http://localhost:8080
node tests/native-modes.cjs
```

The shared HUD and optional missions are in `assets/aaa-arcade.js` and `assets/missions.js`. The game pages provide read-only mission adapters that read their own game state. LocalStorage is the only persistence layer; no leaderboard service or accounts are required. Some games retain their original optional CDN-backed 3D decoration.

To run the browser suite, install Playwright, install its Chromium browser, and execute `node tests/browser-smoke.cjs`. The **Verify and deploy arcade** workflow runs native regressions and exercises all 100 games in Chromium before a production Pages upload. It automatically checks pull requests to `main` and intentional staging branches under `arcade-release/`; routine workspace branches do not start a Pages deployment.
