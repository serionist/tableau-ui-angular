// The git hooks behind the .githooks/ shims, which `npm run setup` turns on.
//
// Usage (from a shim): node tools/hooks.mjs commit-msg <message file>
//                      node tools/hooks.mjs pre-push
//
// commit-msg refuses a message with tool attribution (tools/attribution.mjs says which lines).
// pre-push runs the gate's quick lane on the checked-out branch: it checks HEAD and the working tree, whichever
// branch the push names. A push that only deletes is let through.

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

// git sends one `<local ref> <local sha> <remote ref> <remote sha>` line per ref; a deletion's local sha is all zeros.
function prePush(lines) {
  const refs = lines.map(line => line.trim().split(/\s+/)).filter(parts => parts.length === 4);
  if (refs.length && refs.every(parts => ZERO_SHA.test(parts[1]))) {
    console.error('pre-push: the push only deletes, so there is nothing to check');
    return 0;
  }
  const done = spawnSync(process.execPath, [join(ROOT, 'tools', 'gate.mjs'), 'quick'], { cwd: ROOT, stdio: ['ignore', 'inherit', 'inherit'] });
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
