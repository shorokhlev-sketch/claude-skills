export const meta = {
  name: 'critic-fix-loop',
  description: 'Parallel critics with different jobs find issues, one fixer applies them, repeat up to N rounds until the critics return nothing',
  whenToUse: 'After a build or a rewrite, when "done" needs to mean that independent reviewers found nothing left',
  phases: [{ title: 'Verify', detail: 'critics then fixer, up to N rounds' }],
}

// Pattern: critic/fix loop.
// - Each critic has one job (content fidelity, visual QA, technical audit).
//   Critics never fix; the fixer never judges.
// - Critics return a schema, so issues from all critics merge in plain code.
// - Round 1 keeps every severity. Later rounds drop "minor", otherwise the
//   loop keeps finding new nits and never converges.
// - The loop stops on the first round with zero issues or after MAX_ROUNDS,
//   and returns what is left so the orchestrator can decide.
//
// args: { target: '<dir or repo>', rules: '<rules text>', critics: ['...'], maxRounds: 2 }

const T = args?.target ?? '<target>'
const RULES = args?.rules ?? 'No emoji, no em dash or en dash, no invented copy. Do not push or deploy.'
const MAX_ROUNDS = args?.maxRounds ?? 2

const CRIT = { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: {
  severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
}, required: ['severity', 'where', 'problem', 'fix'] } } }, required: ['issues'] }

const CRITICS = args?.critics ?? [
  `Content fidelity: compare every visible string in ${T} with its source of truth. Flag anything added, missing or changed. curl every link and report non-200.`,
  `Visual QA: screenshot ${T} at 390, 768, 1440 and 1920 px wide. Look at every image. Flag overflow, overlap, empty areas, blurry or cropped images, misalignment.`,
  `Technical audit of ${T}: console errors, 404s, page weight, lazy loading, keyboard navigation and visible focus, aria roles and states, reduced motion.`,
]

phase('Verify')
let round = 0, last = [], history = []
while (round < MAX_ROUNDS) {
  round++
  const crit = await parallel(CRITICS.map((c, i) => () =>
    agent(`${RULES}\n\n${c}\nReturn only real issues, each with an exact fix.`, { label: `critic${i + 1}:r${round}`, phase: 'Verify', schema: CRIT })))
  const issues = crit.filter(Boolean).flatMap(c => c.issues).filter(i => round === 1 || i.severity !== 'minor')
  last = issues
  history.push({ round, issues: issues.length, blockers: issues.filter(i => i.severity === 'blocker').length })
  log(`Round ${round}: ${issues.length} issues`)
  if (!issues.length) break
  await agent(`${RULES}\n\nFix these issues in ${T}. Verify each fix the same way the critic found it (screenshot you look at, curl, test run). Commit "fixes round ${round}".\nIssues: ${JSON.stringify(issues).slice(0, 15000)}`, { label: `fix:r${round}`, phase: 'Verify' })
}
if (last.length) log(`Stopped after ${round} rounds with ${last.length} issues left`)
return { rounds: history, remaining: last }
