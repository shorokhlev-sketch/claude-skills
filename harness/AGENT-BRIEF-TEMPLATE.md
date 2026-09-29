# Agent brief template

A subagent starts with no memory of the conversation. The brief is all it knows. Write it so that a new engineer could finish the task without asking a question.

Copy the block below, fill every field, delete nothing. If a field does not apply, write "none".

```text
CONTEXT
<Two sentences: what the project is and what this piece is for.>
Spec: <path to CLAUDE.md or spec file> section <name>.

YOU OWN
<exact file paths or globs>
Another agent edits <other paths> at the same time. Do not touch them.
Do not revert uncommitted changes you did not make: they are intentional.

TASK
1. <concrete change, with file and function names>
2. <concrete change>
3. <concrete change>

RULES
- <the 2 to 4 rules that matter for this task, copied in full, e.g.
  no emoji anywhere, status in words;
  no explainer copy next to controls, list every text you removed;
  English in code and comments;
  one commit per logical change with "what and why" / or: do not commit, the orchestrator commits>
- Do not deploy. Do not push. No paid API calls. No writes to remote servers.

ACCEPTANCE (one line)
<The single observable condition that means done, e.g.
"GET /api/items?color=red returns only red items and pytest passes">

VERIFY
Run and paste the tail of the output:
  <test command>
  <lint or build command>
  <curl or browser check, with the URL and what to look for>
Open your own result (screenshot, file, response) and look at it before reporting.

REPORT
Per task item: fixed / skipped (with reason) / blocked (with what is missing).
Evidence: command + output tail, file:line, or screenshot path.
Do not write "all good" without evidence.

STOP AND REPORT WHEN
- a secret or a decision is missing;
- the same step failed three times;
- the task contradicts the spec or the files you own.
```

## Good and bad brief lines

| Bad | Good |
|---|---|
| "Fix the UI bugs." | "In `web/static/index.html`, `enrichAnswer()` reads the loop variable after the loop; capture `const id = m[0]` inside the loop." |
| "Make sure it works." | "Run `uv run pytest -q` and paste the last 3 lines." |
| "Clean up the text." | "Replace em dashes in user-visible strings in `index.html` with a colon, comma or period. List every string you changed." |
| "Check the page looks right." | "Screenshot at 390x844 and 1440x900, open both images, report any horizontal scroll or overlapping labels." |
| "Use your judgment on scope." | "Anything outside the files you own goes into the report as a question." |

## Structured output

When the orchestrator needs to merge results from several agents, ask for a schema instead of prose. A common one for critics:

```json
{
  "issues": [
    { "severity": "blocker | major | minor", "file": "path", "problem": "what is wrong", "fix": "exact change" }
  ]
}
```

Filter `minor` issues out after the first round so the fix loop converges.
