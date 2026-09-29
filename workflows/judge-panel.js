export const meta = {
  name: 'judge-panel',
  description: 'Spec, two independent design directions, three judges with different lenses, synthesis from the winner plus grafts, then a critic/fix loop',
  whenToUse: 'A page or UI with a wide solution space where one attempt iterated would converge on the first idea',
  phases: [
    { title: 'Spec', detail: 'design language to page spec' },
    { title: 'Build', detail: 'two independent directions' },
    { title: 'Judge', detail: 'three lenses score both' },
    { title: 'Synthesize', detail: 'final build from winner plus grafts' },
    { title: 'Verify', detail: 'critics then fixer, up to 2 rounds, then a check pass' },
  ],
}

// Pattern: judge panel.
// - Two builders get the same spec and rules but different directions, and
//   never see each other's work.
// - Three judges score both builds, each through one lens (audience, fidelity
//   to the design language, front-end craft). A single judge tends to reward
//   whatever it looked at first; lenses force coverage.
// - Scores are summed in plain code, not by another agent.
// - The synthesizer starts from the winner and grafts what the judges said to
//   keep from the loser.
// - The result goes through the critic/fix loop (see critic-fix-loop.js).
//
// args: { root: '<project dir>', language: '<design language dir>', content: '<content.md path>' }

const P = args?.root ?? '<project>'
const VL = args?.language ?? '<design-language>'
const CONTENT = args?.content ?? `${P}/content.md`

const RULES = `Hard rules from the owner, for every file and every visible string:
- Copy comes ONLY from ${CONTENT}. No invented claims, adjectives, slogans, section intros or helper notes. No explainer text next to buttons.
- No emoji or decorative unicode anywhere. No em dash or en dash anywhere, including titles and alt text.
- Static site, no build step: index.html + assets/. Vanilla JS. Self-hosted fonts. No external requests at runtime except links the user clicks.
- Works at 390, 768, 1024, 1440 and 1920 px with no horizontal scroll; tap targets at least 44 px; visible focus; prefers-reduced-motion respected.
- Serve your folder with python3 -m http.server on a free port and check it with Playwright screenshots that you open and look at.`

const LANG = `The design language lives in "${VL}". Read its principles chapter and tokens file; take exact token values, do not invent colors or sizes.`

const SPEC_SCHEMA = { type: 'object', properties: { spec_path: { type: 'string' }, summary: { type: 'string' } }, required: ['spec_path', 'summary'] }
const BUILD_SCHEMA = { type: 'object', properties: {
  folder: { type: 'string' }, screenshots: { type: 'array', items: { type: 'string' } },
  decisions: { type: 'string' }, page_weight_kb: { type: 'number' }, known_issues: { type: 'array', items: { type: 'string' } },
}, required: ['folder', 'screenshots', 'decisions', 'page_weight_kb', 'known_issues'] }
const JUDGE_SCHEMA = { type: 'object', properties: {
  scores: { type: 'object', properties: { d1: { type: 'number' }, d2: { type: 'number' } }, required: ['d1', 'd2'] },
  winner: { type: 'string', enum: ['d1', 'd2'] },
  keep_from_loser: { type: 'array', items: { type: 'string' } },
  must_fix: { type: 'array', items: { type: 'string' } },
  reasoning: { type: 'string' },
}, required: ['scores', 'winner', 'keep_from_loser', 'must_fix', 'reasoning'] }
const CRIT_SCHEMA = { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: {
  severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
}, required: ['severity', 'where', 'problem', 'fix'] } } }, required: ['issues'] }

phase('Spec')
const spec = await agent(`${LANG}\n\n${RULES}\n\nTASK: write ${P}/design/SPEC.md for the page: which parts of the design language apply where, the block structure, the two directions to build (D1 and D2, one paragraph each), and a checklist a judge can verify. Return the schema.`, { label: 'spec', phase: 'Spec', schema: SPEC_SCHEMA })

phase('Build')
const DIRECTIONS = [
  { key: 'd1', p: 'Build direction D1 from the spec.' },
  { key: 'd2', p: 'Build direction D2 from the spec.' },
]
const builds = await parallel(DIRECTIONS.map(d => () => agent(`${LANG}\n\n${RULES}\n\nSpec: ${spec.spec_path}. ${d.p} Work only in ${P}/build-${d.key}/. Screenshot at 390 and 1440 into ${P}/build-${d.key}/_review/, look at them, iterate at least twice. Return the schema.`, { label: `build:${d.key}`, phase: 'Build', schema: BUILD_SCHEMA })))
const ok = builds.filter(Boolean)

phase('Judge')
const LENSES = [
  { key: 'audience', p: 'Lens: the reader has 60 seconds, often on a phone. Is the main point clear in the first viewport? Does every block prove something with a number? Anything that reads as padding or template?' },
  { key: 'language', p: `Lens: fidelity to the design language in "${VL}" and to the owner's taste rules. Token values used vs the tokens file, one accent color for actions, hierarchy by size and gray, no explainer copy.` },
  { key: 'craft', p: 'Lens: front-end craft. Test with Playwright at 390, 768, 1024, 1440, 1920: overflow, layout shift, broken images, focus order, contrast, tap targets, console errors, transfer size.' },
]
const verdicts = await parallel(LENSES.map(l => () => agent(`${RULES}

Two candidate builds of the same page: D1 in ${P}/build-d1/ and D2 in ${P}/build-d2/. Spec: ${spec.spec_path}.
${l.p}
Score each 0-10 on your lens, pick a winner, list what to keep from the loser and what must be fixed in the winner. Be specific (selectors, sections, px). If a folder is missing or empty, score it 0.`, { label: `judge:${l.key}`, phase: 'Judge', schema: JUDGE_SCHEMA })))

const vs = verdicts.filter(Boolean)
const total = { d1: 0, d2: 0 }
vs.forEach(v => { total.d1 += v.scores.d1; total.d2 += v.scores.d2 })
const winner = total.d1 >= total.d2 ? 'd1' : 'd2'
log(`Judge totals: d1=${total.d1} d2=${total.d2}, winner ${winner}`)

phase('Synthesize')
const synth = await agent(`${LANG}\n\n${RULES}

Spec: ${spec.spec_path}. Winner: ${P}/build-${winner}/. The other build: ${P}/build-${winner === 'd1' ? 'd2' : 'd1'}/.
Judge verdicts: ${JSON.stringify(vs).slice(0, 12000)}
TASK: produce the final page in ${P}/site/. Start from the winner, graft every keep_from_loser item that fits, fix every must_fix item. Re-check every string against ${CONTENT}. Screenshot at 390 and 1440, look, iterate twice. Commit site/ only. Return the schema.`, { label: 'synthesize', phase: 'Synthesize', schema: BUILD_SCHEMA, effort: 'high' })

phase('Verify')
const CRITICS = [
  `Compare every visible string in ${P}/site (alt, title, meta included) with ${CONTENT} word for word. Flag anything added, missing or changed, any dash or emoji, and every link that does not return 200.`,
  `Screenshot ${P}/site at 390x844, 768x1024, 1440x900, 1920x1080, full page. Look at every image. Flag overflow, overlap, cropped or blurry images, misalignment, and breaks of the design language.`,
  `Tech audit of ${P}/site: console errors, 404s, total and per-image bytes, lazy loading, width/height on images, keyboard navigation with visible focus, aria states, reduced motion, meta tags, favicon, no external runtime requests.`,
]
async function critique(r) {
  const crit = await parallel(CRITICS.map((c, i) => () => agent(`${RULES}\n\n${c}\nReturn only real issues with exact fixes.`, { label: `critic${i + 1}:r${r}`, phase: 'Verify', schema: CRIT_SCHEMA })))
  return crit.filter(Boolean).flatMap(c => c.issues).filter(i => r === 1 || i.severity !== 'minor')
}
let round = 0, lastIssues = []
while (round < 2) {
  round++
  const issues = await critique(round)
  lastIssues = issues
  log(`Round ${round}: ${issues.length} issues`)
  if (!issues.length) break
  await agent(`${RULES}\n\nFix these issues in ${P}/site, verify each with screenshots you look at, commit "fixes round ${round}".\nIssues: ${JSON.stringify(issues).slice(0, 15000)}`, { label: `fix:r${round}`, phase: 'Verify' })
}
// The loop ended on a fix: check it once more, without fixing, so
// remainingIssues is what the critics still find.
if (lastIssues.length) lastIssues = await critique(round + 1)
return { spec, builds: ok.map(b => ({ folder: b.folder, weight: b.page_weight_kb })), total, winner, verdicts: vs, synth, remainingIssues: lastIssues }
