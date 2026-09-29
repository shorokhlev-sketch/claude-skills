# LOOP: <project name>

Entry point for every loop iteration and for the first turn after `/clear`. The spec lives in `CLAUDE.md` (version <N>, <date>). This file holds the rules, the state, the queue and the open questions.

Start a session with: "open LOOP.md and continue the loop".

## RULES (read first, every iteration)

1. **Backups at every stage.** Every change is its own git commit with "what and why". After each stage: `git push` and tag `stage-N`. Do not rewrite anything until the previous state is in git.
2. **Snapshot the staging server before every deploy.** Example: copy the database to `_bak/app.db.<timestamp>` and keep the last 10. Never run `DELETE` or `DROP` by hand on staging: the owner's test data lives there.
3. **Orchestrate, do not hand-code.** Subagents write the code. Roles by model:
   - cheaper model (for example Sonnet): typical pieces such as API routes, UI components, tests;
   - stronger model (for example Opus): hard logic such as multi-branch wizards, migrations, media streaming with Range requests;
   - main session: contract, acceptance, integration, deploy.
   Every brief has: a link to the spec section, the list of files the agent owns, a one-line acceptance criterion, and "run the tests and show the output". A failed agent is replaced by a fresh one with a corrected brief.
4. **Acceptance with my own eyes.** Read the diff, run the tests myself, curl the staging endpoints, open the UI in a browser. An agent's "it works" does not count.
5. **Do not expand scope.** Anything not in the spec goes to "Questions", not into the code.
6. **Manual checks in third-party apps belong to the owner.** When a stage depends on a messenger, a payment page or a device, write an exact checklist ("press this, you should see that"), send a push notification, and wait. Meanwhile continue with stages that do not depend on the check.
7. **Stop and ask when:**
   - a secret or a decision is missing (tokens, usernames, domain, the client's server);
   - the same thing failed three times in a row;
   - something contradicts the spec;
   - a deploy breaks staging (health is not 200 after 30 s).

## Iteration

1. Read RULES, "State", "Questions", and the tail of "Journal".
2. If the owner answered an open check, verify it (database or staging logs) and close the stage: push and tag.
3. Take the next queue item. Write the contract into a brief. Hand it to subagents, in parallel when the pieces touch different files.
4. Acceptance: read the diff, run the backend tests (`uv run pytest -q`), build the frontend (`npm run build`).
5. Commit, snapshot staging, deploy, check health, endpoints and UI.
6. Update "State" and "Journal" in this file and commit it.
7. If a manual check is needed, add a checklist to "Waiting for the owner" and send a push notification.

## State

Status values, in words: `done`, `in review`, `in progress`, `paused`, `replaced`.

| Stage | Status | Note |
|---|---|---|
| 1 <name> | done | tag `stage-1` |
| 2 <name> | in review | on staging (commit `<sha>`), waiting for the owner's check |
| 3 <name> | in progress | agent: stronger model, files `<paths>` |
| 4 <name> | paused | blocked by: <missing decision> |
| 5 <name> | replaced | old version kept under tag `<tag>` |

## Waiting for the owner (manual checks)

**Stage <N>, <feature>** (staging, commit `<sha>`):
1. <action> -> expected: <exact result>.
2. <action> -> expected: <result A> **or** <result B>. Both are fine; tell me which one you saw.
3. <negative case> -> expected: <refusal with a clear message>.

Send any text that reads wrong; I will fix it.

## Questions for the owner

- <secret or setting> -> where it goes (`ENV_NAME`), what staging uses meanwhile.
- <product decision> -> the options and what each one costs.

## Next session

What is done, what the first action is, which files and links to open first.

## Journal

Newest first. One line per event: date, what happened, commit or tag, lesson if any.

- <date>: stage <N> accepted with <K> fixes (<what>), deployed, tag `stage-N`.
- <date>: bug found by the owner: <symptom> -> root cause <cause> -> fix `<sha>`; new rule: <rule>.
- <date>: missed a snapshot before a small deploy; took it right after (no migrations ran).
- <date>: spec v<N>, LOOP.md created, loop started.
