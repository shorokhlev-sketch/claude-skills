#!/usr/bin/env bash
# Validate every file in the package:
#   - JSON parses
#   - shell scripts pass bash -n / sh -n
#   - workflow scripts parse (the body is wrapped in an async function,
#     because a top-level return is only valid inside the Workflow harness)
#   - every SKILL.md has YAML front matter with name and description
#   - no emoji, no em dash or en dash, no absolute home paths, no IPv4 addresses
# Requires: node, python3. Exit code 1 on any failure.
set -u
cd "$(dirname "$0")/.." || exit 1
fail=0
ok() { printf 'OK    %s\n' "$1"; }
bad() { printf 'FAIL  %s\n' "$1"; fail=1; }

for f in $(find . -name '*.json' -not -path './.git/*'); do
  if python3 -m json.tool "$f" >/dev/null 2>&1; then ok "json   $f"; else bad "json   $f"; fi
done

for f in $(find . -name '*.sh' -not -path './.git/*'); do
  if head -1 "$f" | grep -q bash; then sh_cmd=bash; else sh_cmd=sh; fi
  if $sh_cmd -n "$f" 2>/dev/null; then ok "shell  $f"; else bad "shell  $f"; fi
done

tmp=$(mktemp -d)
for f in workflows/*.js; do
  out="$tmp/$(basename "$f" .js).cjs"
  {
    echo 'async function __workflow(agent, parallel, pipeline, phase, log, args, budget, workflow) {'
    sed 's/^export const meta/const meta/' "$f"
    echo '}'
  } > "$out"
  if node --check "$out" 2>"$tmp/err"; then ok "js     $f"; else bad "js     $f"; cat "$tmp/err"; fi
done
rm -rf "$tmp"

for f in skills/*/SKILL.md; do
  if python3 - "$f" <<'EOF'
import re, sys
t = open(sys.argv[1], encoding="utf-8").read()
m = re.match(r"^---\n(.*?)\n---\n", t, re.S)
assert m, "no front matter"
fm = m.group(1)
assert re.search(r"^name: \S+", fm, re.M), "no name"
assert re.search(r"^description: .+", fm, re.M), "no description"
EOF
  then ok "skill  $f"; else bad "skill  $f"; fi
done

python3 - <<'EOF' || fail=1
import pathlib, re, sys
bad = 0
emoji = re.compile("[" + chr(0x1F000) + "-" + chr(0x1FAFF) + chr(0x2600) + "-" + chr(0x27BF) + chr(0x2B50) + chr(0x2B55) + chr(0xFE0F) + "]")
dash = re.compile("[" + chr(0x2013) + chr(0x2014) + "]")
home = re.compile(r"/(Users|home)/[A-Za-z]")
ipv4 = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
for p in pathlib.Path(".").rglob("*"):
    if ".git" in p.parts or not p.is_file():
        continue
    try:
        text = p.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    for n, line in enumerate(text.splitlines(), 1):
        for name, rx in (("emoji", emoji), ("dash", dash), ("home-path", home), ("ipv4", ipv4)):
            m = rx.search(line)
            if m and not (name == "ipv4" and m.group(0).startswith("127.0.0.1")):
                print(f"FAIL  {name:6} {p}:{n}")
                bad = 1
print("OK    content scan" if not bad else "FAIL  content scan")
sys.exit(bad)
EOF

exit $fail
