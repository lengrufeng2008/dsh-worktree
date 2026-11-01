import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { listWorktrees, createWorktree, removeWorktree } from '../src/worktree.mjs'
import { apply } from '../plugin/index.js'
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
async function repo() {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-worktree-'))
  execFileSync('git', ['init', '-q'], { cwd: dir })
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir })
  execFileSync('git', ['config', 'user.name', 'test'], { cwd: dir })
  await writeFile(join(dir, 'a.txt'), 'x\n')
  execFileSync('git', ['add', 'a.txt'], { cwd: dir })
  execFileSync('git', ['commit', '-qm', 'init'], { cwd: dir })
  return dir
}
test('create, list, and remove a worktree', async () => {
  const dir = await repo(); const wt = `${dir}-wt`
  try {
    createWorktree(dir, { path: wt, branch: 'test-wt' })
    const list = listWorktrees(dir)
    assert.equal(list.length, 2)
    assert.ok(list.some((w) => w.path === wt))
    removeWorktree(dir, { path: wt })
    assert.equal((await stat(wt).catch(() => null)), null)
  } finally { await rm(dir, { recursive: true, force: true }); await rm(wt, { recursive: true, force: true }) }
})
test('plugin registers worktree_list and worktree', async () => {
  const dir = await repo()
  try {
    const tools = []; let factory
    apply({ tools: { register: (t) => tools.push(t) }, skills: { registerProvider: (fn) => { factory = fn } } })
    assert.equal(tools[0].name, 'worktree_list')
    const result = await tools[0].execute({ root: dir })
    assert.equal(result.count, 1)
    assert.equal((await factory().list())[0].name, 'worktree')
  } finally { await rm(dir, { recursive: true, force: true }) }
})
