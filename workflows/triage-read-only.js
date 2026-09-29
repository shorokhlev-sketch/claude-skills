export const meta = {
  name: 'triage-read-only',
  description: 'Read-only assessment of many repos or projects in parallel, one agent per target, merged by a shared schema',
  whenToUse: 'Before a cleanup or publishing pass: find out what each repo is, what it contains and what to do with it',
  phases: [{ title: 'Assess', detail: 'one read-only agent per target' }],
}

// Pattern: fan-out with a strict schema.
// Every agent answers the same questions, so the orchestrator can sort and
// compare results without reading prose. The rules block makes the run safe
// to start without review: nothing can be written, pushed or revoked.
//
// args: { owner: 'short description of the owner and goal',
//         targets: [{ key: 'repo-a', p: 'where it lives and what to look at' }, ...] }

const SCHEMA = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    what_it_is: { type: 'string', description: '1-2 sentences, English, concrete: what it does and for whom' },
    stack: { type: 'string' },
    size: { type: 'string', description: 'file count, LOC estimate, repo weight, commits' },
    local_vs_remote: { type: 'string', description: 'is the local clone in sync with the remote, uncommitted changes, ahead/behind' },
    demo_urls_found: { type: 'array', items: { type: 'string' }, description: 'live URLs found in README/config/deploy files, each with its curl -sI status code' },
    readme_quality: { type: 'string', description: 'none / stub / decent / good, language, what is missing' },
    client_code_or_data: { type: 'string', description: 'client code, client data (names, phones, prices, dumps, spreadsheets, PDFs), client branding: list paths' },
    red_flags_at_glance: { type: 'array', items: { type: 'string' }, description: 'secret files, committed .env, node_modules/.venv/.DS_Store, database dumps, huge binaries: path + what. Mask secret values.' },
    portfolio_value: { type: 'string', enum: ['high', 'medium', 'low', 'none'] },
    portfolio_notes: { type: 'string', description: 'what an employer would find impressive, with concrete numbers (tool count, test count)' },
    recommended_action: { type: 'string', enum: ['polish_and_publish', 'keep_private_as_is', 'keep_private_extract_public_snapshot', 'archive', 'delete_candidate'] },
    action_reason: { type: 'string' },
  },
  required: ['key', 'what_it_is', 'stack', 'size', 'demo_urls_found', 'readme_quality', 'client_code_or_data', 'red_flags_at_glance', 'portfolio_value', 'portfolio_notes', 'recommended_action', 'action_reason'],
}

const RULES = `STRICTLY READ-ONLY. Do not edit, create, delete, commit, push, checkout, stash, or call any API with POST/PATCH/PUT/DELETE.
Allowed: ls, cat, head, find, grep, wc, git log/status/show/ls-files/rev-list/diff, GET requests, curl -sI for demo URLs.
Never print a secret value: mask it as type + first 4 + last 4 characters.
Context: ${args?.owner ?? '<owner and goal, e.g. an engineer triaging private repos before publishing some of them>'}
Assess the target below and return the schema.`

const TARGETS = args?.targets ?? [
  { key: '<repo-a>', p: 'Local clone <path-a>. Count the agent tools precisely, check for tests, deploy files and caching.' },
  { key: '<repo-b>', p: 'Local clone <path-b>. Client project: check for committed database files with personal data and for .env files.' },
]

phase('Assess')
const results = await parallel(TARGETS.map(t => () =>
  agent(`${RULES}\n\nTARGET key="${t.key}": ${t.p}`, { label: t.key, phase: 'Assess', schema: SCHEMA })
))
const ok = results.filter(Boolean)
if (ok.length < TARGETS.length) log(`${TARGETS.length - ok.length} targets returned nothing`)
return ok
