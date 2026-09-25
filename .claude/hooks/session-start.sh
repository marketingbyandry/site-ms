#!/bin/bash
# Sessions web (conteneur neuf) : installe les dépendances pour que `npm test` tourne.
# En local, node_modules existe déjà : on ne touche à rien.
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "$CLAUDE_PROJECT_DIR"
[ -d node_modules ] || npm ci --no-audit --no-fund --silent
