// The commit-msg hook's tests: each form of tool attribution is refused, a clean message is accepted, and a real
// `git commit` runs the hook through its .githooks/ shim. Run with `npm run test:tools`.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { attributionLines, messageText } from './attribution.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CLEAN = 'Add the check script\n\nOne script runs every check, so the hooks and CI agree.\n\nRefs #24';

const scratch = mkdtempSync(join(tmpdir(), 'hooks-test-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

function hook(message) {
  const file = join(scratch, `msg-${Math.random().toString(36).slice(2)}.txt`);
  writeFileSync(file, message);
  return spawnSync(process.execPath, [join(ROOT, 'tools', 'hooks.mjs'), 'commit-msg', file], { encoding: 'utf8' });
}

describe('commit-msg refuses', () => {
  const forms = {
    'a Co-Authored-By naming Claude': 'Co-Authored-By: Claude <claude@example.com>',
    'a Co-Authored-By naming a Claude model': 'Co-authored-by: Claude Opus 5.5 <claude@example.com>',
    'a Co-Authored-By at anthropic.com, whatever the name': 'CO-AUTHORED-BY: Someone <noreply@ANTHROPIC.com>',
    'a "Generated with Claude Code" line': '🤖 Generated with [Claude Code](https://claude.com/claude-code)',
    '"generated with claude code" in lower case, mid-line': 'This change was generated with claude code.',
    'a Claude-Session line': 'claude-session: 0f3c9a2e-5b1d-4c7e-9a8f-2d6b1e4c7a90',
    'a claude.ai/code/session link': 'See HTTPS://claude.ai/code/session_01AbCdEfGhIjKlMn for the run.',
  };
  for (const [name, line] of Object.entries(forms)) {
    test(name, () => {
      assert.deepEqual(attributionLines(`${CLEAN}\n${line}`), [line.trim()]);
      const done = hook(`${CLEAN}\n\n${line}\n`);
      assert.equal(done.status, 1, done.stderr);
      assert.match(done.stderr, /commit-msg: refused: tool attribution/);
    });
  }

  test('a line above the scissors of `git commit -v`', () => {
    const raw = `${CLEAN}\nCo-Authored-By: Claude <noreply@anthropic.com>\n# ------------------------ >8 ------------------------\n+ok\n`;
    assert.equal(attributionLines(messageText(raw)).length, 1);
  });
});

describe('commit-msg accepts', () => {
  test('a clean message', () => {
    assert.deepEqual(attributionLines(CLEAN), []);
    const done = hook(`${CLEAN}\n`);
    assert.equal(done.status, 0, done.stderr);
  });

  test('a person named Claude, and a sentence about Claude', () => {
    const message = `${CLEAN}\n\nThe fix Claude Martin asked for.\nCo-authored-by: Claude Martin <claude.martin@example.com>`;
    assert.deepEqual(attributionLines(message), []);
  });

  test('a diff below the scissors that holds attribution text', () => {
    const raw = `${CLEAN}\n# ------------------------ >8 ------------------------\ndiff --git a/x b/x\n+Co-Authored-By: Claude <noreply@anthropic.com>\n`;
    assert.deepEqual(attributionLines(messageText(raw)), []);
  });
});

describe('git runs the hook through .githooks/commit-msg', () => {
  const repo = join(scratch, 'repo');
  mkdirSync(join(repo, 'tools'), { recursive: true });
  for (const name of ['hooks.mjs', 'attribution.mjs']) copyFileSync(join(ROOT, 'tools', name), join(repo, 'tools', name));
  const git = (...args) => spawnSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', `core.hooksPath=${join(ROOT, '.githooks')}`, ...args], { cwd: repo, encoding: 'utf8' });
  git('init', '--quiet');

  test('and the commit is refused', () => {
    const done = git('commit', '--allow-empty', '-m', `${CLEAN}\n\nCo-Authored-By: Claude <noreply@anthropic.com>`);
    assert.notEqual(done.status, 0, done.stdout);
    assert.match(done.stderr, /commit-msg: refused/);
  });

  test('and a clean commit is made', () => {
    const done = git('commit', '--allow-empty', '-m', CLEAN);
    assert.equal(done.status, 0, done.stderr);
  });
});
