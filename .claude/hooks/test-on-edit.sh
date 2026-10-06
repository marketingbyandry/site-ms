#!/bin/bash
# Lance `npm test` après une édition de code, et seulement de code.
# En cas d'échec : exit 2, pour que Claude voie les tests cassés et corrige.
cd "$CLAUDE_PROJECT_DIR"
file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.file_path||"")}catch{}})')
case "$file" in
  *.html|*.css|*.js|*.mjs|*.json|*.xml) ;;
  *) exit 0 ;;
esac
out=$(npm test --silent 2>&1)
if [ $? -ne 0 ]; then
  { echo "Tests en échec après modification de $file :"; echo "$out" | grep -E '^not ok|^# (pass|fail)' | head -20; } >&2
  exit 2
fi
echo "$out" | grep -E '^# (pass|fail)'
