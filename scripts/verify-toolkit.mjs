#!/usr/bin/env node
// Validates the Claude Code toolkit structure: skills, agents, rules, settings, templates and
// internal markdown links. Zero dependencies. Exit code 1 on any error.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const ok = [];

const rel = (p) => relative(ROOT, p);
const read = (p) => readFileSync(p, 'utf8');

/** Minimal YAML frontmatter parser: top-level `key: value` and `key:` + `- item` lists. */
function frontmatter(text, file) {
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---', 4);
  if (end === -1) {
    errors.push(`${rel(file)}: unterminated frontmatter`);
    return null;
  }
  const data = {};
  let listKey = null;
  for (const line of text.slice(4, end).split('\n')) {
    if (!line.trim()) continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      data[listKey].push(item[1].replace(/^["']|["']$/g, ''));
      continue;
    }
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) {
      errors.push(`${rel(file)}: cannot parse frontmatter line "${line}"`);
      continue;
    }
    const [, key, value] = kv;
    if (value === '') {
      data[key] = [];
      listKey = key;
    } else {
      data[key] = value.replace(/^["']|["']$/g, '');
      listKey = null;
    }
  }
  return { data, body: text.slice(end + 4).trim() };
}

const listDir = (p) => (existsSync(p) ? readdirSync(p) : []);

// ── Skills ────────────────────────────────────────────────────────────────────
const skillsDir = join(ROOT, '.claude/skills');
const skillNames = [];
for (const name of listDir(skillsDir)) {
  const dir = join(skillsDir, name);
  if (!statSync(dir).isDirectory()) continue;
  const file = join(dir, 'SKILL.md');
  if (!existsSync(file)) {
    errors.push(`${rel(dir)}: missing SKILL.md`);
    continue;
  }
  const fm = frontmatter(read(file), file);
  if (!fm) {
    errors.push(`${rel(file)}: missing YAML frontmatter`);
    continue;
  }
  const { data, body } = fm;
  if (data.name !== name) errors.push(`${rel(file)}: name "${data.name}" must equal folder "${name}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || name.length > 64)
    errors.push(`${rel(file)}: name must be lowercase kebab-case ≤ 64 chars`);
  if (!data.description || data.description.length < 40)
    errors.push(`${rel(file)}: description missing or too short to trigger reliably`);
  else if (data.description.length > 1024) errors.push(`${rel(file)}: description > 1024 chars`);
  if (body.length < 500) warnings.push(`${rel(file)}: body is short (${body.length} chars)`);
  skillNames.push(name);
}
ok.push(`skills: ${skillNames.length} (${skillNames.join(', ')})`);

// ── Agents ────────────────────────────────────────────────────────────────────
const agentsDir = join(ROOT, '.claude/agents');
const agentNames = [];
const KNOWN_TOOLS = new Set([
  'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash', 'WebSearch', 'WebFetch', 'NotebookEdit', 'Agent', 'Skill',
]);
for (const f of listDir(agentsDir).filter((f) => f.endsWith('.md'))) {
  const file = join(agentsDir, f);
  const fm = frontmatter(read(file), file);
  if (!fm) {
    errors.push(`${rel(file)}: missing YAML frontmatter`);
    continue;
  }
  const { data, body } = fm;
  const base = f.replace(/\.md$/, '');
  if (!data.name) errors.push(`${rel(file)}: missing name`);
  else if (data.name !== base) errors.push(`${rel(file)}: name "${data.name}" should match filename`);
  if (!data.description || data.description.length < 40) errors.push(`${rel(file)}: description missing/too short`);
  if (data.tools) {
    for (const t of String(data.tools).split(',').map((s) => s.trim()).filter(Boolean)) {
      if (!KNOWN_TOOLS.has(t) && !t.startsWith('mcp__')) warnings.push(`${rel(file)}: unrecognised tool "${t}"`);
    }
  }
  if (data.model && !['inherit', 'sonnet', 'opus', 'haiku'].includes(data.model) && !data.model.startsWith('claude-'))
    errors.push(`${rel(file)}: unknown model "${data.model}"`);
  if (body.length < 300) warnings.push(`${rel(file)}: system prompt is short`);
  agentNames.push(data.name);
}
ok.push(`agents: ${agentNames.length} (${agentNames.join(', ')})`);

// ── Rules ─────────────────────────────────────────────────────────────────────
const rulesDir = join(ROOT, '.claude/rules');
const rules = listDir(rulesDir).filter((f) => f.endsWith('.md'));
for (const f of rules) {
  const file = join(rulesDir, f);
  const text = read(file);
  if (text.trim().length < 200) errors.push(`${rel(file)}: rule is empty or trivial`);
  const fm = frontmatter(text, file);
  if (fm && fm.data.paths !== undefined && (!Array.isArray(fm.data.paths) || fm.data.paths.length === 0))
    errors.push(`${rel(file)}: "paths" must be a non-empty list of globs`);
}
ok.push(`rules: ${rules.length}`);

// ── Settings ──────────────────────────────────────────────────────────────────
const settingsFile = join(ROOT, '.claude/settings.json');
if (existsSync(settingsFile)) {
  try {
    const s = JSON.parse(read(settingsFile));
    for (const k of ['allow', 'deny']) {
      if (s.permissions?.[k] && !Array.isArray(s.permissions[k])) errors.push(`settings.json: permissions.${k} must be an array`);
    }
    ok.push('settings.json: valid JSON');
  } catch (e) {
    errors.push(`settings.json: invalid JSON (${e.message})`);
  }
}

// ── Required files ────────────────────────────────────────────────────────────
for (const p of ['CLAUDE.md', 'README.md', '.gitignore', 'brief/README.md']) {
  if (!existsSync(join(ROOT, p))) errors.push(`missing ${p}`);
}
const templates = listDir(join(ROOT, 'docs/templates')).filter((f) => f.endsWith('.md'));
if (templates.length < 14) errors.push(`docs/templates: expected 14 templates, found ${templates.length}`);
ok.push(`templates: ${templates.length}`);

// ── Markdown cross-references ─────────────────────────────────────────────────
// Checks relative links [x](path) and backticked repo paths like `.claude/skills/x/SKILL.md`.
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    if (['.git', 'node_modules'].includes(f)) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (f.endsWith('.md')) out.push(p);
  }
  return out;
}
const PATH_PREFIXES = ['.claude/', 'docs/templates/', 'docs/playbook/', 'scripts/', 'brief/README.md'];
let checkedRefs = 0;
for (const file of walk(ROOT)) {
  const text = read(file);
  for (const m of text.matchAll(/\]\(([^)#\s]+)\)/g)) {
    const target = m[1];
    if (/^(https?:|mailto:)/.test(target)) continue;
    checkedRefs++;
    if (!existsSync(resolve(dirname(file), target))) errors.push(`${rel(file)}: broken link → ${target}`);
  }
  for (const m of text.matchAll(/`([^`\s]+\.(?:md|mjs|json))`/g)) {
    const target = m[1];
    if (!PATH_PREFIXES.some((p) => target.startsWith(p))) continue;
    if (target.includes('<') || target.includes('*') || target.endsWith('settings.local.json')) continue;
    checkedRefs++;
    if (!existsSync(join(ROOT, target))) errors.push(`${rel(file)}: referenced path not found → ${target}`);
  }
  // Skill-relative references like `references/foo.md` inside a skill folder
  if (file.includes(`${join('.claude', 'skills')}`)) {
    for (const m of text.matchAll(/`(references\/[^`\s]+\.md)`/g)) {
      checkedRefs++;
      const skillRoot = file.slice(0, file.indexOf('.claude/skills/') + '.claude/skills/'.length) +
        rel(file).split('/')[2];
      if (!existsSync(join(skillRoot, m[1]))) errors.push(`${rel(file)}: skill reference not found → ${m[1]}`);
    }
  }
}
ok.push(`cross-references checked: ${checkedRefs}`);

// ── Referenced skill / agent names exist ──────────────────────────────────────
const claudeMd = read(join(ROOT, 'CLAUDE.md'));
for (const s of skillNames) if (!claudeMd.includes(`\`${s}\``)) warnings.push(`CLAUDE.md does not mention skill ${s}`);
for (const a of agentNames) if (!claudeMd.includes(`\`${a}\``)) warnings.push(`CLAUDE.md does not mention agent ${a}`);

// ── Report ────────────────────────────────────────────────────────────────────
for (const line of ok) console.log(`✔ ${line}`);
for (const w of warnings) console.log(`⚠ ${w}`);
for (const e of errors) console.log(`✘ ${e}`);
console.log(errors.length ? `\n${errors.length} error(s)` : '\nToolkit structure OK');
process.exit(errors.length ? 1 : 0);
