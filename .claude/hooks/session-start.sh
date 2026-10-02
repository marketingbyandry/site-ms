#!/bin/bash
# SessionStart (sessions web uniquement) :
#   1. installe les dépendances npm du site (pour `npm test`) ;
#   2. si le dépôt fullstack-claude est présent à côté, installe la stack perso
#      dans ~/.claude (skills, agents, commandes, règles, PAUL, CLAUDE.md) puis
#      les plugins de claude/plugins.json.
# Volontairement exclus : settings*.json (modèle, autoMode et permissions pensés
# pour le Mac), MCP (connecteurs gérés par l'environnement cloud), dépôts, et les
# plugins mémoire qui dépendent de services locaux.
# Idempotent : les fichiers déjà présents ne sont pas écrasés.
set -uo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

PROJECT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
SKIP_PLUGINS="claude-mem cognee-memory"

# 1. Dépendances du site
(cd "$PROJECT" && npm install --no-audit --no-fund --loglevel=error >/dev/null 2>&1) \
  || echo "session-start : npm install a échoué" >&2

# 2. Stack perso fullstack-claude
FSC=""
for d in "$PROJECT/../fullstack-claude" "$HOME/fullstack-claude"; do
  if [ -f "$d/claude/plugins.json" ]; then FSC="$(cd "$d" && pwd)"; break; fi
done
if [ -z "$FSC" ]; then
  echo "session-start : fullstack-claude absent de la session, stack perso non installée."
  exit 0
fi

python3 - "$FSC/claude" "$HOME/.claude" "$HOME" <<'EOF'
import os, shutil, sys
src, target, home = sys.argv[1:4]
KEEP = ("skills", "agents", "commands", "rules", "paul-framework", "scripts", "CLAUDE.md")
copied = 0
for root, dirs, files in os.walk(src):
    dirs.sort()
    for f in sorted(files):
        s = os.path.join(root, f)
        rel = os.path.relpath(s, src)
        if rel.split(os.sep)[0] not in KEEP or f == ".DS_Store":
            continue
        t = os.path.join(target, rel)
        if os.path.exists(t):
            continue
        os.makedirs(os.path.dirname(t), exist_ok=True)
        with open(s, "rb") as fh:
            data = fh.read()
        try:
            data = data.decode("utf-8").replace("${HOME}", home).encode("utf-8")
        except UnicodeDecodeError:
            pass
        with open(t, "wb") as fh:
            fh.write(data)
        shutil.copymode(s, t)
        copied += 1
print("session-start : %d fichier(s) de la stack perso copiés dans ~/.claude" % copied)
EOF

command -v claude >/dev/null 2>&1 || { echo "session-start : CLI claude absent, plugins sautés."; exit 0; }

INSTALLED="$(cat "$HOME/.claude/plugins/installed_plugins.json" 2>/dev/null || true)"
ok=0; ko=""
while IFS=$'\t' read -r kind name repo; do
  [ -n "$kind" ] || continue
  if [ "$kind" = M ]; then
    timeout 120 claude plugin marketplace add "$repo" </dev/null >/dev/null 2>&1 || true
    continue
  fi
  case " $SKIP_PLUGINS " in *" ${name%@*} "*) continue ;; esac
  case "$INSTALLED" in *"\"$name\""*) ok=$((ok + 1)); continue ;; esac
  if timeout 180 claude plugin install "$name" </dev/null >/dev/null 2>&1; then
    ok=$((ok + 1))
  else
    ko="$ko $name"
  fi
done <<EOF
$(python3 - "$FSC/claude/plugins.json" "$SKIP_PLUGINS" <<'PY'
import json, sys
plugins = json.load(open(sys.argv[1], encoding="utf-8"))
skip = sys.argv[2].split()
seen = []
for p in plugins:
    if p["plugin"] in skip or p["marketplace"] in seen or not p.get("repo"):
        continue
    seen.append(p["marketplace"])
    print("M\t%s\t%s" % (p["marketplace"], p["repo"]))
for p in plugins:
    print("P\t%s@%s\t" % (p["plugin"], p["marketplace"]))
PY
)
EOF
echo "session-start : $ok plugin(s) prêts${ko:+ ; échecs :$ko}"
exit 0
