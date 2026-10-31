// The release checks' tests: what stops a tag (the tag, the package's version, CHANGELOG.md's section, main, npm), the
// wait for ci.yml on the tagged commit, and the release notes. The commands run in a repo of their own, against a stub
// npm registry and a stub GitHub API. Run with `npm run test:tools`.

import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { changelogProblems, ciVerdict, isPrerelease, npmViewVerdict, releaseNotes, tagProblems, versionFromTag, waitForCi } from './release.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'release.mjs');
const COMMIT = 'a'.repeat(40);
const OTHER = 'b'.repeat(40);

const scratch = mkdtempSync(join(tmpdir(), 'release-test-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

/** A changelog as CHANGELOG.md is laid out, with the given heading and body between Unreleased and 0.1.129. */
const changelog = (heading, body = '### Fixed\n\n- A fix.') => `# Changelog\n\nWhat changed.\n\n## Unreleased\n\n${heading}\n\n${body}\n\n## 0.1.129 (2026-10-28)\n\n### Fixed\n\n- An older fix.\n`;
const GOOD = changelog('## 0.2.0 (2026-11-02)');

describe('the tag', () => {
  for (const [tag, version] of [
    ['v0.2.0', '0.2.0'],
    ['v1.10.3', '1.10.3'],
    ['v0.3.0-rc.1', '0.3.0-rc.1'],
  ]) {
    test(`${tag} names ${version}`, () => assert.deepEqual(versionFromTag(tag), { version }));
  }

  for (const tag of ['0.2.0', 'V0.2.0', 'v0.2', 'v0.2.0.1', 'v01.2.0', 'v0.2.0+build.1', 'v0.2.0-', 'version-0.2.0', 'v']) {
    test(`${tag} is refused`, () => assert.match(versionFromTag(tag).problem, /is not v<version>/));
  }

  test('a version with a pre-release part is a pre-release, and only that', () => {
    assert.equal(isPrerelease('0.3.0-rc.1'), true);
    assert.equal(isPrerelease('0.2.0'), false);
  });
});

describe("CHANGELOG.md's section", () => {
  test('a dated heading with lines under it passes', () => assert.deepEqual(changelogProblems(GOOD, '0.2.0'), []));

  test("a pre-release's own dated section passes", () => assert.deepEqual(changelogProblems(changelog('## 0.3.0-rc.1 (2026-11-02)'), '0.3.0-rc.1'), []));

  test('CRLF line endings pass', () => assert.deepEqual(changelogProblems(GOOD.replace(/\n/g, '\r\n'), '0.2.0'), []));

  test('no section for the version is refused', () => {
    assert.deepEqual(changelogProblems(changelog('## 0.1.130 (2026-11-02)'), '0.2.0'), [
      "CHANGELOG.md has no section for 0.2.0: its Unreleased heading becomes ## 0.2.0 (YYYY-MM-DD) in the version's PR",
    ]);
  });

  test("a pre-release's section is not its release's", () => {
    assert.match(changelogProblems(changelog('## 0.2.0-rc.1 (2026-11-02)'), '0.2.0').join('\n'), /no section for 0\.2\.0/);
  });

  test('only Unreleased is refused', () => assert.match(changelogProblems(changelog('### Added', '- A thing.'), '0.2.0').join('\n'), /no section for 0\.2\.0/));

  for (const heading of ['## 0.2.0', '## [0.2.0] - 2026-11-02', '## [0.2.0] (2026-11-02)', '## 0.2.0 - 2026-11-02', '## 0.2.0 (unreleased)', '## 0.2.0 (2026-11-2)', '## 0.2.0 (2026-11-02) draft']) {
    test(`"${heading}" is refused: a release's heading is ## <version> (YYYY-MM-DD)`, () => {
      assert.deepEqual(changelogProblems(changelog(heading), '0.2.0'), [`CHANGELOG.md's heading for 0.2.0 is "${heading}"; a release's reads ## 0.2.0 (YYYY-MM-DD)`]);
    });
  }

  for (const date of ['2026-02-30', '2026-13-01', '2026-00-10']) {
    test(`${date} is refused: no such day`, () => {
      assert.deepEqual(changelogProblems(changelog(`## 0.2.0 (${date})`), '0.2.0'), [`CHANGELOG.md's heading for 0.2.0 has ${date}, which is no date`]);
    });
  }

  test('a section with no lines is refused', () => {
    const text = '# Changelog\n\n## Unreleased\n\n## 0.2.0 (2026-11-02)\n\n\n## 0.1.129 (2026-10-28)\n\n- An older fix.\n';
    assert.deepEqual(changelogProblems(text, '0.2.0'), ["CHANGELOG.md's section for 0.2.0 is empty, and its lines are the release's notes"]);
  });

  test('two sections for the version are refused', () => {
    assert.deepEqual(changelogProblems(`${GOOD}\n## 0.2.0 (2026-11-03)\n\n- Again.\n`, '0.2.0'), ['CHANGELOG.md has 2 sections for 0.2.0: keep one']);
  });
});

describe('the release notes', () => {
  test("are the version's section without its heading, its ### parts included, up to the next ## heading", () => {
    const text = changelog('## 0.2.0 (2026-11-02)', '### Breaking\n\n- A break.\n\n### Fixed\n\n- A fix,\n  over two lines.');
    assert.equal(releaseNotes(text, '0.2.0'), '### Breaking\n\n- A break.\n\n### Fixed\n\n- A fix,\n  over two lines.');
  });

  test('are none for a version with no section, an empty one or two', () => {
    assert.equal(releaseNotes(GOOD, '0.3.0'), null);
    assert.equal(releaseNotes('## 0.2.0 (2026-11-02)\n\n## 0.1.129 (2026-10-28)\n\n- A fix.\n', '0.2.0'), null);
    assert.equal(releaseNotes(`${GOOD}\n## 0.2.0 (2026-11-03)\n\n- Again.\n`, '0.2.0'), null);
  });
});

describe("npm view's answer", () => {
  test('the version printed: npm has it', () => assert.deepEqual(npmViewVerdict({ status: 0, stdout: '"0.2.0"\n' }, '0.2.0'), { published: true }));

  test('E404, as npm 11 answers for a version it lacks: npm has not', () => {
    const stdout = JSON.stringify({ error: { code: 'E404', summary: 'No match found for version 0.2.0' } });
    assert.deepEqual(npmViewVerdict({ status: 1, stdout, stderr: 'npm error code E404\n' }, '0.2.0'), { published: false });
  });

  test('E404 on stderr alone: npm has not', () => {
    assert.deepEqual(npmViewVerdict({ status: 1, stdout: '', stderr: 'npm ERR! code E404\r\nnpm ERR! 404 Not Found\r\n' }, '0.2.0'), { published: false });
  });

  test('nothing printed, as an older npm answers: npm has not', () => assert.deepEqual(npmViewVerdict({ status: 0, stdout: '' }, '0.2.0'), { published: false }));

  const unknown = {
    'a timeout': { status: 1, stdout: JSON.stringify({ error: { code: 'ETIMEDOUT', summary: 'request to https://registry.npmjs.org/tableau-ui-angular failed' } }) },
    'a refused token': { status: 1, stdout: JSON.stringify({ error: { code: 'E401', summary: 'Unable to authenticate' } }) },
    'no npm at all': { status: null, stdout: '', stderr: 'spawn npm ENOENT' },
    'another version printed': { status: 0, stdout: '"0.1.129"' },
    'text that is no JSON': { status: 0, stdout: 'npm warn something' },
  };
  for (const [name, result] of Object.entries(unknown)) {
    test(`${name} is no answer, which stops the release`, () =>
      assert.match(npmViewVerdict(result, '0.2.0').problem, /^npm view tableau-ui-angular@0\.2\.0 failed \(.+\), so whether npm has 0\.2\.0 is unknown/));
  }
});

describe('what stops a tag', () => {
  const ok = { tag: 'v0.2.0', packageVersion: '0.2.0', changelog: GOOD, onMain: {}, npmView: { published: false } };

  test('nothing, for a tag on main at the dated, unpublished package version', () => assert.deepEqual(tagProblems(ok), []));

  test('a tag that is not the package version', () => {
    assert.deepEqual(tagProblems({ ...ok, packageVersion: '0.1.129' }), [
      "the tag is v0.2.0, but projects/component-library/package.json's version is 0.1.129: bump the version in a PR first, and tag its merge",
    ]);
  });

  test('a package with no version', () => assert.deepEqual(tagProblems({ ...ok, packageVersion: undefined }), ['projects/component-library/package.json has no semver version: ""']));

  test('a commit not on main', () => assert.deepEqual(tagProblems({ ...ok, onMain: { problem: 'not on main' } }), ['not on main']));

  test('a version npm has', () => {
    assert.deepEqual(tagProblems({ ...ok, npmView: { published: true } }), ['npm already has tableau-ui-angular@0.2.0, and a version is published once: release the next one']);
  });

  test("npm's failure to answer", () => assert.deepEqual(tagProblems({ ...ok, npmView: { problem: 'npm view failed' } }), ['npm view failed']));

  test('an undated section', () => assert.match(tagProblems({ ...ok, changelog: changelog('## 0.2.0') }).join('\n'), /heading for 0\.2\.0 is "## 0\.2\.0"/));

  test('every problem at once, each named', () => {
    const problems = tagProblems({ tag: 'v0.2.0', packageVersion: '0.1.129', changelog: changelog('## 0.2.0'), onMain: { problem: 'not on main' }, npmView: { published: true } });
    assert.equal(problems.length, 4, problems.join('\n'));
  });

  test('a tag that is no version stops before the changelog and npm are read', () => {
    assert.deepEqual(tagProblems({ ...ok, tag: 'release-1', changelog: '', npmView: { problem: 'not asked' } }), [
      "the tag release-1 is not v<version>: a release's tag is v and the version, such as v0.2.0",
    ]);
  });
});

/** A run of ci.yml as GitHub's API lists it. */
const run = (fields = {}) => ({
  head_sha: COMMIT,
  head_branch: 'main',
  event: 'push',
  status: 'completed',
  conclusion: 'success',
  html_url: `https://github.com/o/r/actions/runs/${Math.floor(Math.random() * 1e6)}`,
  ...fields,
});

describe("ci.yml's runs on the tagged commit", () => {
  for (const event of ['push', 'schedule', 'workflow_dispatch']) {
    test(`a ${event} run on main that passed passes`, () => assert.equal(ciVerdict([run({ event })], COMMIT).state, 'pass'));
  }

  test('one run that passed among failed ones passes', () => {
    assert.equal(ciVerdict([run({ conclusion: 'failure' }), run({ event: 'workflow_dispatch' }), run({ conclusion: 'cancelled' })], COMMIT).state, 'pass');
  });

  test('a run that passed wins over one still running', () => assert.equal(ciVerdict([run({ status: 'in_progress', conclusion: null }), run()], COMMIT).state, 'pass'));

  for (const status of ['queued', 'in_progress', 'waiting', 'pending', 'requested']) {
    test(`a ${status} run is still running`, () => assert.equal(ciVerdict([run({ conclusion: 'failure' }), run({ status, conclusion: null })], COMMIT).state, 'running'));
  }

  test('no run is none', () => assert.deepEqual(ciVerdict([], COMMIT), { state: 'none', detail: 'no ci.yml run on main for aaaaaaaaaa' }));

  const notCounted = {
    "a pull request's run": run({ event: 'pull_request', head_branch: 'feature' }),
    "a pull request's run from a fork's main": run({ event: 'pull_request' }),
    "another branch's push": run({ head_branch: '24-s13-release' }),
    "another commit's run": run({ head_sha: OTHER }),
  };
  for (const [name, other] of Object.entries(notCounted)) {
    test(`${name} that passed doesn't count`, () => {
      const verdict = ciVerdict([other], COMMIT);
      assert.equal(verdict.state, 'none');
      assert.match(verdict.detail, /the 1 run\(s\) found are pull requests' or other branches'/);
    });
  }

  test('runs that all finished without success fail, each named', () => {
    const failed = run({ conclusion: 'failure', html_url: 'https://github.com/o/r/actions/runs/1' });
    const cancelled = run({ event: 'schedule', conclusion: 'cancelled', html_url: 'https://github.com/o/r/actions/runs/2' });
    assert.deepEqual(ciVerdict([failed, cancelled], COMMIT), {
      state: 'fail',
      detail: 'ci.yml did not pass on aaaaaaaaaa: failure in https://github.com/o/r/actions/runs/1, cancelled in https://github.com/o/r/actions/runs/2. Re-run it, then this job',
    });
  });
});

describe('the wait for ci.yml', () => {
  /** waitForCi on a clock of its own: each answer in turn, the last one again, and a sleep that moves the clock. */
  async function wait(answers, { pollMs = 30_000, waitMs = 300_000, graceMs = 60_000 } = {}) {
    let time = 0;
    let asked = 0;
    const slept = [];
    const listRuns = async () => {
      const answer = answers[Math.min(asked++, answers.length - 1)];
      if (answer instanceof Error) throw answer;
      return answer;
    };
    const result = await waitForCi({ listRuns, commit: COMMIT, pollMs, waitMs, graceMs, now: () => time, sleep: async ms => slept.push((time += ms)), log: () => {} });
    return { ...result, asked, slept };
  }

  test('passes at once on a run that passed', async () => {
    const { ok, asked } = await wait([[run()]]);
    assert.equal(ok, true);
    assert.equal(asked, 1);
  });

  test('asks again while a run is going, then passes', async () => {
    const going = [run({ status: 'in_progress', conclusion: null })];
    const { ok, asked, slept } = await wait([going, going, [run()]]);
    assert.equal(ok, true);
    assert.equal(asked, 3);
    assert.deepEqual(slept, [30_000, 60_000]);
  });

  test('stops once a run has been going for the whole wait', async () => {
    const { ok, detail, asked } = await wait([[run({ status: 'in_progress', conclusion: null })]], { waitMs: 90_000 });
    assert.equal(ok, false);
    assert.equal(asked, 4);
    assert.match(detail, /still running on aaaaaaaaaa: .*, after 90 s$/);
  });

  test('stops after the grace when no run comes, before the whole wait', async () => {
    const { ok, detail, asked } = await wait([[]], { graceMs: 60_000, waitMs: 300_000 });
    assert.equal(ok, false);
    assert.equal(asked, 3);
    assert.equal(detail, 'no ci.yml run on main for aaaaaaaaaa, after 60 s');
  });

  test('waits past the grace for a run that came within it', async () => {
    const going = [run({ status: 'queued', conclusion: null })];
    const { ok, asked } = await wait([[], going, going, going, going, [run()]], { graceMs: 60_000, waitMs: 300_000 });
    assert.equal(ok, true);
    assert.equal(asked, 6);
  });

  test('stops at once when every run failed', async () => {
    const { ok, detail, asked } = await wait([[run({ conclusion: 'failure' })]]);
    assert.equal(ok, false);
    assert.equal(asked, 1);
    assert.match(detail, /did not pass/);
  });

  test('stops at once on a refused request', async () => {
    const refused = Object.assign(new Error('GET … answered 403: Resource not accessible by integration'), { retry: false });
    const { ok, detail, asked } = await wait([refused, [run()]]);
    assert.equal(ok, false);
    assert.equal(asked, 1);
    assert.match(detail, /answered 403/);
  });

  test('asks again after a request that got no answer', async () => {
    const { ok, asked } = await wait([new TypeError('fetch failed'), [run()]]);
    assert.equal(ok, true);
    assert.equal(asked, 2);
  });
});

// The commands, in a repo of their own

/** Runs `node tools/release.mjs <args>` in `cwd` without blocking, so a stub in this process can answer it. */
function command(args, { cwd, env }) {
  return new Promise((done, failed) => {
    const child = spawn(process.execPath, [SCRIPT, ...args], { cwd, env, windowsHide: true });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => (stdout += chunk));
    child.stderr.on('data', chunk => (stderr += chunk));
    child.on('error', failed);
    child.on('close', code => done({ code, stdout, stderr, output: stdout + stderr }));
  });
}

let count = 0;
/** The environment of a command: no GitHub Actions, no git or npm settings of this machine's, and the given ones. */
function environment(extra = {}) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(?:npm_config_|GITHUB_|GIT_DIR$|GIT_WORK_TREE$|GIT_INDEX_FILE$|GH_TOKEN$)/i.test(key)));
  const dir = join(scratch, `npm-${++count}`);
  mkdirSync(join(dir, 'cache'), { recursive: true });
  writeFileSync(join(dir, 'user.npmrc'), '');
  writeFileSync(join(dir, 'global.npmrc'), '');
  return {
    ...env,
    npm_config_userconfig: join(dir, 'user.npmrc'),
    npm_config_globalconfig: join(dir, 'global.npmrc'),
    npm_config_cache: join(dir, 'cache'),
    npm_config_fetch_retries: '0',
    npm_config_update_notifier: 'false',
    ...extra,
  };
}

/** A repo with the package at `version`, the changelog, and origin/main at HEAD, at HEAD's parent, or missing. */
function repo({ version = '0.2.0', text = GOOD, main = 'head' } = {}) {
  const dir = join(scratch, `repo-${++count}`);
  mkdirSync(join(dir, 'projects', 'component-library'), { recursive: true });
  const hooks = join(scratch, 'no-hooks');
  mkdirSync(hooks, { recursive: true });
  const git = (...args) => {
    const done = spawnSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', `core.hooksPath=${hooks}`, ...args], { cwd: dir, encoding: 'utf8', env: environment() });
    assert.equal(done.status, 0, done.stderr);
    return done.stdout.trim();
  };
  git('init', '--quiet');
  writeFileSync(join(dir, 'projects', 'component-library', 'package.json'), JSON.stringify({ name: 'tableau-ui-angular', version }, null, 2));
  writeFileSync(join(dir, 'CHANGELOG.md'), text);
  git('add', '.');
  git('commit', '--quiet', '-m', 'Release');
  if (main === 'head') git('update-ref', 'refs/remotes/origin/main', 'HEAD');
  if (main === 'parent') {
    git('update-ref', 'refs/remotes/origin/main', 'HEAD');
    git('commit', '--quiet', '--allow-empty', '-m', 'Not on main');
  }
  return dir;
}

async function listen(server) {
  await new Promise((done, failed) => {
    server.once('error', failed);
    server.listen(0, '127.0.0.1', done);
  });
  return `http://127.0.0.1:${server.address().port}`;
}

async function close(server) {
  server.closeAllConnections?.();
  await new Promise(done => server.close(done));
}

/** An npm registry with tableau-ui-angular at the given versions; it records the paths asked for. */
async function registry(versions) {
  const asked = [];
  const server = createServer((request, response) => {
    asked.push(request.url);
    if (decodeURIComponent(request.url) !== '/tableau-ui-angular') return response.writeHead(404, { 'Content-Type': 'application/json' }).end('{"error":"Not found"}');
    const time = Object.fromEntries(versions.map(version => [version, '2026-10-28T00:00:00.000Z']));
    const manifests = Object.fromEntries(
      versions.map(version => [version, { name: 'tableau-ui-angular', version, dist: { tarball: `${url}/tableau-ui-angular/-/tableau-ui-angular-${version}.tgz`, shasum: '0'.repeat(40) } }]),
    );
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(
      JSON.stringify({
        name: 'tableau-ui-angular',
        'dist-tags': { latest: versions.at(-1) },
        versions: manifests,
        time: { created: '2025-01-01T00:00:00.000Z', modified: '2026-10-28T00:00:00.000Z', ...time },
      }),
    );
  });
  const url = await listen(server);
  return { url, asked, close: () => close(server) };
}

describe('node tools/release.mjs check <tag>, against a stub npm registry', () => {
  async function check(tag, { versions = ['0.1.129'], repoOptions, env: extra = {} } = {}) {
    const npm = await registry(versions);
    const output = join(scratch, `output-${++count}`);
    writeFileSync(output, '');
    try {
      const done = await command(['check', tag], { cwd: repo(repoOptions), env: environment({ npm_config_registry: `${npm.url}/`, GITHUB_OUTPUT: output, ...extra }) });
      return { ...done, written: readFileSync(output, 'utf8'), asked: npm.asked };
    } finally {
      await npm.close();
    }
  }

  test('passes a tag on main at the dated package version npm lacks, and writes what the jobs after it read', async () => {
    const { code, output, written, asked } = await check('v0.2.0');
    assert.equal(code, 0, output);
    assert.match(output, /v0\.2\.0 is on main .* npm has no 0\.2\.0 yet\. It publishes under npm's latest tag\./);
    assert.equal(written, 'version=0.2.0\ndist-tag=latest\nprerelease=false\n');
    assert.deepEqual(asked, ['/tableau-ui-angular']);
  });

  test("passes a pre-release, under npm's next tag", async () => {
    const { code, output, written } = await check('v0.3.0-rc.1', { repoOptions: { version: '0.3.0-rc.1', text: changelog('## 0.3.0-rc.1 (2026-11-02)') } });
    assert.equal(code, 0, output);
    assert.equal(written, 'version=0.3.0-rc.1\ndist-tag=next\nprerelease=true\n');
  });

  test('fails a version npm has, and writes nothing', async () => {
    const { code, output, written } = await check('v0.2.0', { versions: ['0.1.129', '0.2.0'] });
    assert.equal(code, 1, output);
    assert.match(output, /release: npm already has tableau-ui-angular@0\.2\.0/);
    assert.equal(written, '');
  });

  test('fails a commit that is not on main', async () => {
    const { code, output } = await check('v0.2.0', { repoOptions: { main: 'parent' } });
    assert.equal(code, 1, output);
    assert.match(output, /release: the tagged commit [0-9a-f]{10} is not on main/);
  });

  test('fails when origin/main was not fetched', async () => {
    const { code, output } = await check('v0.2.0', { repoOptions: { main: 'none' } });
    assert.equal(code, 1, output);
    assert.match(output, /release: origin\/main is not in this clone/);
  });

  test('fails a tag that is not the package version, an undated section, and names both', async () => {
    const { code, output } = await check('v0.2.0', { repoOptions: { version: '0.1.130', text: changelog('## 0.2.0') } });
    assert.equal(code, 1, output);
    assert.match(output, /version is 0\.1\.130/);
    assert.match(output, /heading for 0\.2\.0 is "## 0\.2\.0"/);
    assert.match(output, /v0\.2\.0 is not released, for the 2 problem\(s\) above/);
  });

  test('fails a tag that is no version, without asking npm', async () => {
    const { code, output, asked } = await check('v0.2');
    assert.equal(code, 1, output);
    assert.match(output, /the tag v0\.2 is not v<version>/);
    assert.deepEqual(asked, []);
  });

  test('fails when the registry gives no answer', async () => {
    const closed = await registry([]);
    await closed.close();
    const done = await command(['check', 'v0.2.0'], { cwd: repo(), env: environment({ npm_config_registry: `${closed.url}/` }) });
    assert.equal(done.code, 1, done.output);
    assert.match(done.output, /npm view tableau-ui-angular@0\.2\.0 failed \(.+\), so whether npm has 0\.2\.0 is unknown/);
  });

  test('names each problem as a GitHub error under GitHub Actions', async () => {
    const { code, stderr } = await check('v0.2.0', { versions: ['0.2.0'], env: { GITHUB_ACTIONS: 'true' } });
    assert.equal(code, 1);
    assert.match(stderr, /^::error::npm already has tableau-ui-angular@0\.2\.0/m);
  });
});

/** GitHub's API for ci.yml's runs: each request gets the next answer, then the last one again. */
async function actionsApi(answers) {
  const requests = [];
  const server = createServer((request, response) => {
    requests.push({ url: new URL(request.url, 'http://127.0.0.1'), authorization: request.headers.authorization });
    const { status = 200, runs = [] } = answers[Math.min(requests.length - 1, answers.length - 1)];
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(status === 200 ? { total_count: runs.length, workflow_runs: runs } : { message: 'Resource not accessible by integration' }));
  });
  const url = await listen(server);
  return { url, requests, close: () => close(server) };
}

describe('node tools/release.mjs ci <commit>, against a stub GitHub API', () => {
  async function ci(answers, args = ['--poll', '0.01', '--grace', '0.05', '--wait', '5'], extra = {}) {
    const api = await actionsApi(answers);
    try {
      const env = environment({ GITHUB_API_URL: api.url, GITHUB_REPOSITORY: 'serionist/tableau-ui-angular', GH_TOKEN: 'test-token', ...extra });
      return { ...(await command(['ci', COMMIT, ...args], { cwd: scratch, env })), requests: api.requests };
    } finally {
      await api.close();
    }
  }

  test("asks for ci.yml's runs on the commit with the token, and passes on one that passed", async () => {
    const { code, output, requests } = await ci([{ runs: [run()] }]);
    assert.equal(code, 0, output);
    assert.match(output, /release: ci\.yml passed on aaaaaaaaaa, in the push run/);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url.pathname, '/repos/serionist/tableau-ui-angular/actions/workflows/ci.yml/runs');
    assert.equal(requests[0].url.searchParams.get('head_sha'), COMMIT);
    assert.equal(requests[0].authorization, 'Bearer test-token');
  });

  test('waits for a run still going, then passes', async () => {
    const { code, output, requests } = await ci([{ runs: [run({ status: 'in_progress', conclusion: null })] }, { runs: [run()] }]);
    assert.equal(code, 0, output);
    assert.match(output, /still running on aaaaaaaaaa: .*; asking again in 0 s/);
    assert.equal(requests.length, 2);
  });

  test("fails when only a pull request's run passed, once the grace is up", async () => {
    const { code, output } = await ci([{ runs: [run({ event: 'pull_request', head_branch: 'feature' })] }]);
    assert.equal(code, 1, output);
    assert.match(output, /release: no ci\.yml run on main for aaaaaaaaaa; the 1 run\(s\) found are pull requests' or other branches', after \d+ s$/m);
  });

  test('fails at once on a run that failed', async () => {
    const { code, output, requests } = await ci([{ runs: [run({ conclusion: 'failure' })] }]);
    assert.equal(code, 1, output);
    assert.match(output, /did not pass on aaaaaaaaaa: failure in/);
    assert.equal(requests.length, 1);
  });

  test('fails at once when GitHub refuses the token', async () => {
    const { code, output, requests } = await ci([{ status: 403 }]);
    assert.equal(code, 1, output);
    assert.match(output, /answered 403: .*Resource not accessible by integration/);
    assert.equal(requests.length, 1);
  });

  test('fails without a token', async () => {
    const { code, output } = await ci([{ runs: [run()] }], undefined, { GH_TOKEN: '' });
    assert.equal(code, 1, output);
    assert.match(output, /needs GITHUB_REPOSITORY and GH_TOKEN/);
  });

  for (const args of [['main'], [COMMIT.slice(0, 10)], [COMMIT, '--poll'], [COMMIT, '--wait', '-1']]) {
    test(`refuses ${args.join(' ')}`, async () => {
      const done = await command(['ci', ...args], { cwd: scratch, env: environment({ GITHUB_REPOSITORY: 'o/r', GH_TOKEN: 't' }) });
      assert.equal(done.code, 2, done.output);
      assert.match(done.output, /^usage:/);
    });
  }
});

describe('node tools/release.mjs notes <version>', () => {
  test("prints the version's section", async () => {
    const done = await command(['notes', '0.2.0'], { cwd: repo(), env: environment() });
    assert.equal(done.code, 0, done.output);
    assert.equal(done.stdout.trim(), '### Fixed\n\n- A fix.');
  });

  test('fails for a version with no section', async () => {
    const done = await command(['notes', '0.3.0'], { cwd: repo(), env: environment() });
    assert.equal(done.code, 1, done.output);
    assert.match(done.stderr, /CHANGELOG\.md has no single section with lines for 0\.3\.0/);
  });
});
