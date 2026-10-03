#!/bin/bash
# SessionStart (sessions web uniquement) :
#   1. installe les dépendances npm du site (pour `npm test`) ;
#   2. si le dépôt fullstack-claude est présent à côté, installe la stack perso
#      dans ~/.claude via son cloud-install.sh (skills, agents, /paul:*, plugins).
set -uo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

PROJECT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

(cd "$PROJECT" && npm install --no-audit --no-fund --loglevel=error >/dev/null 2>&1) \
  || echo "session-start : npm install a échoué" >&2

for d in "$PROJECT/../fullstack-claude" "$HOME/fullstack-claude"; do
  if [ -x "$d/cloud-install.sh" ]; then exec "$d/cloud-install.sh"; fi
done
echo "session-start : fullstack-claude absent de la session, stack perso non installée."
exit 0
