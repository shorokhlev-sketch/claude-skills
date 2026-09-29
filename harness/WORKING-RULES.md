# Working rules

Rules for running Claude Code as an orchestrator of subagents on long, iterative work. Each rule came from a concrete failure in a real project. The line under each rule says why it exists.

Put the rules that matter for a task into the loop file and into every agent brief. Agents do not inherit them otherwise.

## 1. Orchestration

**1.1 Orchestrate, do not hand-code.** The main model writes the plan, the contract (schema, interfaces, one-line acceptance criterion) and the integration. Subagents write the code: a cheaper model for typical pieces (API routes, UI components, tests), a stronger model for hard logic (migrations, multi-branch wizards, media handling).
Why: one session where the main model wrote a 2,500-line engine alone was slower and more expensive than splitting it; the expensive model belongs on design, decomposition and acceptance.

**1.2 Give each parallel agent a disjoint set of files.** Say "you own these files; another agent edits the rest right now".
Why: two agents editing the same file in parallel silently overwrite each other.

**1.3 A failed piece goes to a fresh agent with a corrected brief.** Do not keep pushing the agent that failed.
Why: an agent that failed once tends to defend its approach; a new agent with the fix written into the brief usually passes on the first try.

**1.4 When a checklist demands the impossible, fix the brief, not the model.** Example: a brief asked for a material that is not visible from the chosen camera angle.
Why: the agent will keep failing a requirement that cannot be met and burn the budget doing it.

**1.5 Watch for context rot.** Smaller models drift after roughly 500k to 900k tokens: they start fixing symptoms and report checks they did not run. Stop them and start a fresh agent with a narrow task map, or do the critical part yourself.
Why: the drift is quiet; the report still says "all good".

**1.6 Three failures on one item: change the item, not the prompt.**
Why: nine prompt variants of one video shot cost about 150 credits and none worked; a different shot worked on the first run.

**1.7 Do not expand scope.** Anything not in the spec goes to a "Questions" list, not into the code.
Why: a self-built render pipeline replaced the editor the owner actually wanted to use and had to be thrown away.

## 2. Acceptance

**2.1 Accept with your own eyes, at the source.** Read the diff, run the tests yourself, curl the endpoint, open the page. An agent's "everything works" does not count.
Why: text reports from agents said "all matches" on output that was visibly wrong.

**2.2 The agent must open its own result** and answer specific acceptance questions about it (what is at this coordinate, how many items are on this page).
Why: agents that never look at their output cannot catch visual defects.

**2.3 Trace the source, do not recognize it.** When a vector or structured source exists (a PDF with layers, a design file, an API), copy its primitives by attribute instead of detecting shapes from pixels.
Why: three rounds of smart detectors produced a parody of the plans; tracing the source primitives solved it in one pass.

**2.4 Every defect becomes a general rule plus a check**, not a one-off patch. Feed the agent the screenshot of the defect next to the source.
Why: patched symptoms come back in the next batch; a rule with a check does not.

**2.5 Fix systemic defects in the generator, item defects in the item.** Seams, alignment and placement are generator bugs; a single wrong door is an item edit followed by a re-export.
Why: fixing 33 outputs by hand for a bug in the script that made them is wasted work that the next run undoes.

**2.6 Measure what you cannot see.** When a tool cannot display a video, extract a contact sheet and compute numbers (mean frame difference, color drift between first and last frame) before accepting.
Why: an agent's description of a clip is not evidence.

## 3. Changing things safely

**3.1 One unit, then scale.** Apply feedback to one item, list the changes in text, wait for "ok", then run the rest in batches of 5 to 7 with an acceptance check after each batch.
Why: one wrong heuristic applied to 28 finished items broke work that had already been accepted, and the whole series had to be rolled back.

**3.2 If feedback is ambiguous, ask one line.** Do not guess.
Why: guesses multiplied across a batch cost more than the question.

**3.3 Never overwrite the owner's manual edits.** The row, branch or file the owner works in is the master. Edit it in place. No "sync" by cloning over it without an explicit command.
Why: a sync that cloned a backup over the working row erased hand edits.

**3.4 Back up before you touch.** Copy the item to a backup slot before editing it. Change only what was asked.
Why: the owner needs a one-click way to undo any change.

**3.5 Backups at every stage and in every workspace.**
- Code: one commit per change with "what and why", push after each milestone, tag milestones.
- Design files: a backup row inside the working page; before a stage that rewrites a page, duplicate it as "Page, before <date> <stage>".
- Server: snapshot the database or build before each deploy, keep the last N.
Why: autonomous runs (mass regeneration, re-uploads, `rsync --delete`) already destroyed manual work once; rollback only works if "before" exists and is labeled.

**3.6 Split long remote scripts.** Keep each remote call under about 60 seconds and run them one at a time.
Why: a dropped connection mid-script leaves edits half applied and it is unclear which ones landed.

**3.7 Update in place and report in text.** Edit the live canvas or file and list what changed (IDs, names, counts). Do not produce zoom screenshots for the owner.
Why: the owner is already looking at the file; screenshots cost calls and time.

## 4. Product taste rules

**4.1 No emoji anywhere.** Not in UI text, buttons, posts, mockups, README, loop files, statuses or chat. Status in words. Put a guard test in code projects (for example `test_no_emoji_in_user_facing_texts`) and write the rule into every UI brief.
Why: emoji are the first marker of generated, low-effort product text.

**4.2 No explainer copy.** No slogans under headings, no footnotes under buttons, no reassuring notes ("the seller replies in the messenger" next to a "Message" button), no section intros, no essays in empty states. Allowed: labels, headings, data (prices, specs, counters, dates), placeholder equal to the field name, error text on a real failure, one short success line after an action. Ask agents for the list of texts they removed.
Why: text that repeats what the control already says is noise and the main marker of a generated interface.

**4.3 Design file for "what and where", HTML for "how it feels".** The owner sketches structure in the design tool; the agent produces variants in HTML; the owner picks on a phone; then code. Do not maintain a full copy of the app in the design tool.
Why: a design tool is static and cannot show real data; two live copies of one interface drift apart within a day.

## 5. Generative media

**5.1 Read the skill docs before every prompt.** No prompts from memory.
Why: the rules that prevent plastic-looking output live in the docs, and memory drops them first.

**5.2 Show an expensive prompt in full before running it**, even when the owner said "your call" or "faster".
Why: half of the corrections are visible in the prompt text before any credits are spent.

**5.3 One clip at a time.** Generate, show, accept or reject, then start the next.
Why: a batch repeats the same mistake in every clip at once.

**5.4 Draft on a cheap model, finish on the expensive one.**
Why: a motion draft costs about 5 credits against 22.5 for the final model, and most drafts get rejected.

**5.5 Negative prompts do not beat a strong prior.** Change the physics of the event or the camera angle instead.
Why: "no concentric rings" on a vibrating cup still produced rings on two models.

## 6. Talking to the owner

**6.1 TL;DR first, in two lines, then details.**
Why: the owner decides from the first two lines.

**6.2 Be blunt.** Say when an idea is weak and why. No empty praise, no hedging.
Why: the owner wants a filter for ideas, not an amplifier.

**6.3 End each working day with a resume file**: a `RESUME.md` in the project, updated memory, and the exact command to continue after `/clear`.
Why: sessions end on context compaction and the next one must start in one step.

## 7. Harness mechanics

**7.1 Hooks reinforce, they do not guarantee.** A `UserPromptSubmit` hook can inject a reminder on every turn, but it cannot rewrite the model's output.
Why: treat the hook as a nudge and keep the real rule in the skill and the brief.

**7.2 Use a visible canary for sticky rules.** Example: "start every message with two capital letters". When the canary disappears, the harness context has dropped out and the other rules are at risk too.
Why: a cheap, visible signal beats discovering the drift in the output.
