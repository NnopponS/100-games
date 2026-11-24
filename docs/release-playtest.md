# Arcade 100: what the first release missed

## Abstract

Arcade 100 started as a practical question: can an orchestrator and subagents produce 100 small browser games and assemble them into one maintainable project? The follow-up exposed the harder part: a browser can start a game successfully while the game still feels repetitive, looks wrong on a phone, or keeps playing sound when the player leaves. This note separates implementation evidence from usability evidence.

## Study materials

- [Historical multi-agent report](../AI_EXPERIMENT_REPORT.md): original orchestration notes, rate-limit observations, and snapshots. It is not a randomized comparison between models.
- [Controlled multi-agent pilot](agent-benchmark.md): historical Git audit and a paired mechanics experiment with matched checks.
- [Game-level feature matrix](game-feature-matrix.csv): one source-level enhancement for every numbered title, the game and its genre, and any title-specific checks supplied by the implementation.
- [Published playtest](https://nnoppons.github.io/100-games/report/): exact release hash and CI-generated observations. These are scripted tests, not audience analytics.

The first [gated release](https://github.com/NnopponS/100-games/actions/runs/45447011615) verified 100 game launches, basic interactions, trial starts and representative mobile/medal persistence. It did **not** measure the brightness of the game stage, audio ownership during Android navigation, or more than one simple interaction for most games. Feedback from an Android browser exposed those blind spots. A screenshot also showed older portal chrome; an old cached document is plausible, but the exact cache behavior on that phone was not recorded. The old game art itself was dark regardless of caching.

## Engineering changes and tests

| Surface | Previous behavior or blind spot | Change | Reproducible check |
|---|---|---|---|
| Portal and iframe | A light launcher could still open a dark game; older HTML could reuse previous asset URLs. | Forced light visual scheme for the portal and each game stage, a fresh Daylight entry, versioned shared assets, and a compact mobile player. | Under a dark browser preference, check computed light scheme and bright document base at a 390 × 844 touch viewport. Open a warm relaunch and a cold game deep link. |
| Native game visuals | Game stages had separate styles, including dark DOM panels and Canvas stage fills. | Shared stage treatment adapts document surfaces and background drawing without applying a whole-page invert filter. Distinct stage sprites and marks stay legible. | Inspect the actual stage instead of just the launcher. Use per-title layout checks and representative visual fixtures. |
| Audio ownership | Per-title music loops and native audio contexts had no shared exit/back lifecycle. A successful launch test could not detect that. | Each iframe owns and disposes its native Web Audio contexts and media. Hiding suspends playback, returning requires a real gesture, and navigation retires the old frame before attaching the next one. | Start two actual Web Audio contexts, background/restore, confirm the old contexts close on Back, then verify that a fresh iframe remains silent on relaunch. Unit coverage also exercises standalone page transitions and late callbacks. |
| Game depth | Medal Trial changed the goal and clock, not the individual game logic. | Arcade+ changes native rules title by title and is the primary library entry. Classic and Medal Trial remain separately selectable on original routes. | Compare the relevant action/result in Classic and Arcade+, and inspect the feature table. |
| Misleading visibility | An error-free DOM can still render inactive moles in the wrong place. | Reset/hide dormant targets and use tighter portrait placement; add an armored target type. | Reopen Whack-a-Mole on a phone-size view, distinguish active from dormant targets, and verify the armor needs two hits. |
| Release pipeline | Launch regressions and an unstable test originally failed on staging. | Native regressions, classic/trial launch tests and Daylight tests gate every production Pages deployment. | Verify that only a green run packages an exact revision. No account notification settings are changed. |

## Examples across genres

- **Whack-a-Mole:** some Arcade+ moles take two hits; inactive targets are hidden physically as well as being noninteractive.
- **Checkers:** Arcade+ uncrowned pieces can capture backward, opening new forced-capture paths.
- **Bubble Shooter:** Arcade+ lets the player swap the next bubble once per shot.
- **Air Hockey:** the computer can predict a bank shot off the side walls, rather than track only the puck position.
- **Pixel Painter:** native tools create outcomes in the canvas rather than incrementing a generic challenge score.

## Reproduce

```sh
npm install --no-save --no-package-lock playwright@1.62.1
npx playwright install --with-deps --only-shell chromium
node tests/native-modes.cjs
node tests/laser.cjs
node tests/audio-lifecycle.cjs
node tests/browser-smoke.cjs
ARCADE_PLAYTEST_REPORT=/tmp/arcade-playtest-evidence.json node tests/daylight-browser.cjs
```

The report includes the specific browser revision, emulated viewport, tested route count and release hash when run in GitHub Actions. Reported route passes do not represent full playthroughs or completion rates.

## Limitations and next experiment

The phone tests use real Chromium with a touch viewport and dark preference, not a physical Android Brave device. Actual browsers differ in gesture policies, back-stack behavior, hardware and WebAudio latency. Some games can still be hard to learn or may have untested late-game states. The feature table describes mechanisms, not whether players prefer them. This project collects no visitor telemetry.

The historical build pooled different agents, models, prompts, and assignments. It cannot identify which model caused a particular result. For a defensible comparison, keep each game brief and test oracle fixed, run matched parallel and serial batches, record attempt/runtime/pass/failure data, and keep both successful and failed outputs. Report raw counts before drawing a throughput conclusion; isolate browser verification from subjective fun ratings.
