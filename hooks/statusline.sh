#!/bin/sh
# Status line: folder name, model, context window usage in percent.
input=$(cat)
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // "unknown"')
model=$(echo "$input" | jq -r '.model.display_name // "unknown"')
# jq rounds the number, so the output does not depend on the shell's locale
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty | round')

dir=$(basename "$cwd")

if [ -n "$used" ]; then
  printf "%s  %s  ctx:%s%%" "$dir" "$model" "$used"
else
  printf "%s  %s" "$dir" "$model"
fi
