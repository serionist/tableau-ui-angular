// The PR text check's tests: attribution in the title or the description is refused, the description must name its
// issue with Refs, Closes or Fixes, and the command reads GitHub's event file or, with --text, a plain file. Run with
// `npm run test:tools`.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { prTextProblems } from './pr-text.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TITLE = 'Add the CI workflow';
const BODY = '## What and why\n\nCI runs the gate on every PR.\n\nRefs #24';

const scratch = mkdtempSync(join(tmpdir(), 'pr-text-test-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

function scratchFile(name, text) {
  const file = join(scratch, `${Math.random().toString(36).slice(2)}-${name}`);
  writeFileSync(file, text);
  return file;
}

const run = (...args) => spawnSync(process.execPath, [join(ROOT, 'tools', 'pr-text.mjs'), ...args], { encoding: 'utf8' });
const check = event => run(scratchFile('event.json', JSON.stringify(event)));

describe('PR text passes', () => {
  const bodies = {
    'Refs #<n>': 'What and why.\n\nRefs #24',
    'Closes #<n>': 'What and why.\n\nCloses #24',
    'Fixes #<n>': 'Fixes #7',
    'a reference in lower case': 'closes #24',
    'a reference in a sentence': 'This closes #24 for the tests.',
    'a mention beside the reference': 'Same cause as #30.\n\nRefs #24',
    'CRLF line endings': 'What and why.\r\n\r\nRefs #24\r\n',
  };
  for (const [name, body] of Object.entries(bodies)) {
    test(name, () => assert.deepEqual(prTextProblems(TITLE, body), []));
  }

  test('a sentence about Claude, or a person named Claude', () => {
    assert.deepEqual(prTextProblems('Fix the date picker Claude Martin reported', 'Claude Martin found it.\n\nCloses #40'), []);
  });
});

describe('PR text refuses', () => {
  test('a description that names no issue', () => {
    assert.deepEqual(prTextProblems(TITLE, 'What and why.'), ['the description names no issue: end it with Refs #<n> or Closes #<n>']);
  });

  const noIssue = {
    'an empty description': '',
    'an issue named in a sentence': 'Step S6 of #24: the workflows.',
    'an issue in brackets': 'The workflows (#24).',
    'a reference with a colon': 'Refs: #24',
    'an issue named only in an HTML comment': 'What and why.\n\n<!-- Closes #24 -->',
    'an issue named only in an unclosed HTML comment': 'What and why.\n\n<!-- Closes #24',
    'an HTML entity': 'It&#39;s done.',
    "a URL's fragment": 'See https://example.com/page#24',
    "another repository's issue": 'Like serionist/omniverse-mcp#13.',
  };
  for (const [name, body] of Object.entries(noIssue)) {
    test(name, () => assert.match(prTextProblems(TITLE, body).join('\n'), /names no issue/));
  }

  const BARE_CLOSES = `the description has a bare "Closes #": give it the issue's number`;
  const NO_ISSUE = 'the description names no issue: end it with Refs #<n> or Closes #<n>';

  test("the template's bare Closes #", () => {
    assert.deepEqual(prTextProblems(TITLE, 'What and why.\n\nCloses #'), [BARE_CLOSES, NO_ISSUE]);
  });

  test('a bare Closes # beside a mention of an issue', () => {
    assert.deepEqual(prTextProblems('Fix it (#24)', 'Same cause as #30.\n\nCloses #'), [BARE_CLOSES, NO_ISSUE]);
  });

  test("a bare Refs # beside a real reference, or the template's placeholder", () => {
    assert.deepEqual(prTextProblems(TITLE, 'Closes #24\nRefs #'), [`the description has a bare "Refs #": give it the issue's number`]);
    assert.deepEqual(prTextProblems(TITLE, 'Closes #24\nfixes #<n>'), [`the description has a bare "fixes #": give it the issue's number`]);
  });

  test("not a bare reference in an HTML comment, where the template's guidance sits", () => {
    assert.deepEqual(prTextProblems(TITLE, '<!-- Closes #<n> when this finishes the issue -->\n\nCloses #24'), []);
  });

  const attribution = {
    'a Co-Authored-By naming Claude': 'Co-Authored-By: Claude <noreply@anthropic.com>',
    'a "Generated with Claude Code" line': '🤖 Generated with [Claude Code](https://claude.com/claude-code)',
    'a session link': 'https://claude.ai/code/session_01AbCdEfGhIjKlMn',
    "an AI review bot's co-author line": 'Co-authored-by: gemini-code-assist[bot] <176961590+gemini-code-assist[bot]@users.noreply.github.com>',
  };
  for (const [name, line] of Object.entries(attribution)) {
    test(`${name} in the description`, () => {
      assert.deepEqual(prTextProblems(TITLE, `${BODY}\n\n${line}`), [`tool attribution in the description: ${line}`]);
    });
  }

  test('attribution in the title', () => {
    assert.deepEqual(prTextProblems('Generated with Claude Code', BODY), ['tool attribution in the title: Generated with Claude Code']);
  });

  test('attribution inside an HTML comment, which the squash commit keeps', () => {
    const problems = prTextProblems(TITLE, `${BODY}\n\n<!--\nCo-Authored-By: Claude <noreply@anthropic.com>\n-->`);
    assert.deepEqual(problems, ['tool attribution in the description: Co-Authored-By: Claude <noreply@anthropic.com>']);
  });
});

describe('node tools/pr-text.mjs <event file>', () => {
  test('exits 0 on a clean PR', () => {
    const done = check({ pull_request: { title: TITLE, body: BODY } });
    assert.equal(done.status, 0, done.stderr);
    assert.match(done.stdout, /no tool attribution, and the issue named/);
  });

  test('exits 1 and names each problem', () => {
    const done = check({ pull_request: { title: TITLE, body: 'What and why.\n\nCo-Authored-By: Claude <noreply@anthropic.com>' } });
    assert.equal(done.status, 1);
    assert.match(done.stderr, /tool attribution in the description: Co-Authored-By: Claude <noreply@anthropic\.com>/);
    assert.match(done.stderr, /names no issue/);
  });

  test('reads a PR with no description, which GitHub sends as null', () => {
    const done = check({ pull_request: { title: TITLE, body: null } });
    assert.equal(done.status, 1);
    assert.match(done.stderr, /names no issue/);
  });

  test('exits 2 on an event that is not a pull request', () => {
    const done = check({ push: {} });
    assert.equal(done.status, 2);
    assert.match(done.stderr, /holds no pull_request/);
  });
});

describe('node tools/pr-text.mjs --text <file>, for the squash message finish-work writes', () => {
  test('exits 0 on a clean message', () => {
    const done = run('--text', scratchFile('squash.md', 'CI runs the gate on every PR.\n\nRefs #24\n'));
    assert.equal(done.status, 0, done.stderr);
    assert.match(done.stdout, /no tool attribution, and the issue named/);
  });

  test('exits 1 on attribution or a bare reference, as for a description', () => {
    const done = run('--text', scratchFile('squash.md', 'CI runs the gate.\n\nCloses #\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n'));
    assert.equal(done.status, 1);
    assert.match(done.stderr, /tool attribution in the description: Co-Authored-By: Claude/);
    assert.match(done.stderr, /a bare "Closes #"/);
  });

  test('exits 2 without the file', () => {
    const done = run('--text');
    assert.equal(done.status, 2);
    assert.match(done.stderr, /usage: node tools\/pr-text\.mjs <event file> \| --text <file>/);
  });
});
