import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { listWorktrees } from '../src/worktree.mjs'
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const SKILL_PATH = join(PLUGIN_DIR, '..', 'skills', 'worktree', 'SKILL.md')
const PROVIDER = 'dsh-worktree'
export const name = 'worktree'
export const inject = ['tools', 'skills']
function stripFrontmatter(text) { if (!text.startsWith('---\n')) return text; const end = text.indexOf('\n---\n', 4); return end === -1 ? text : text.slice(end + 5) }
const summary = { name: 'worktree', description: 'List git worktrees and manage them via CLI: create an isolated branch/worktree, remove it, or prune. The DSH tool is read-only.', whenToUse: 'An agent needs an isolated checkout for experiments or parallel work without touching the main working tree.', invocation: { modelInvocable: true, userInvocable: true }, source: 'bundled', provider: PROVIDER, resourceBase: { kind: 'directory', path: join(PLUGIN_DIR, '..', 'skills', 'worktree') }, rank: 600, locator: 'worktree', metadata: { domain: 'git', version: '0.1.0' } }
export function apply(ctx) {
  ctx.tools.register({ name: 'worktree_list', description: 'List git worktrees for a repository. Read-only; create/remove are CLI-only so the model cannot mutate git state through this tool.', parameters: { type: 'object', additionalProperties: false, properties: { root: { type: 'string' } } }, output: { schema: { type: 'object', additionalProperties: false, properties: { markdown: { type: 'string' }, count: { type: 'integer' } }, required: ['markdown', 'count'] }, render: (_a, v) => [{ type: 'text', text: v.markdown }] }, timeoutMs: 30_000, async execute(args = {}) { const list = listWorktrees(args.root || process.cwd()); const markdown = list.map((w) => `- ${w.path}  ${w.branch || (w.detached ? '(detached)' : '')}`).join('\n') || 'No worktrees.'; return { markdown: `${list.length} worktree(s):\n${markdown}`, count: list.length } } })
  ctx.skills.registerProvider(() => ({ name: PROVIDER, async list() { return [summary] }, async get(c) { if (c?.name !== 'worktree') return undefined; return { ...summary, content: stripFrontmatter(await readFile(SKILL_PATH, 'utf8')) } } }))
}
