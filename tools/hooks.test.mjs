// The hooks' tests: each form of tool attribution is refused, clean messages are accepted, a real `git commit` runs
// commit-msg through its .githooks/ shim. Run with `npm run test:tools`.

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

/** A repo of its own with the tools copied in, and git run in it with an identity and only the given hooks. */
function scratchRepo(name, hooksPath = join(scratch, 'no-hooks')) {
  const repo = join(scratch, name);
  mkdirSync(join(repo, 'tools'), { recursive: true });
  mkdirSync(hooksPath, { recursive: true });
  for (const file of ['hooks.mjs', 'attribution.mjs', 'gate.mjs']) copyFileSync(join(ROOT, 'tools', file), join(repo, 'tools', file));
  copyFileSync(join(ROOT, '.gitleaks.toml'), join(repo, '.gitleaks.toml'));
  const git = (...args) => spawnSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', `core.hooksPath=${hooksPath}`, ...args], { cwd: repo, encoding: 'utf8' });
  git('init', '--quiet');
  return { repo, git };
}

describe('commit-msg refuses', () => {
  const forms = {
    'a Co-Authored-By naming Claude': 'Co-Authored-By: Claude <claude@example.com>',
    'a Co-Authored-By naming a Claude model': 'Co-authored-by: Claude Opus 5.5 <claude@example.com>',
    'a Co-Authored-By at anthropic.com, whatever the name': 'CO-AUTHORED-BY: Someone <noreply@ANTHROPIC.com>',
    'a "Generated with Claude Code" line': '🤖 Generated with [Claude Code](https://claude.com/claude-code)',
    'a "generated with claude code" line in lower case': 'generated with claude code',
    'a Claude-Session line': 'claude-session: 0f3c9a2e-5b1d-4c7e-9a8f-2d6b1e4c7a90',
    'a claude.ai/code/session link': 'See HTTPS://claude.ai/code/session_01AbCdEfGhIjKlMn for the run.',
    'an Assisted-by trailer naming a tool': 'Assisted-by: Claude Code',
    'a Generated-by trailer naming a tool': 'Generated-by: Claude Code',
  };
  for (const [name, line] of Object.entries(forms)) {
    test(name, () => {
      assert.deepEqual(attributionLines(`${CLEAN}\n${line}`), [line.trim()]);
      const done = hook(`${CLEAN}\n\n${line}\n`);
      assert.equal(done.status, 1, done.stderr);
      assert.match(done.stderr, /commit-msg: refused: tool attribution/);
    });
  }

  // The trailers each tool writes, or its GitHub app's "Commit suggestion" button writes for it.
  const tools = {
    Copilot: 'Co-authored-by: Copilot <175728472+Copilot@users.noreply.github.com>',
    Cursor: 'Co-authored-by: Cursor Agent <cursoragent@cursor.com>',
    Codex: 'Co-authored-by: chatgpt-codex-connector[bot] <199175422+chatgpt-codex-connector[bot]@users.noreply.github.com>',
    Gemini: 'Co-authored-by: gemini-code-assist[bot] <176961590+gemini-code-assist[bot]@users.noreply.github.com>',
    Devin: 'Co-authored-by: devin-ai-integration[bot] <158243242+devin-ai-integration[bot]@users.noreply.github.com>',
    Aider: 'Co-authored-by: aider (gpt-4o) <noreply@aider.chat>',
    Jules: 'Co-authored-by: google-labs-jules[bot] <161369871+google-labs-jules[bot]@users.noreply.github.com>',
    CodeRabbit: 'Co-authored-by: coderabbitai[bot] <136622811+coderabbitai[bot]@users.noreply.github.com>',
    'Claude Code Action': 'Co-authored-by: Claude Code Action <noreply@example.com>',
  };
  for (const [name, line] of Object.entries(tools)) {
    test(`${name}'s co-author trailer`, () => assert.deepEqual(attributionLines(`${CLEAN}\n\n${line}`), [line]));
  }

  test('a line above the scissors of `git commit -v`', () => {
    const raw = `${CLEAN}\nCo-Authored-By: Claude <noreply@anthropic.com>\n# ------------------------ >8 ------------------------\n+ok\n`;
    assert.equal(attributionLines(messageText(raw)).length, 1);
  });

  test('a trailer behind a bare carriage return', () => {
    assert.equal(attributionLines(messageText('Subject\r\rBody\rCo-Authored-By: Claude <noreply@anthropic.com>\r')).length, 1);
  });
});

describe('commit-msg accepts', () => {
  test('a clean message', () => {
    assert.deepEqual(attributionLines(CLEAN), []);
    const done = hook(`${CLEAN}\n`);
    assert.equal(done.status, 0, done.stderr);
  });

  const clean = {
    'a person named Claude, and a sentence about Claude': 'The fix Claude Martin asked for.\nCo-authored-by: Claude Martin <claude.martin@example.com>',
    "Dependabot's co-author trailer": 'Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>',
    "GitHub Actions' co-author trailer": 'Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>',
    'a CSS cursor line': '- Created with `cursor: pointer` on the header cells, so they read as clickable.',
    "a sentence about the Monaco editor's cursor": 'Written by moving the cursor to the end once the text is set.',
    'a sentence that quotes the phrase it refuses': 'Refuse "Generated with Claude Code" lines in the PR body.',
  };
  for (const [name, body] of Object.entries(clean)) {
    test(name, () => assert.deepEqual(attributionLines(`${CLEAN}\n\n${body}`), []));
  }

  test('a diff below the scissors that holds attribution text', () => {
    const raw = `${CLEAN}\n# ------------------------ >8 ------------------------\ndiff --git a/x b/x\n+Co-Authored-By: Claude <noreply@anthropic.com>\n`;
    assert.deepEqual(attributionLines(messageText(raw)), []);
  });
});

describe('git runs commit-msg through .githooks/commit-msg', () => {
  const { git } = scratchRepo('commit', join(ROOT, '.githooks'));

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
