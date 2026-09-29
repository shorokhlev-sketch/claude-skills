---
name: orchestrator-loop
description: Run a long, multi-stage build as a loop where the main session orchestrates subagents instead of writing code itself. Use when a task spans more than one file or more than one session, when the user says "start the loop", "continue the loop", "open LOOP.md", or asks to hand work to Sonnet/Opus agents and accept it.
---

# Orchestrator loop

The main session holds the contract, the acceptance and the integration. Subagents write the code. State lives in a `LOOP.md` file in the project root, so any session can continue after `/clear`.

## Start

1. If `LOOP.md` exists: read RULES, State, Questions and the tail of Journal, then go to Iteration.
2. If not: create it from `harness/LOOP-TEMPLATE.md` in this package. Fill RULES first, then the stage table from the spec. Commit it.

## Iteration

1. Pick the next stage. Write its contract: files, interfaces, one-line acceptance criterion.
2. Split it by file ownership. Brief each agent with `harness/AGENT-BRIEF-TEMPLATE.md`. Cheaper model for typical pieces, stronger model for hard logic. Run independent pieces in parallel.
3. Accept with your own eyes: read the diff, run the tests, curl the endpoints, open the UI. An agent's "it works" does not count.
4. A failed piece goes to a fresh agent with the fix written into the brief.
5. Commit, snapshot the target, deploy, check health.
6. Update State and Journal in `LOOP.md`. Commit.
7. If the stage needs a manual check in a third-party app, write the checklist under "Waiting for the owner" and notify. Continue with stages that do not depend on it.

## Stop and ask

- A secret or a decision is missing.
- The same thing failed three times.
- Something contradicts the spec.
- A deploy breaks the target (health not 200 after 30 s).

## Enforcement

- NEVER write the feature code yourself when a brief to a subagent would do. Your job is design, briefs, acceptance and integration.
- NEVER accept on an agent's report alone.
- NEVER expand scope; unknowns go to "Questions".
- ALWAYS commit before overwriting anything, and snapshot before every deploy.
- ALWAYS write the loop's hard rules into each agent brief; agents do not inherit them.
- For multi-agent patterns (judge panel, critic/fix loop, adversarial verify) see `workflows/` in this package.
