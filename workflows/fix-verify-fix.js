export const meta = {
  name: 'fix-verify-fix',
  description: 'Two fixers on disjoint files in parallel, then static and UI verifiers, then one fixer for what the verifiers confirmed',
  whenToUse: 'A known list of bugs and review issues in one repo that splits cleanly into UI files and everything else',
  phases: [
    { title: 'Fix', detail: 'UI and rest in parallel, disjoint file ownership' },
    { title: 'Verify', detail: 'static checks and UI checks in parallel' },
    { title: 'Fix2', detail: 'only issues the verifiers found' },
  ],
}

// Pattern: pipeline with verify.
// 1. Split the work by FILE OWNERSHIP, not by topic, so two agents never edit
//    the same file. Each brief says which files the agent owns and that
//    another agent edits the rest right now.
// 2. Verifiers are separate agents that did not write the code. One runs the
//    test, lint and type tools and greps for forbidden content; the other
//    drives the real UI in a browser and looks at the screenshots.
// 3. A second fix pass runs only if the verifiers returned issues.
//
// args: { repo: '<repo path>', scratch: '<scratch dir>', uiBugs: '...', issuesFile: '<json path>' }

const R = args?.repo ?? '<repo>'
const S = args?.scratch ?? '<scratchpad>'
const STYLE = `Rules: English in code, comments and docs. No emoji or decorative symbols anywhere (status in words). No em dash or en dash, hyphen-minus only. Active voice, no marketing words.
Do NOT commit, push or deploy. Do not touch any server. Do not revert other uncommitted changes in the working tree: they are intentional (git diff shows them).
No paid API calls: do not submit new queries to the app.`

const CRIT = { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: {
  severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, file: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
}, required: ['severity', 'file', 'problem', 'fix'] } } }, required: ['issues'] }

phase('Fix')
const [ui, rest] = await parallel([
  () => agent(`${STYLE}

You own ONLY these files: ${R}/web/static/*, ${R}/web/app.py. Another agent edits every other file at the same time.
Fix these UI bugs:
${args?.uiBugs ?? '1. <bug, file, function, exact cause if known>\n2. <bug>'}
Verify locally: start the app (see README "Run locally"), open the affected pages with Playwright, click the controls you fixed, save screenshots under ${S}/verify-ui/ and look at them.
Report per bug: fixed / not fixed, and how you verified it.`, { label: 'fix:ui', phase: 'Fix' }),

  () => agent(`${STYLE}

You own every file in ${R} EXCEPT web/static/* and web/app.py (another agent edits those now).
Apply the review issues in ${args?.issuesFile ?? `${S}/issues.json`}. Some were fixed in an earlier pass: check the current file first; if already fixed, skip and say so.
After the edits run the project checks (tests without live network, linter, formatter check, type checker, bash -n on shell scripts) and fix anything you broke.
Report per issue: fixed / skipped, with a reason.`, { label: 'fix:rest', phase: 'Fix' }),
])

phase('Verify')
const checks = await parallel([
  () => agent(`${STYLE}

Verify ${R} after two parallel fix passes. Run the tests, linter, formatter check and type checker.
Then scan every tracked and new file (git ls-files plus git status) for: emoji and pictographs, U+2013 and U+2014, box-drawing characters, absolute home paths, server IPs, hostnames and ssh aliases, personal emails.
Report real issues only, each with an exact fix.`, { label: 'verify:static', phase: 'Verify', schema: CRIT }),

  () => agent(`${STYLE}

UI verification of ${R}/web after the fix pass. Start the app locally. With Playwright open the main pages at 1440x900 and 390x844.
Check every item from the UI bug list, console errors, overlapping labels, horizontal scroll. Save screenshots to ${S}/verify/ and look at every one. Stop the server when done.
Report real issues only, each with an exact fix.`, { label: 'verify:ui', phase: 'Verify', schema: CRIT }),
])

const issues = checks.filter(Boolean).flatMap(c => c.issues)
log(`${issues.length} issues after verify`)

let fix2 = 'none'
if (issues.length) {
  phase('Fix2')
  fix2 = await agent(`${STYLE}

Fix these verified issues in ${R} (any file). Re-run the tests, linter, formatter check and type checker; if UI files changed, re-check those items with Playwright and look at the screenshots.
Report per issue.
Issues: ${JSON.stringify(issues)}`, { label: 'fix2', phase: 'Fix2' })
}
return { ui, rest, issues, fix2 }
