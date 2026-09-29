---
name: public-snapshot
description: Turn private or client work into a clean public repo without history - sanitize copies, write an employer-facing README, make it run, and hunt for leaks before anything is pushed. Use when the user asks to publish, open-source, make public, or extract a showcase repo from a private project.
---

# Public snapshot

A public repo is a new repo. It is built from copies of the private sources and carries none of their history.

## Rules

- Never modify, move or delete the sources. Copy only.
- `git init` a fresh repo. 2 to 5 logical commits. Do not create a remote and do not push until the owner says so.
- Never include: secrets and `.env` files, tokens, account and personal emails, server IPs, hostnames and ssh aliases, server paths, local home paths, private repo names, client identities (unless the owner allowed them), real people's names and phones, prices and terms from client talks, profanity, third-party media (competitor screenshots, stock photos, reference images, music), verbatim third-party docs or skills.
- Keep the forbidden strings themselves out of the repo, including out of check scripts. Grep for them from outside.

## Steps

1. **Inventory.** List every source file. Mark each: include / generalize / exclude, with a reason. Check authorship: lock files, `author` fields, licenses, identical timestamps of a downloaded pack.
2. **Copy and generalize.** Replace absolute paths with placeholders or CLI arguments, client names with neutral ones, real data with a small synthetic sample that still runs.
3. **README in English.** Title and one line; what and for whom in 2 sentences; a screenshot or diagram near the top when there is a visual; key technical decisions with numbers; repo structure; exact commands that work; status; license. Short sentences, active voice, no marketing words, no emoji, hyphen-minus only.
4. **Images.** WebP or PNG, under 400 KB each, 1600 px wide or less, total repo under 40 MB. Strip metadata.
5. **Make it run.** Install dependencies inside the new repo, run the tests or a smoke run, fix what path generalization broke. No paid API calls, no network writes.
6. **Hunt.** `gitleaks git <repo>` and `gitleaks dir <repo>`, then grep for every forbidden item, including commit messages and author fields. Ideally a second agent does this with the instruction "this repo goes public in an hour, find what must not".
7. **Report.** Tree with sizes, what was excluded and why, test results, gitleaks results, open questions for the owner.

## Enforcement

- NEVER copy git history from a private source.
- NEVER trust the builder's own report as the leak check; run the tools and read the files.
- NEVER push or create the remote without an explicit instruction.
- ALWAYS list excluded items with reasons, so the owner can overrule a decision.
