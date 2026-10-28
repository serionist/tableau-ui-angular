// The git hooks behind the .githooks/ shims, which `npm run setup` turns on.
//
// Usage (from a shim): node tools/hooks.mjs commit-msg <message file>
//                      node tools/hooks.mjs pre-push
//
// commit-msg refuses a message with tool attribution (tools/attribution.mjs says which lines).
// pre-push runs the gate's quick lane on what the push sends: the commits' checks on each pushed range, and the working
// tree's checks only when the push sends HEAD and the tree is clean. A push that only deletes is let through.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { attributionLines, messageText } from './attribution.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZERO_SHA = /^0+$/;

function commitMsg(file) {
  const found = attributionLines(messageText(readFileSync(file, 'utf8')));
  for (const line of found) console.error(`commit-msg: refused: tool attribution: ${line}`);
  if (found.length) console.error('commit-msg: take those lines out and commit again (AGENTS.md, Commits and PRs)');
  return found.length ? 1 : 0;
}

const known = sha => spawnSync('git', ['cat-file', '-e', `${sha}^{commit}`], { cwd: ROOT }).status === 0;

/** The range each pushed ref sends, from git's `<local ref> <local sha> <remote ref> <remote sha>` lines: from the
 * remote's commit, or from origin/main for a new branch or a remote commit this clone never fetched. */
function pushRanges(lines) {
  return lines
    .map(line => line.trim().split(/\s+/))
    .filter(parts => parts.length === 4 && !ZERO_SHA.test(parts[1]))
    .map(([, local, , remote]) => `${!ZERO_SHA.test(remote) && known(remote) ? remote : 'origin/main'}..${local}`);
}

function prePush(lines) {
  const refs = lines.filter(line => line.trim());
  const ranges = pushRanges(refs);
  if (refs.length && !ranges.length) {
    console.error('pre-push: the push only deletes, so there is nothing to check');
    return 0;
  }
  const args = ranges.flatMap(range => ['--range', range]);
  const done = spawnSync(process.execPath, [join(ROOT, 'tools', 'gate.mjs'), 'quick', ...args], { cwd: ROOT, stdio: ['ignore', 'inherit', 'inherit'] });
  return done.status ?? 1;
}

const [hook, file] = process.argv.slice(2);
if (hook === 'commit-msg' && file) {
  process.exitCode = commitMsg(file);
} else if (hook === 'pre-push') {
  process.exitCode = prePush(process.stdin.isTTY ? [] : readFileSync(0, 'utf8').split(/\r?\n/));
} else {
  console.error('usage: node tools/hooks.mjs commit-msg <message file> | pre-push');
  process.exitCode = 2;
}
