// The gate: the checks a change passes before it lands. People run it, the pre-push hook runs its quick lane, and CI
// is to run its full lane.
//
// Usage: npm run gate -- quick|full [--base <ref>]
//
// quick: package-lock.json in sync with every package.json, ESLint (ng lint), stylelint, Prettier, AGENTS.md within
//   150 lines, each skill's name and description, no tool attribution in the messages of <base>..HEAD, and gitleaks
//   on those commits when gitleaks is on PATH (a line says when it was skipped). <base> is origin/main.
// full: quick, then the library build, the hooks' tests, the component tests in Chromium and Firefox
//   (ng test --watch=false), and the demo app's build with its prerender.
//
// Checks still to come, each with the work it guards: a coverage floor that never falls below origin/main's, with the
// fixes' tests; the public API file compared with the built typings, with the API file; the docs site's prerender,
// with the docs site.
//
// It prints a line per check, then the tail of each failed check's output, and exits 1 when any failed. Node only, no
// dependencies: each tool runs from node_modules through node itself, the same on Windows and Linux; only npm, a .cmd
// on Windows, goes through a shell there.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { attributionLines } from './attribution.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS_MAX_LINES = 150;
const DESCRIPTION_MAX = 1024;
const OUTPUT_TAIL = 40;
const NG = 'node_modules/@angular/cli/bin/ng.js';
const STYLELINT = 'node_modules/stylelint/bin/stylelint.mjs';
const PRETTIER = 'node_modules/prettier/bin/prettier.cjs';
// What Prettier checks: the code, and the config, docs and harness around it. It skips what .gitignore lists, and
// writes package.json and package-lock.json the way npm does.
const PRETTIER_SCOPE = ['projects', 'tools', '.claude', 'docs', '*.{json,js,mjs,md}', '.prettierrc'];
const ANSI = /\x1b\[[0-9;]*m/g;

function run(command, args, { shell = false } = {}) {
  const done = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    shell,
    windowsHide: true,
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', NG_CLI_ANALYTICS: 'false' },
  });
  const output = `${done.stdout ?? ''}${done.stderr ?? ''}${done.error ? `\n${done.error.message}` : ''}`.replace(ANSI, '').trim();
  return { ok: done.status === 0, missing: done.error?.code === 'ENOENT', output };
}

const node = (script, ...args) => run(process.execPath, [script, ...args]);
// npm is a .cmd on Windows, which Node runs only through a shell, so there it goes as one command line; every
// argument here is fixed text.
const npm = (...args) => (process.platform === 'win32' ? run(['npm', ...args].join(' '), [], { shell: true }) : run('npm', args));
const git = (...args) => run('git', args);

function lines(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function lastLine(text) {
  return lines(text).at(-1) ?? '';
}

const pass = (detail, output = '') => ({ status: 'pass', detail, output });
const fail = (detail, output = '') => ({ status: 'FAIL', detail, output });
const skip = detail => ({ status: 'skip', detail, output: '' });

// The working tree's checks

function checkLock() {
  // --offline and an empty cache are enough: npm compares the lock with every package.json before it fetches anything.
  const done = npm('ci', '--dry-run', '--offline', '--ignore-scripts', '--no-audit', '--no-fund');
  if (done.ok) return pass('package-lock.json matches every package.json');
  const reason = lines(done.output).find(line => /\b(?:Invalid|Missing):/.test(line));
  return fail(reason ? `${reason.replace(/^npm error\s*/, '')}: npm install, then commit the lock` : 'npm ci --dry-run failed', done.output);
}

function checkEslint() {
  const done = node(NG, 'lint');
  return done.ok ? pass(lastLine(done.output)) : fail(lines(done.output).find(line => /\d+ problems?/.test(line)) ?? 'ng lint failed', done.output);
}

function checkStylelint() {
  const done = node(STYLELINT, 'projects/**/*.scss');
  return done.ok ? pass('projects/**/*.scss') : fail('stylelint found problems; npm run lint:scss:fix fixes some', done.output);
}

function checkPrettier() {
  const done = node(PRETTIER, '--check', ...PRETTIER_SCOPE);
  if (done.ok) return pass(PRETTIER_SCOPE.join(' '));
  const files = lines(done.output)
    .filter(line => line.startsWith('[warn] ') && !line.includes('Code style issues'))
    .map(line => line.slice('[warn] '.length));
  return fail(files.length ? `${files.length} file(s) not formatted: npm run pretty` : 'prettier --check failed', done.output);
}

function checkAgentsMd() {
  const file = join(ROOT, 'AGENTS.md');
  if (!existsSync(file)) return fail('AGENTS.md is missing');
  const total = readFileSync(file, 'utf8')
    .replace(/\r?\n$/, '')
    .split(/\r?\n/).length;
  return total > AGENTS_MAX_LINES ? fail(`AGENTS.md has ${total} lines; keep it within ${AGENTS_MAX_LINES}`) : pass(`${total} lines`);
}

/** A skill's frontmatter as {key: value}: `key: value` lines, and `key: >-` with the indented lines below it joined. */
function frontmatter(text) {
  const all = text.split(/\r?\n/);
  const end = all.indexOf('---', 1);
  if (all[0] !== '---' || end < 0) return null;
  const fields = {};
  let key = null;
  for (const line of all.slice(1, end)) {
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (match) {
      key = match[1];
      fields[key] = /^[>|][-+]?$/.test(match[2]) ? '' : match[2].replace(/^(['"])(.*)\1$/, '$2');
    } else if (key && /^\s/.test(line)) {
      fields[key] = `${fields[key]} ${line.trim()}`.trim();
    }
  }
  return fields;
}

function checkSkills() {
  const dir = join(ROOT, '.claude', 'skills');
  const folders = existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter(entry => entry.isDirectory()) : [];
  const problems = [];
  for (const { name } of folders) {
    const file = join(dir, name, 'SKILL.md');
    const fields = existsSync(file) ? frontmatter(readFileSync(file, 'utf8')) : null;
    const where = `.claude/skills/${name}/SKILL.md`;
    if (!fields) {
      problems.push(`${where}: missing, or no frontmatter between --- lines`);
      continue;
    }
    if (fields.name !== name) problems.push(`${where}: name is '${fields.name ?? ''}'; it must equal the folder name`);
    if (!fields.description) problems.push(`${where}: no description, and agents pick a skill by it`);
    else if (fields.description.length > DESCRIPTION_MAX) problems.push(`${where}: the description has ${fields.description.length} characters; keep it within ${DESCRIPTION_MAX}`);
  }
  if (!folders.length) return fail('no skills in .claude/skills');
  if (problems.length > 1) return fail(`${problems.length} problems`, problems.join('\n'));
  return problems.length ? fail(problems[0]) : pass(`${folders.length} skills`);
}

// The commits' checks

function commitRange(base) {
  const from = git('rev-parse', '--verify', '--quiet', `${base}^{commit}`);
  const to = git('rev-parse', '--verify', '--quiet', 'HEAD^{commit}');
  if (!from.ok || !to.ok) return { problem: `can't resolve ${base}..HEAD: git fetch origin, then run it again` };
  return { range: `${from.output}..${to.output}`, shown: `${base}..HEAD` };
}

function checkAttribution(base) {
  const { range, shown, problem } = commitRange(base);
  if (problem) return fail(problem);
  const log = git('log', '--format=%H%x00%B%x01', range);
  if (!log.ok) return fail(`git log ${shown} failed`, log.output);
  const commits = log.output
    .split('\x01')
    .map(record => record.trim())
    .filter(Boolean)
    .map(record => record.split('\x00'));
  const found = commits.flatMap(([sha, message = '']) => attributionLines(message).map(line => `${sha.slice(0, 10)}: ${line}`));
  if (found.length) return fail(`tool attribution in ${found.length} line(s) of ${shown}`, `${found.join('\n')}\nReword each commit without it.`);
  return pass(`${commits.length} commit(s) in ${shown}`);
}

function checkGitleaks(base) {
  if (run('gitleaks', ['version']).missing) return skip('gitleaks is not on PATH, so the branch was not scanned (https://github.com/gitleaks/gitleaks)');
  if (existsSync(join(ROOT, '.gitleaksignore'))) return fail('.gitleaksignore skips findings without a reason: allow each in .gitleaks.toml instead');
  const { range, shown, problem } = commitRange(base);
  if (problem) return fail(problem);
  const count = git('rev-list', '--count', range).output;
  if (count === '0') return pass(`no commits in ${shown}`);
  // A developer's git config can reshape the `git log -p` gitleaks reads (colour, textconv), and without
  // --diff-merges a merge commit shows no diff at all.
  const logOpts = `--no-color --no-textconv --diff-merges=first-parent ${range}`;
  const done = run('gitleaks', ['git', '--config', '.gitleaks.toml', '--log-opts', logOpts, '--redact', '--no-banner', '--ignore-gitleaks-allow', '--exit-code', '1', '--verbose', '.']);
  if (!done.ok) return fail(`leaks found in ${shown}, or the scan failed`, done.output);
  // gitleaks exits 0 when its own git log fails: it logs ERR and scans nothing.
  const error = lines(done.output).find(line => /(?:^|\s)ERR\s/.test(line));
  return error ? fail(`gitleaks could not read the commits: ${error}`, done.output) : pass(`${count} commit(s) in ${shown}, no leaks`);
}

// The full lane's checks

function checkLibraryBuild() {
  const done = npm('run', 'build:component-library');
  const built = lines(done.output).find(line => /Built tableau-ui-angular/.test(line));
  return done.ok ? pass(built?.replace(/^\W+/, '') ?? 'dist/component-library') : fail('the library build failed', done.output);
}

function checkHookTests() {
  const done = node('--test', 'tools/*.test.mjs');
  // The spec reporter's summary on a terminal, TAP's through a pipe.
  const count = /^(?:ℹ|#) pass (\d+)/m.exec(done.output)?.[1];
  return done.ok ? pass(`${count ?? 'all'} tests pass`) : fail("the hooks' tests failed", done.output);
}

function checkTests() {
  const done = node(NG, 'test', '--watch=false');
  const passed = [...done.output.matchAll(/^\s*Tests\s+(\d+) passed/gm)].reduce((sum, match) => sum + Number(match[1]), 0);
  return done.ok ? pass(`${passed} passed, in Chromium and Firefox`) : fail('ng test failed', done.output);
}

function checkDemoBuild() {
  const done = node(NG, 'build', 'test-app');
  const prerendered = lines(done.output).find(line => /^Prerendered \d+ static routes?/.test(line));
  if (!done.ok) return fail('ng build test-app failed', done.output);
  return prerendered ? pass(prerendered) : fail('the build printed no "Prerendered N static routes" line, so it did not prerender', done.output);
}

const QUICK = [
  ['lock', checkLock],
  ['eslint', checkEslint],
  ['stylelint', checkStylelint],
  ['prettier', checkPrettier],
  ['AGENTS.md', checkAgentsMd],
  ['skills', checkSkills],
  ['attribution', checkAttribution],
  ['gitleaks', checkGitleaks],
];
const FULL = [
  ['library build', checkLibraryBuild],
  ['hook tests', checkHookTests],
  ['tests', checkTests],
  ['demo build', checkDemoBuild],
];

function main(args) {
  const [lane, ...rest] = args;
  const base = rest[0] === '--base' && rest[1] ? rest[1] : 'origin/main';
  const extra = rest[0] === '--base' ? rest.slice(2) : rest;
  if (!['quick', 'full'].includes(lane) || extra.length) {
    console.error('usage: npm run gate -- quick|full [--base <ref>]');
    return 2;
  }
  const checks = lane === 'full' ? [...QUICK, ...FULL] : QUICK;
  const width = Math.max(...checks.map(([name]) => name.length));
  console.log(`gate ${lane}, commits ${base}..HEAD`);
  const results = [];
  for (const [name, check] of checks) {
    process.stdout.write(`  ${name.padEnd(width)}  `);
    const started = performance.now();
    let result;
    try {
      result = check(base);
    } catch (error) {
      result = fail(`${error.name}: ${error.message}`);
    }
    const seconds = `${((performance.now() - started) / 1000).toFixed(1)}s`;
    console.log(`${result.status.padEnd(4)}  ${seconds.padStart(6)}  ${result.detail}`);
    results.push({ name, ...result });
  }
  const failed = results.filter(result => result.status === 'FAIL');
  for (const result of failed.filter(result => result.output)) {
    console.log(`\n--- ${result.name} ---\n${result.output.split('\n').slice(-OUTPUT_TAIL).join('\n')}`);
  }
  const skipped = results.filter(result => result.status === 'skip').length;
  if (failed.length) {
    console.log(`\ngate ${lane} FAILED: ${failed.map(result => result.name).join(', ')}`);
    return 1;
  }
  console.log(`\ngate ${lane} passed: ${results.length - skipped} checks${skipped ? `, ${skipped} skipped` : ''}`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
