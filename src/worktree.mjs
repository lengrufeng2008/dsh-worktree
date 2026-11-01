import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export function listWorktrees(root) {
  const out = execFileSync('git', ['-C', resolve(root), 'worktree', 'list', '--porcelain'], { encoding: 'utf8', timeout: 30_000 })
  const entries = []
  let current
  for (const line of out.split('\n')) {
    if (line.startsWith('worktree ')) { current = { path: line.slice(9) }; entries.push(current) }
    else if (current && line.startsWith('HEAD ')) current.head = line.slice(5)
    else if (current && line.startsWith('branch ')) current.branch = line.slice(7).replace(/^refs\/heads\//, '')
    else if (current && line === 'detached') current.detached = true
    else if (current && line === 'bare') current.bare = true
  }
  return entries
}
export function createWorktree(root, { path, branch }) {
  const repo = resolve(root)
  const target = resolve(path)
  if (!branch || !/^[A-Za-z0-9._/-]+$/.test(branch)) throw new Error('branch is required and must be a simple name')
  if (existsSync(target)) throw new Error(`target already exists: ${target}`)
  const branches = execFileSync('git', ['-C', repo, 'branch', '--list', branch], { encoding: 'utf8' }).trim()
  const args = branches ? ['-C', repo, 'worktree', 'add', target, branch] : ['-C', repo, 'worktree', 'add', '-b', branch, target]
  execFileSync('git', args, { encoding: 'utf8', timeout: 60_000 })
  return { path: target, branch, created: true }
}
export function removeWorktree(root, { path, force = false }) {
  const repo = resolve(root)
  const target = resolve(path)
  execFileSync('git', ['-C', repo, 'worktree', 'remove', ...(force ? ['--force'] : []), target], { encoding: 'utf8', timeout: 60_000 })
  return { path: target, removed: true, force }
}
export function pruneWorktrees(root) {
  execFileSync('git', ['-C', resolve(root), 'worktree', 'prune'], { encoding: 'utf8', timeout: 30_000 })
  return { pruned: true }
}
