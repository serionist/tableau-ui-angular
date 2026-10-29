// The gate: the checks a change passes before it lands. People run it, the pre-push hook runs its quick lane, and CI
// (.github/workflows/ci.yml) runs its full lane.
//
// Usage: npm run gate -- quick|full [--base <ref> | --range <from>..<to> ...]
//
// quick: package-lock.json in sync with every package.json, ESLint (ng lint), stylelint, Prettier, AGENTS.md within
//   150 lines, each skill's name and description, no coverage ignore comment in the library, no tool attribution in the
//   commits' messages, and gitleaks on those commits when gitleaks is on PATH (a line says when it was skipped;
//   GATE_REQUIRE_GITLEAKS=1, as CI sets it, makes that a failure).
// full: quick, then the library build, the hooks' tests, the tests of every angular.json project in Chromium and
//   Firefox (ng test --watch=false, the library's with coverage), the library's line coverage against the floor in
//   tools/coverage.json, and the demo app's build with its prerender, which must prerender a route and log no error.
//
// The coverage floor is a whole percent that only rises: the gate fails when the library's line coverage is below it,
// or when it is below the floor at the base commit (origin/main's by default), and says when it can rise.
//
// The commits are <base>..HEAD, origin/main..HEAD by default, and the working tree is checked as it is. The pre-push
// hook passes each pushed range with --range instead; then the working tree's checks run only when every range ends at
// HEAD and the tree is clean, and are skipped, with the reason, when it is not what is pushed.
//
// Checks still to come, each with the work it guards: the public API file compared with the built typings, with the
// API file; the docs site's prerender, with the docs site.
//
// It prints a line per check, then the tail of each failed check's output, and exits 1 when any failed. Node only, no
// dependencies: each tool runs from node_modules through node itself, the same on Windows and Linux; only npm, a .cmd
// on Windows, goes through a shell there.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { attributionLines, toolCoAuthor } from './attribution.mjs';
import { prerenderVerdict, testRuns } from './angular.mjs';
import { FLOOR_FILE, ignoreComments, readFloor, verdict } from './coverage.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS_MAX_LINES = 150;
const DESCRIPTION_MAX = 1024;
const OUTPUT_TAIL = 40;
const NG = 'node_modules/@angular/cli/bin/ng.js';
const STYLELINT = 'node_modules/stylelint/bin/stylelint.mjs';
const PRETTIER = 'node_modules/prettier/bin/prettier.cjs';
// The summary the library's tests write with --coverage (angular.json, the library's test target)
const COVERAGE_SUMMARY = 'coverage/component-library/coverage-summary.json';
// What Prettier checks: the code, and the config, docs and harness around it. It skips what .gitignore lists, and
// writes package.json and package-lock.json the way npm does.
const PRETTIER_SCOPE = ['projects', 'tools', '.claude', '.github', 'docs', '*.{json,js,mjs,md}', '.prettierrc'];
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

/** No comment under the library tells istanbul, c8 or V8 to skip code: that would take it out of what the floor measures. */
function checkCoverageIgnores() {
  const dir = join(ROOT, 'projects', 'component-library');
  const files = readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map(path => path.split('\\').join('/'))
    .filter(path => /\.(?:ts|m?js|html)$/.test(path) && !path.split('/').includes('node_modules'))
    .map(path => ({ path: `projects/component-library/${path}`, text: readFileSync(join(dir, path), 'utf8') }));
  const found = ignoreComments(files);
  if (found.length) return fail(`${found.length} coverage ignore comment(s): test the code instead`, found.join('\n'));
  return pass(`${files.length} files under projects/component-library`);
}

// The scope: the commit ranges whose commits are checked, and whether the working tree stands for them

/** Each `<from>..<to>` resolved to commit ids, or the problem that stopped it. */
function resolveRanges(specs) {
  const ranges = [];
  for (const spec of specs) {
    const at = spec.indexOf('..');
    if (at < 1 || spec[at + 2] === '.') return { problem: `${spec} is not a <from>..<to> range` };
    const ends = [spec.slice(0, at), spec.slice(at + 2) || 'HEAD'].map(ref => git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`));
    if (!ends.every(end => end.ok && end.output)) return { problem: `can't resolve ${spec}: git fetch origin, then run it again` };
    ranges.push({ range: `${ends[0].output}..${ends[1].output}`, to: ends[1].output });
  }
  return { ranges };
}

/** Why the working tree can't stand for what the ranges hold, or null when it can: each ends at HEAD, and no tracked file is changed. */
function treeSkipReason(ranges) {
  const head = git('rev-parse', '--verify', '--quiet', 'HEAD^{commit}').output;
  const other = ranges.find(({ to }) => to !== head);
  if (other) return `the push sends ${other.to.slice(0, 10)}, not HEAD`;
  // Untracked files don't count: they are never pushed, and a scratch file shouldn't skip the lint checks.
  if (git('status', '--porcelain', '--untracked-files=no').output) return 'the working tree has changes the push does not send';
  return null;
}

// The commits' checks

function checkAttribution({ ranges, problem, shown }) {
  if (problem) return fail(problem);
  const seen = new Set();
  const found = [];
  for (const { range } of ranges) {
    const log = git('log', '--format=%H%x00%an <%ae>%x00%cn <%ce>%x00%B%x01', range);
    if (!log.ok) return fail(`git log ${range} failed`, log.output);
    const commits = log.output
      .split('\x01')
      .map(record => record.trim())
      .filter(Boolean)
      .map(record => record.split('\x00'));
    for (const [sha, author = '', committer = '', message = ''] of commits) {
      if (seen.has(sha)) continue;
      seen.add(sha);
      if (toolCoAuthor(author)) found.push(`${sha.slice(0, 10)}: author ${author}`);
      if (toolCoAuthor(committer)) found.push(`${sha.slice(0, 10)}: committer ${committer}`);
      found.push(...attributionLines(message).map(line => `${sha.slice(0, 10)}: ${line}`));
    }
  }
  if (found.length) return fail(`tool attribution in ${found.length} line(s) of ${shown}`, `${found.join('\n')}\nReword each commit without it.`);
  return pass(`${seen.size} commit(s) in ${shown}`);
}

function checkGitleaks({ ranges, problem, shown }) {
  if (run('gitleaks', ['version']).missing) {
    // CI sets GATE_REQUIRE_GITLEAKS=1, so a runner without gitleaks fails instead of passing unscanned.
    if (/^(?:1|true|yes)$/i.test(process.env.GATE_REQUIRE_GITLEAKS ?? '')) return fail('gitleaks is not on PATH, and GATE_REQUIRE_GITLEAKS=1 requires it');
    return skip('gitleaks is not on PATH, so the commits were not scanned (https://github.com/gitleaks/gitleaks)');
  }
  if (existsSync(join(ROOT, '.gitleaksignore'))) return fail('.gitleaksignore skips findings without a reason: allow each in .gitleaks.toml instead');
  if (problem) return fail(problem);
  let total = 0;
  for (const { range } of ranges) {
    const count = Number(git('rev-list', '--count', range).output);
    if (!count) continue;
    total += count;
    // A developer's git config can reshape the `git log -p` gitleaks reads (colour, textconv), and without
    // --diff-merges a merge commit shows no diff at all.
    const logOpts = `--no-color --no-textconv --diff-merges=first-parent ${range}`;
    const done = run('gitleaks', ['git', '--config', '.gitleaks.toml', '--log-opts', logOpts, '--redact', '--no-banner', '--ignore-gitleaks-allow', '--exit-code', '1', '--verbose', '.']);
    if (!done.ok) return fail(`leaks found in ${shown}, or the scan failed`, done.output);
    // gitleaks exits 0 when its own git log fails: it logs ERR and scans nothing.
    const error = lines(done.output).find(line => /(?:^|\s)ERR\s/.test(line));
    if (error) return fail(`gitleaks could not read the commits: ${error}`, done.output);
  }
  return pass(total ? `${total} commit(s) in ${shown}, no leaks` : `no commits in ${shown}`);
}

// The full lane's checks

function checkLibraryBuild() {
  const done = npm('run', 'build:component-library');
  const built = lines(done.output).find(line => /Built tableau-ui-angular/.test(line));
  return done.ok ? pass(built?.replace(/^\W+/, '') ?? 'dist/component-library') : fail('the library build failed', done.output);
}

function checkHookTests() {
  const done = node('--test', '--test-reporter=tap', 'tools/*.test.mjs');
  if (!done.ok) return fail("the hooks' tests failed", done.output);
  // A test file with no tests passes as one test named after the file, so only a test with a name of its own, neither
  // skipped nor a todo, shows that a test ran.
  const ran = [...done.output.matchAll(/^\s*ok \d+ - (.*)$/gm)].filter(([, name]) => !/\.test\.mjs$|#\s*(?:SKIP|TODO)\b/i.test(name.trim())).length;
  const count = Number(/^# pass (\d+)/m.exec(done.output)?.[1] ?? 0);
  return ran && count ? pass(`${count} tests pass`) : fail("no hooks' test ran: tools/*.test.mjs holds no test", done.output);
}

function checkTests() {
  // A summary left by an earlier run must never stand for this one
  rmSync(join(ROOT, 'coverage'), { recursive: true, force: true });
  const runs = testRuns(JSON.parse(readFileSync(join(ROOT, 'angular.json'), 'utf8'))).map(args => node(NG, ...args));
  const output = runs.map(done => done.output).join('\n');
  const passed = [...output.matchAll(/^\s*Tests\s+(\d+) passed/gm)].reduce((sum, match) => sum + Number(match[1]), 0);
  // the failed runs' output alone, so the tail the gate prints is a failure's, not the next project's passing run
  const failed = runs.filter(done => !done.ok).map(done => done.output);
  return failed.length ? fail('ng test failed', failed.join('\n')) : pass(`${passed} passed, in Chromium and Firefox`);
}

function checkCoverage({ ranges, problem }) {
  const summary = join(ROOT, COVERAGE_SUMMARY);
  if (!existsSync(summary)) return fail(`the tests wrote no ${COVERAGE_SUMMARY}`);
  const counts = JSON.parse(readFileSync(summary, 'utf8')).total?.lines ?? {};
  const measured = Number(counts.pct);
  if (!Number.isFinite(measured)) return fail(`${COVERAGE_SUMMARY} has no total line coverage`);
  const file = join(ROOT, FLOOR_FILE);
  if (!existsSync(file)) return fail(`${FLOOR_FILE} is missing: it holds the library's line coverage floor`);
  const { floor, problem: badFloor } = readFloor(readFileSync(file, 'utf8'));
  if (badFloor) return fail(badFloor);
  // The floor at the base, origin/main's by default; a base from before the floor existed has none
  if (problem) return fail(problem);
  const base = ranges[0].range.split('..')[0];
  const atBase = git('show', `${base}:${FLOOR_FILE}`);
  const { floor: baseFloor, problem: badBase } = atBase.ok ? readFloor(atBase.output, `${FLOOR_FILE} at ${base.slice(0, 10)}`) : {};
  if (badBase) return fail(badBase);
  const { ok, detail } = verdict({ measured, floor, baseFloor });
  // the counts too, so two runs that differ show where
  const counted = `${detail} (${counts.covered} of ${counts.total} lines)`;
  return ok ? pass(counted) : fail(counted);
}

function checkDemoBuild() {
  const done = node(NG, 'build', 'test-app');
  if (!done.ok) return fail('ng build test-app failed', done.output);
  const { ok, detail } = prerenderVerdict(done.output);
  return ok ? pass(detail) : fail(detail, done.output);
}

// Each check, and whether it reads the working tree.
const QUICK = [
  ['lock', checkLock, true],
  ['eslint', checkEslint, true],
  ['stylelint', checkStylelint, true],
  ['prettier', checkPrettier, true],
  ['AGENTS.md', checkAgentsMd, true],
  ['skills', checkSkills, true],
  ['coverage ignores', checkCoverageIgnores, true],
  ['attribution', checkAttribution, false],
  ['gitleaks', checkGitleaks, false],
];
const FULL = [
  ['library build', checkLibraryBuild, true],
  ['hook tests', checkHookTests, true],
  ['tests', checkTests, true],
  ['coverage', checkCoverage, true],
  ['demo build', checkDemoBuild, true],
];
const USAGE = 'usage: npm run gate -- quick|full [--base <ref> | --range <from>..<to> ...]';

/** The lane and its scope: one range from --base (origin/main by default) to HEAD, or the --range ones. */
function parse(args) {
  const [lane, ...rest] = args;
  let base = null;
  const specs = [];
  for (let i = 0; i < rest.length; i += 2) {
    if (!rest[i + 1] || !['--base', '--range'].includes(rest[i])) return null;
    if (rest[i] === '--base') base = rest[i + 1];
    else specs.push(rest[i + 1]);
  }
  if (!['quick', 'full'].includes(lane) || (base && specs.length)) return null;
  const shown = specs.length ? specs : [`${base ?? 'origin/main'}..HEAD`];
  const { ranges = [], problem } = resolveRanges(shown);
  // With --base the tree is checked as it is, edits included; with --range, only when it is what the ranges end at.
  const treeSkipped = specs.length && !problem ? treeSkipReason(ranges) : null;
  // A full commit id, as the hook passes one, is shown as its first 10 characters.
  return { lane, scope: { ranges, problem, treeSkipped, shown: shown.join(', ').replace(/\b([0-9a-f]{10})[0-9a-f]{30}\b/g, '$1') } };
}

function main(args) {
  const parsed = parse(args);
  if (!parsed) {
    console.error(USAGE);
    return 2;
  }
  const { lane, scope } = parsed;
  const checks = lane === 'full' ? [...QUICK, ...FULL] : QUICK;
  const width = Math.max(...checks.map(([name]) => name.length));
  console.log(`gate ${lane}, commits ${scope.shown}`);
  if (scope.treeSkipped) console.log(`the working tree's checks are skipped: ${scope.treeSkipped}; run the gate on that commit to check them`);
  const results = [];
  for (const [name, check, readsTree] of checks) {
    process.stdout.write(`  ${name.padEnd(width)}  `);
    const started = performance.now();
    let result;
    try {
      result = readsTree && scope.treeSkipped ? skip('the working tree is not what is checked') : check(scope);
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
