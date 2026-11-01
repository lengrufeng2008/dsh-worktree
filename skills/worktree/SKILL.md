---
name: worktree
description: List git worktrees and manage isolated worktrees via CLI. Use for parallel experiments without touching the main checkout. The DSH tool is read-only.
whenToUse: "An agent needs an isolated checkout/branch for experiments, or stale worktree entries need pruning."
---

# Worktree

```bash
node bin/dsh-worktree.mjs list --root .
node bin/dsh-worktree.mjs create --root . --path ../exp --branch exp-1
node bin/dsh-worktree.mjs remove --root . --path ../exp
node bin/dsh-worktree.mjs prune --root .
```

## Safety

- `create` refuses an existing target path and validates a simple branch name.
- `remove` uses `git worktree remove`; it refuses a dirty worktree unless `--force` is passed.
- The DSH tool `worktree_list` is read-only. Creating/removing is intentionally CLI-only.
- It does not delete branches or run tests in the worktree.
