// Set up a clone once; safe to run again. `npm run setup`
//
// Turns on the hooks in .githooks/ and has git blame skip the reformat commits in .git-blame-ignore-revs. Both are this
// repo's own settings (git config --local), which its worktrees share; nothing global changes. It prints what it did,
// and the optional tools it found.

import { spawnSync } from 'node:child_process';
import { chmodSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = [
  ['core.hooksPath', '.githooks', 'commit-msg refuses tool attribution, pre-push runs the gate quick lane'],
  ['blame.ignoreRevsFile', '.git-blame-ignore-revs', 'git blame skips the reformat commits listed there'],
];
const TOOLS = [
  ['gitleaks', "the gate's secret scan, skipped without it: https://github.com/gitleaks/gitleaks"],
  ['gh', 'the skills read and open issues and PRs with it: https://cli.github.com, then gh auth login'],
];

const run = (command, ...args) => spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', windowsHide: true });
const git = (...args) => run('git', ...args);

function setConfig(key, value) {
  if (git('config', '--local', '--get', key).stdout.trim() === value) return `${key}=${value} (already set)`;
  const done = git('config', '--local', key, value);
  return done.status === 0 ? `${key}=${value} (set)` : `TO DO: git config --local ${key} ${value} failed: ${done.stderr.trim()}`;
}

// git skips a hook without the executable bit on Linux and macOS; a copy or an unzip can drop it.
function makeHooksExecutable() {
  if (process.platform === 'win32') return [];
  const done = [];
  for (const name of readdirSync(join(ROOT, '.githooks'))) {
    const file = join(ROOT, '.githooks', name);
    const { mode } = statSync(file);
    if (!(mode & 0o100)) {
      chmodSync(file, mode | 0o111);
      done.push(`made .githooks/${name} executable`);
    }
  }
  return done;
}

if (git('rev-parse', '--git-dir').status !== 0) {
  console.log(`not a git repository: ${ROOT}`);
  process.exit(1);
}
const lines = CONFIG.map(([key, value, why]) => `${setConfig(key, value)}: ${why}`);
console.log('git config (this clone and its worktrees):');
for (const line of [...lines, ...makeHooksExecutable()]) console.log(`  ${line}`);
console.log('tools:');
for (const [name, why] of TOOLS) {
  const found = run(name, '--version').error?.code !== 'ENOENT';
  console.log(found ? `  ${name}: found` : `  ${name}: not found (optional: ${why})`);
}
const todo = lines.filter(line => line.startsWith('TO DO')).length;
console.log(todo ? `done, with ${todo} thing(s) to do above.` : 'done.');
process.exitCode = todo ? 1 : 0;
