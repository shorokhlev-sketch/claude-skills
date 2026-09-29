# Workflow examples

Five multi-agent workflow scripts for the Claude Code Workflow tool. They are generalized from scripts that ran on real projects on one day: triage of 12 repos, a 28-issue fix pass, a portfolio page built by a judge panel, and a batch of public snapshots of private repos. Paths, project names and client details are replaced with placeholders or `args`.

## Format

Each file starts with `export const meta = {...}` (a pure literal: name, description, whenToUse, phases). The body runs in an async context provided by the harness, with these globals: `agent()`, `parallel()`, `pipeline()`, `phase()`, `log()`, `args`. The body ends with a top-level `return`, which is valid only inside the harness. `tools/check.sh` wraps each body in an async function before running `node --check`.

Run one by passing the file content as `script`, or its path as `scriptPath`, with `args` for the placeholders.

## Patterns

| File | Pattern | What it shows |
|---|---|---|
| `triage-read-only.js` | Fan-out with a schema | One read-only agent per target, all answering the same JSON schema, so N results sort and compare in code. The rules block makes the run safe to start: no writes, no pushes, secrets masked. |
| `fix-verify-fix.js` | Pipeline with verify | Two fixers split by file ownership, not by topic. Two verifiers that did not write the code: one runs tests, lint, types and a forbidden-content grep; one drives the UI in Playwright and looks at screenshots. A second fix pass runs only on confirmed issues. |
| `judge-panel.js` | Judge panel | A spec, two builders with different directions that never see each other, three judges with different lenses (audience, design language, craft), scores summed in code, synthesis from the winner plus grafts from the loser, then a critic/fix loop. |
| `critic-fix-loop.js` | Critic/fix loop | Critics with one job each return a shared schema; one fixer applies the merged list; minor issues are dropped after round 1 so the loop converges; after the last fix one more critic pass runs without a fix, and the loop returns what it finds instead of claiming done. |
| `public-snapshot-leak-hunt.js` | Adversarial verify in a pipeline | Each repo goes Build, Verify, Fix on its own via `pipeline()`. The leak hunter is told the repo is about to go public and must find what must not; it runs gitleaks and its own greps and does not trust the builder. A second verifier follows the README literally and checks every number against the code. |

## Design choices that repeat

- **Schemas for anything the orchestrator merges.** Prose is for humans; merged results need fields.
- **Rules block first in every prompt.** Subagents do not inherit the conversation; the 2 to 4 rules that matter are pasted in full.
- **The verifier is never the author.** A separate agent, with a different job, reads the result.
- **Evidence over reports.** Verifiers run commands, open screenshots and curl links. "Looks good" is not an issue list.
- **Bounded loops that report leftovers.** `while (round < MAX_ROUNDS)`, a check-only critic pass after the last fix, and `return { rounds: history, remaining: last }` (critic-fix-loop.js), so a stop is visible and not silent.
- **Placeholders through `args`.** The same script runs on another project without editing the body.
