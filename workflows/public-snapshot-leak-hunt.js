export const meta = {
  name: 'public-snapshot-leak-hunt',
  description: 'Build sanitized public snapshots of private repos, then an adversarial leak hunt and a run check per repo, then fix',
  whenToUse: 'Publishing parts of private or client work: a fresh repo without history, checked by agents whose only job is to find what must not be public',
  phases: [
    { title: 'Build', detail: 'one agent per repo' },
    { title: 'Verify', detail: 'leak hunt and run/claims check per repo' },
    { title: 'Fix' },
  ],
}

// Pattern: pipeline with adversarial verify.
// - pipeline() runs each repo through Build -> Verify -> Fix independently,
//   so a small repo is finished while a big one is still building.
// - The builder copies from private sources into a NEW repo with no history.
//   The forbidden list is explicit and identical for builder and hunter.
// - The leak hunter is told the repo is about to go public and that its job
//   is to find anything that must not. It runs gitleaks and its own greps and
//   reads files, instead of trusting the builder's report.
// - A second verifier checks that the README commands work and that every
//   number in the README has evidence in the code.
// - Sources are never modified; the fixer only touches the new repo.
//
// args: { dest: '<public repos dir>', forbidden: '<extra forbidden strings, never written into the repo>',
//         repos: [{ key: 'name', src: 'source paths', brief: 'what the repo is and what to include' }] }

const DEST = args?.dest ?? '<public-repos-dir>'
const STYLE = 'Short sentences, active voice, concrete numbers, no marketing words, no emoji or decorative symbols, no em dash or en dash (hyphen-minus only).'
const FORBIDDEN = `secrets, .env files, tokens, account emails, personal emails, server IPs, hostnames and ssh aliases, server paths, local home paths, private repo names, client identities, real people's names or phones, prices or business terms from client talks, profanity, third-party copyrighted media, verbatim copies of third-party docs. ${args?.forbidden ?? ''}`

const COMMON = `You build a NEW public git repo at ${DEST}/<name> from sanitized copies of private sources.
- Do not modify, move or delete anything in the sources. Copy only.
- No history from the sources: git init a fresh repo; 2 to 5 logical commits. Do not create a remote, do not push.
- Never include: ${FORBIDDEN}
- README.md in English: title + one line; what and for whom in 2 sentences; a screenshot or diagram near the top when there is a visual; key technical decisions with numbers; repo structure; exact run commands that work; status; license. Style: ${STYLE}
- Images: WebP or PNG under 400 KB each, width 1600 or less; total repo under 40 MB.
- If it has code: install dependencies inside the new repo, run the tests or a smoke run, fix what breaks from path generalization. No paid API calls, no network writes.
- At the end run gitleaks git and gitleaks dir on the new repo and grep for the forbidden items; fix every hit.
Return: tree summary with sizes, what was excluded and why, test or smoke results, gitleaks results, open questions.`

const CRIT = { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: {
  severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, file: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
}, required: ['severity', 'file', 'problem', 'fix'] } } }, required: ['issues'] }

const REPOS = args?.repos ?? [
  { key: '<repo-name>', src: '<source paths>', brief: '<what the repo is, what to include, what to strip>' },
]

const results = await pipeline(REPOS,
  (_, r) => agent(`${COMMON}\n\nREPO NAME: ${r.key} (path ${DEST}/${r.key})\nSOURCES: ${r.src}\nBRIEF: ${r.brief}`, { label: `build:${r.key}`, phase: 'Build', effort: 'high' }),

  async (build, r) => {
    const dst = `${DEST}/${r.key}`
    const checks = await parallel([
      () => agent(`ADVERSARIAL leak hunt in ${dst}, a repo about to be published. Your only job is to find anything that must not be public: ${FORBIDDEN}
Run gitleaks git and gitleaks dir on it. Grep every tracked file, including images' metadata (exiftool) and git commit messages and author fields. Read the docs, do not skim.
Do not trust the builder's report. Report every hit with file and exact fix.`, { label: `leak-hunt:${r.key}`, phase: 'Verify', schema: CRIT }),
      () => agent(`Run and claims check of ${dst}. Copy it to a temp dir, follow README "Run" or "Usage" literally in a fresh environment, report every failing or unclear step with the exact README fix.
Then check every number and claim in README.md against the code and docs in the repo; flag any claim without evidence. Style check: ${STYLE}
No paid API calls. Delete the temp copy after.`, { label: `run-check:${r.key}`, phase: 'Verify', schema: CRIT }),
    ])
    return { build, issues: checks.filter(Boolean).flatMap(c => c.issues) }
  },

  async (v, r) => {
    const dst = `${DEST}/${r.key}`
    let fix = 'none'
    if (v.issues.length) {
      fix = await agent(`Fix these verified issues in ${dst}. Commit each logical fix. Do not touch the sources. Do not push. Re-run gitleaks git and gitleaks dir at the end and report the result.
Issues: ${JSON.stringify(v.issues)}`, { label: `fix:${r.key}`, phase: 'Fix' })
    }
    return { key: r.key, build: v.build, issues: v.issues, fix }
  },
)
return results.filter(Boolean)
