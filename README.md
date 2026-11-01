# Worktree for DSH

> List git worktrees read-only in DSH; create/remove/prune via CLI for isolated experiments.

## Use

```bash
node bin/dsh-worktree.mjs list --root .
node bin/dsh-worktree.mjs create --root . --path ../exp --branch exp-1
node bin/dsh-worktree.mjs remove --root . --path ../exp
node bin/dsh-worktree.mjs prune --root .
```

In DSH:

```text
Use worktree_list on this repository.
```

## Safety

- Read-only DSH tool; create/remove are CLI-only.
- Refuses existing target path and unsafe branch names.
- `remove` refuses dirty worktrees unless `--force`.
- No branch deletion, no test execution.
