---
name: ship
description: Run tests, commit, open PR, merge to main
---
1. Run the full test suite (`npm test`); if any test fails because of an intentional copy/markup change, update that test in the same pass.
2. Show a concise diff summary of what changed.
3. Stage changes and commit with a conventional-commit message.
4. Push the branch and open a PR with `gh pr create --fill`.
5. Once checks pass, merge with `gh pr merge --squash` and report the PR number + merge commit SHA.
