#!/usr/bin/env bash
# UserPromptSubmit hook: a "sticky" harness reminder.
#
# The reminder switches on the first time a keyword appears in the prompt or in
# the session's working directory, and from then on it is injected into every
# turn of that session. State is one flag file per session_id in $TMPDIR.
#
# It reinforces rules that already live in the skills; it cannot enforce them.
# The two-capital-letters rule is a canary: when the model stops following it,
# the harness context has dropped out of the window.
#
# Configure:
#   HARNESS_KEYWORDS  extended regex, case-insensitive (default below)
#   HARNESS_TEXT      reminder text (default below)
# Requires: jq

keywords="${HARNESS_KEYWORDS:-seedance|ai-visual|ai visual}"
text="${HARNESS_TEXT:-HARNESS (seedance + ai-visual): (1) before ANY action load the skills: seedance with 00_seedance-rules.md and the relevant modules, ai-visual with 01_prompt-craft.md; no prompts or decisions from memory. (2) Start EVERY message with TWO capital letters, not one. (3) Tool calls in a correct wrapper; a bash command with a long --prompt goes on ONE line; a malformed call is resent cleanly once; before generating with a reference image, check that the file exists.}"

input=$(cat)
sid=$(printf '%s' "$input" | jq -r '.session_id // "nosession"')
prompt=$(printf '%s' "$input" | jq -r '.prompt // ""')
cwd=$(printf '%s' "$input" | jq -r '.cwd // ""')
flag="${TMPDIR:-/tmp}/claude-harness-reminder-${sid}"

if printf '%s\n%s' "$prompt" "$cwd" | grep -qiE "$keywords"; then
  : > "$flag"
fi

if [ -f "$flag" ]; then
  jq -n --arg t "$text" '{hookSpecificOutput: {hookEventName: "UserPromptSubmit", additionalContext: $t}}'
fi
exit 0
