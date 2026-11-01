#!/usr/bin/env node
import { listWorktrees, createWorktree, removeWorktree, pruneWorktrees } from '../src/worktree.mjs'
const args = process.argv.slice(2)
const value = (n) => { const i = args.indexOf(n); return i === -1 ? undefined : args[i + 1] }
const command = args.find((a) => !a.startsWith('--')) || 'list'
const root = value('--root') || process.cwd()
try {
  if (command === 'list') console.log(JSON.stringify(listWorktrees(root), null, 2))
  else if (command === 'create') { if (!value('--path') || !value('--branch')) throw new Error('--path and --branch are required'); console.log(JSON.stringify(createWorktree(root, { path: value('--path'), branch: value('--branch') }), null, 2)) }
  else if (command === 'remove') { if (!value('--path')) throw new Error('--path is required'); console.log(JSON.stringify(removeWorktree(root, { path: value('--path'), force: args.includes('--force') }), null, 2)) }
  else if (command === 'prune') console.log(JSON.stringify(pruneWorktrees(root), null, 2))
  else { console.log('dsh-worktree list|create --path DIR --branch NAME|remove --path DIR [--force]|prune [--root DIR]'); process.exitCode = 2 }
} catch (error) { console.error(`dsh-worktree: ${error.message}`); process.exitCode = 2 }
