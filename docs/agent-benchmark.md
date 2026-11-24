# Arcade 100: historical evidence and a small multi-agent pilot

The first 100 games were built as a multi-agent experiment. The [original experiment report](../AI_EXPERIMENT_REPORT.md) is preserved as the author’s contemporaneous account. This follow-up separates what can be recovered from Git from what a new, controlled benchmark actually measured. The [release playtest](release-playtest.md) is separate: it reports playable behavior for the product release rather than agent performance.

## 1. What the historical repository proves

| Public artifact | UTC commit time | Independently audited evidence |
| --- | --- | --- |
| [Initial 100-game commit](https://github.com/NnopponS/100-games/commit/7fc5a2af210cd7ce654ba013eb2cc997bf66212e) | 2026-11-16 19:47:20 | All game IDs 1–100 already present; 41,832 lines, 1,391,682 bytes across game HTML; 100 inline classic scripts parse; 22 games mention `AudioContext`, 36 mention `localStorage`. |
| [Shared runtime and original report](https://github.com/NnopponS/100-games/commit/2e8b6316ac0939bc66b8cc1e02af94e434438c0a) | 2026-11-16 20:17:28 | 100 game HTMLs; 42,036 lines, 1,397,395 bytes; 100 inline scripts parse; shared arcade runtime and report added. |
| [Next polish pass](https://github.com/NnopponS/100-games/commit/8843194ffb496b2f085936f4ce65e73abfc62425) | 2026-11-17 10:10:34 | 100 game HTMLs; 54,630 lines, 2,074,295 bytes; 112 inline scripts parse. |

The two November 16 commits are **30m 08s apart**. That is a commit interval *after* the games already existed in Git, not generation duration, worker throughput, or end-to-end run time. Counts are scoped to the 100 game `index.html` files and exclude portal/shared files. All parse checks used Node v24.22.3's `vm.Script`; they are not browser or gameplay tests. Static symbol counts are not proof of audible output or saved state. Method and full results: [Git audit script](benchmark/historical-audit.mjs), [observed JSON](benchmark/historical-evidence.json).

One historical defect is directly reproducible. A [VM probe](benchmark/historical-frame-probe.mjs) executes the native inline scripts for games 91–94 with a stub DOM, Canvas, and a visible animation queue. At the first commit, all four queued **zero** frames at load and after triggering the Start handler; at the shared-runtime commit, all four queued a frame and successfully scheduled successors after two callbacks. The diff adds a top-level `requestAnimationFrame(loop)` in each file. All 100 baseline scripts parsed, so syntax alone missed the missing scheduling hook. [Raw probe results](benchmark/historical-frame-results.json) are not full browser/playability evidence.

The report describes 10-, 25-, and 100-worker schedules, provider throttling, manual completion, and model-specific style. There are no per-task timestamps, dispatch logs, token totals, attempt manifests, or per-game model assignments in the audited public commits. These claims may describe the author’s run, but the historical repository cannot turn them into a controlled throughput curve or model comparison. No retrospective single-agent counterfactual is available.

## 2. New controlled mechanics pilot

See the [pre-run protocol](benchmark/PREREGISTRATION.md), [worker specification](benchmark/SPEC.md), [grader](benchmark/scoring/run.mjs), and [preregistration hashes](benchmark/preregister-sha256.txt). This is one paired observation: a 5×5 Lights Out engine and a deterministic 2048-style engine, inspired by games #32 and #09. Each worker got identical stubs and spec, with the same held-out grader and a 360-second arm cap. Assigned subtasks and artifact paths differed. Scope is two headless game cores, **not** two complete browser games or a recreation of 100-game development.

| Condition | Accepted games | Held-out checks | Elapsed wall time | Peak eligible workers | Observed worker-seconds |
| --- | ---: | ---: | ---: | ---: | ---: |
| One worker, two games | 2/2 | 20/20 | **120 s** | 1 | 120 s |
| Coordinator, one worker per game | 2/2 | 20/20 | **111 s** | 2 | 182 s |

Both conditions achieved identical held-out correctness. The parallel arm finished **9 seconds earlier** (7.5% shorter observed elapsed time), with **71 seconds of overlapping worker lifetimes**, yet used more aggregate observed worker time (182 vs. 120 seconds). These worker-seconds are clock intervals, not CPU/GPU time or model-token execution. Completion and dispatch are observed through coordination messages, so the 9-second difference should not be treated as a precise provider speed estimate. The coordinator made zero implementation interventions and did not rerun either arm. Both experiments finished before the cap. The parallel arm had a 13-second dispatch gap, counted in its wall time; waiting for free environment slots before the first dispatch is not counted.

**Interpretation.** Both approaches were sufficient for this work. Dividing the files made concurrent progress possible, but the elapsed-time benefit in this observation was modest relative to the extra worker allocation. This does not show that parallel orchestration is faster on average, more cost-efficient, or preferable for tightly coupled work.

[Timing log](benchmark/timing.tsv) · [Measurements, candidate hashes and acceptance totals](benchmark/measurements.json) · [Single grader results](benchmark/single-result.json) · [Parallel grader results](benchmark/multi-result.json) · [Stub control result: 0/20](benchmark/baseline-result.json)

### Reproduce the acceptance results

From the Arcade repository root (Node 22+; observed on Node v24.22.3):

```sh
cd docs/benchmark
sha256sum -c preregister-sha256.txt
node scoring/run.mjs single   # 20/20
node scoring/run.mjs multi    # 20/20
node scoring/run.mjs baseline # 0/20, expected nonzero exit
```

To audit the Git-based observations using a clone containing the public historical commits, run `node historical-audit.mjs ../..` and `node historical-frame-probe.mjs ../..` from the same directory. This reproduces deterministic grading and history probes, not the original model responses or elapsed times.

A failure here is an observed failed independent acceptance group, not a style judgment. Rates, if reported, divide fully accepted tasks by elapsed wall minutes. Timed arm starts are recorded before first dispatch; completion is reported when all assigned artifacts are present. Parallel overlap means overlapping admitted workers, not a measurement of instantaneous model-token execution. Two worker allocations are not an equal compute/token budget, and model version identifiers and token/cost totals were not exposed. One paired result cannot separate scheduling from task decomposition, account for stochastic variance, or support a scaling law.

## 3. Reversed-order follow-up

A separately [preregistered](benchmark/replication/PREREGISTRATION.md) follow-up used **two new mechanics**: Connect Four with win/draw detection and exact undo, and archery with analytic projectile timing and ring scoring. This time the **parallel condition ran first**. Both arms used the same stubs and [specification](benchmark/replication/SPEC.md) within this follow-up, with a frozen 20-check grader and the same 360 s wall limit. The work remained headless.

| Condition | Accepted games | Held-out checks | Elapsed wall time | Aggregate observed worker-seconds |
| --- | ---: | ---: | ---: | ---: |
| Parallel first, one worker per game | 2/2 | 20/20 | **84 s** | 154 s |
| Single second, one worker both games | 2/2 | 20/20 | **143 s** | 143 s |

Both arms passed every held-out check; neither required an implementation intervention or a rerun. The parallel arm finished 59 seconds earlier in this observation. Eligible worker lifetime overlap was 70 seconds. Worker time is the sum of observed dispatch-to-completion intervals, not compute or cost. Two completions in the parallel arm were received at the same observation boundary; timing through task messages is coarse enough that small differences should not be overinterpreted.

**Across the two pairs:** these are two descriptive observations with different games and reversed orders. They show that independently scored mechanics work can finish using either structure. They do not measure an average speedup, cost, or how results change at 10, 25 or 100 workers. Different tasks, unobserved compute usage, scheduling, self-testing time and model variability are still confounded. No winning-condition generalization or statistical test is warranted.

[Raw timings](benchmark/replication/timing.tsv) · [Measurements and candidate hashes](benchmark/replication/measurements.json) · [Parallel grader JSON](benchmark/replication/multi-result.json) · [Single grader JSON](benchmark/replication/single-result.json)

Reproduce grading from `docs/benchmark/replication`:

```sh
sha256sum -c preregister-sha256.txt
node scoring/run.mjs multi
node scoring/run.mjs single
node scoring/run.mjs baseline # 0/20, expected nonzero exit
```
