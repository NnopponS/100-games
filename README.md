# Arcade 100

**A multi-agent software experiment you can play.**

[Play the Daylight arcade →](https://nnoppons.github.io/100-games/?edition=daylight) · [See the engineering report →](https://nnoppons.github.io/100-games/report/) · [Browse the 100-game feature matrix →](docs/game-feature-matrix.csv)

The original question wasn’t “can we make another game site?” It was whether an orchestrator could use subagents to ship **100 independent browser games** without losing track of the integration, testing and release work. The arcade is the playable result. The reports show what the workflow proved, what it didn’t, and what changed when a person actually played it on a phone.

## Play three ways

| Mode | What you get |
|---|---|
| **Arcade+** | The default from the library. Every title has its own native mechanics, controls or replay twist. Try the armored moles in Whack-a-Mole, backward captures in Checkers, or a one-shot bubble swap. |
| **Classic** | Original-style rules and separately addressable game links. Existing bare game URLs still work. |
| **Medal Trial** | A timed, game-state objective with Bronze/Silver/Gold tiers. Daily rotates on UTC and stores progress on your device. |

The Daylight design applies inside game pages as well as to the launcher. You can search, filter, save favorites, resume your recent games, and use a compact player at phone size. Fullscreen uses the browser’s native mode when available, otherwise it hides the arcade controls and expands the board in the browser without restarting the game. Audio is owned by each game: leaving or switching disposes of the old frame; a hidden game pauses sound and needs new input to resume.

## What the project measures

- [Historical agent experiment](AI_EXPERIMENT_REPORT.md): original concurrency, orchestration and model observations. These notes are descriptive, not a controlled model comparison.
- [Controlled mechanics pilot](docs/agent-benchmark.md): matched tasks, preregistered checks, worker timing and raw outputs. Both arms passed 20/20 in each of two matched task pairs. These runs do not establish general speed or cost differences.
- [Engineering playtest](docs/release-playtest.md): why the first 100/100 launch pass missed mobile layout, audio ownership, and limited gameplay depth.
- [Live report](https://nnoppons.github.io/100-games/report/): CI evidence for the published commit, with local test methodology and explicit limits. It is **not** real-world visitor analytics.

## Run and verify

Games are separate static entry points. Shared modules own the portal, Daylight styling, audio lifecycle and trials. No account or server is needed to play; some original 3D decoration can still use a CDN.

```sh
python3 -m http.server 8080
# Visit http://localhost:8080
npm install --no-save --no-package-lock playwright@1.62.1
npx playwright install --with-deps --only-shell chromium
node tests/native-modes.cjs
node tests/laser.cjs
node tests/audio-lifecycle.cjs
node tests/browser-smoke.cjs
node tests/daylight-browser.cjs
```

GitHub Pages publishes only after native regressions and browser verification pass on the same revision. PRs and explicit `arcade-release/` branches run checks without deploying. Nothing sends playing activity or scores to a server.
