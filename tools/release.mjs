// The release's checks, which release.yml runs on a v* tag before anything is published (docs/releasing.md). Each
// prints what is wrong and exits 1, so a tag that fails one publishes nothing.
//
// Usage, from the repo's root:
//   node tools/release.mjs check <tag>
//   node tools/release.mjs ci <commit> [--poll <seconds>] [--wait <seconds>] [--grace <seconds>]
//   node tools/release.mjs notes <version>
//
// check: the tag is v<version>, a semver version; projects/component-library/package.json, the one version, has it;
//   CHANGELOG.md has its section, headed `## <version> (YYYY-MM-DD)` with a real date, with lines under it; the tagged
//   commit, HEAD, is on origin/main; and npm has no tableau-ui-angular@<version> yet (`npm view`). Under GitHub
//   Actions it writes version, dist-tag (latest, or next for a pre-release) and prerelease to $GITHUB_OUTPUT.
// ci: a ci.yml run on main for <commit>, from a push, the daily schedule or a manual run, concluded success; a pull
//   request's run tests another commit, a merge with the base. It reads the runs from GitHub's API ($GITHUB_API_URL,
//   $GITHUB_REPOSITORY, $GH_TOKEN) every --poll seconds (30), and waits while one is still running, up to --wait
//   seconds (2700), or while there is none yet, up to --grace seconds (300).
// notes: prints the version's CHANGELOG.md section without its heading: the GitHub release's notes.
//
// Node only, no dependencies, so the jobs that run it need no npm ci.

import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PACKAGE_NAME = 'tableau-ui-angular';
export const PACKAGE_FILE = 'projects/component-library/package.json';
export const CHANGELOG_FILE = 'CHANGELOG.md';
const MAIN = 'origin/main';
// semver.org's pattern without build metadata, which npm drops from a published version
const SEMVER = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?$/;
const COMMIT = /^[0-9a-f]{40}$/;
// The runs that test the tagged commit itself, on main
const CI_EVENTS = new Set(['push', 'schedule', 'workflow_dispatch']);

/** The version a tag names: v<version>, with a semver version. */
export function versionFromTag(tag) {
  const version = tag.startsWith('v') ? tag.slice(1) : null;
  if (version !== null && SEMVER.test(version)) return { version };
  return { problem: `the tag ${tag} is not v<version>: a release's tag is v and the version, such as v0.2.0` };
}

/** A pre-release has a part after a hyphen, such as 0.3.0-rc.1: npm's next tag, and a GitHub pre-release. */
export const isPrerelease = version => version.includes('-');

/** Each `## ` section of a changelog that is the version's, with its heading and the lines up to the next one. */
function sections(text, version) {
  const lines = text.split(/\r?\n/);
  const found = [];
  let current = null;
  for (const line of lines) {
    if (/^## /.test(line)) {
      current = null;
      const first = line
        .slice(3)
        .trim()
        .split(/\s+/)[0]
        .replace(/^\[(.*)\]$/, '$1');
      if (first === version) found.push((current = { heading: line.trimEnd(), body: [] }));
    } else if (current) {
      current.body.push(line);
    }
  }
  return found.map(({ heading, body }) => ({ heading, body: body.join('\n').trim() }));
}

const isDate = text => {
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text;
};

/** What is wrong with a changelog's section for the version: none, more than one, undated, or empty. */
export function changelogProblems(text, version) {
  const found = sections(text, version);
  const wanted = `## ${version} (YYYY-MM-DD)`;
  if (!found.length) return [`${CHANGELOG_FILE} has no section for ${version}: its Unreleased heading becomes ${wanted} in the version's PR`];
  if (found.length > 1) return [`${CHANGELOG_FILE} has ${found.length} sections for ${version}: keep one`];
  const [{ heading, body }] = found;
  const problems = [];
  // a fixed pattern, and the version compared as text, so nothing in it is read as a pattern
  const dated = /^## (\S+) \((\d{4}-\d{2}-\d{2})\)$/.exec(heading);
  const date = dated?.[1] === version ? dated[2] : null;
  if (!date) problems.push(`${CHANGELOG_FILE}'s heading for ${version} is "${heading}"; a release's reads ${wanted}`);
  else if (!isDate(date)) problems.push(`${CHANGELOG_FILE}'s heading for ${version} has ${date}, which is no date`);
  if (!body) problems.push(`${CHANGELOG_FILE}'s section for ${version} is empty, and its lines are the release's notes`);
  return problems;
}

/** The version's changelog section without its heading, or null when there is not exactly one. */
export function releaseNotes(text, version) {
  const found = sections(text, version);
  return found.length === 1 && found[0].body ? found[0].body : null;
}

/**
 * Whether npm has the version, from what `npm view <name>@<version> version --json` did: the version printed when it
 * has it; an E404, or nothing printed by an older npm, when it doesn't. Anything else is no answer, so it stops the
 * release instead of letting it through.
 */
export function npmViewVerdict({ status, stdout = '', stderr = '' }, version) {
  let printed = null;
  try {
    printed = stdout.trim() ? JSON.parse(stdout) : '';
  } catch {
    printed = null;
  }
  if (status === 0 && (printed === version || (Array.isArray(printed) && printed.includes(version)))) return { published: true };
  if (status === 0 && printed === '') return { published: false };
  if (status !== 0 && (printed?.error?.code === 'E404' || /^npm (?:ERR!|error) code E404\b/m.test(stderr))) return { published: false };
  const said = printed?.error?.summary ?? stderr.split(/\r?\n/).find(line => line.trim()) ?? `exit ${status}`;
  return { problem: `npm view ${PACKAGE_NAME}@${version} failed (${said.trim()}), so whether npm has ${version} is unknown: run the job again` };
}

/**
 * What stops a tag's release: the tag, the package's version, the changelog, main, and npm. Each input is what the
 * command read, so a test can give any of them.
 */
export function tagProblems({ tag, packageVersion, changelog, onMain, npmView }) {
  const problems = [];
  const { version, problem } = versionFromTag(tag);
  if (problem) problems.push(problem);
  if (!packageVersion || !SEMVER.test(packageVersion)) problems.push(`${PACKAGE_FILE} has no semver version: "${packageVersion ?? ''}"`);
  else if (version && version !== packageVersion) {
    problems.push(`the tag is ${tag}, but ${PACKAGE_FILE}'s version is ${packageVersion}: bump the version in a PR first, and tag its merge`);
  }
  if (onMain.problem) problems.push(onMain.problem);
  if (!version) return problems;
  problems.push(...changelogProblems(changelog, version));
  if (npmView.problem) problems.push(npmView.problem);
  else if (npmView.published) problems.push(`npm already has ${PACKAGE_NAME}@${version}, and a version is published once: release the next one`);
  return problems;
}

/**
 * Where ci.yml stands on the commit: `pass` with a run that concluded success; `running` while one is still going;
 * `none` with no run on main for it yet; `fail` when every run finished without success. Pull requests' runs and
 * other branches' don't count.
 */
export function ciVerdict(runs, commit) {
  const short = commit.slice(0, 10);
  const counted = runs.filter(run => run.head_sha === commit && run.head_branch === 'main' && CI_EVENTS.has(run.event));
  const passed = counted.find(run => run.status === 'completed' && run.conclusion === 'success');
  if (passed) return { state: 'pass', detail: `ci.yml passed on ${short}, in the ${passed.event} run ${passed.html_url}` };
  const running = counted.filter(run => run.status !== 'completed');
  if (running.length) return { state: 'running', detail: `ci.yml is still running on ${short}: ${running.map(run => run.html_url).join(', ')}` };
  if (!counted.length) {
    const others = runs.length ? `; the ${runs.length} run(s) found are pull requests' or other branches'` : '';
    return { state: 'none', detail: `no ci.yml run on main for ${short}${others}` };
  }
  const done = counted.map(run => `${run.conclusion} in ${run.html_url}`).join(', ');
  return { state: 'fail', detail: `ci.yml did not pass on ${short}: ${done}. Re-run it, then this job` };
}

const seconds = ms => `${Math.round(ms / 1000)} s`;

/**
 * Asks for ci.yml's runs on the commit until one passed (ok), every one failed, or the time is up: --wait while one
 * is running, --grace while there is none. A request that failed with no HTTP answer or a 5xx is asked again; a 4xx
 * (a token without actions: read, a wrong repository) stops at once.
 */
export async function waitForCi({ listRuns, commit, pollMs, waitMs, graceMs, now = () => Date.now(), sleep = ms => new Promise(done => setTimeout(done, ms)), log = console.log }) {
  const started = now();
  for (;;) {
    let verdict;
    try {
      verdict = ciVerdict(await listRuns(), commit);
    } catch (error) {
      if (error.retry === false) return { ok: false, detail: error.message };
      verdict = { state: 'running', detail: `asking for ci.yml's runs failed: ${error.message}` };
    }
    if (verdict.state === 'pass') return { ok: true, detail: verdict.detail };
    if (verdict.state === 'fail') return { ok: false, detail: verdict.detail };
    const elapsed = now() - started;
    if (elapsed >= (verdict.state === 'running' ? waitMs : graceMs)) return { ok: false, detail: `${verdict.detail}, after ${seconds(elapsed)}` };
    log(`${verdict.detail}; asking again in ${seconds(pollMs)}`);
    await sleep(pollMs);
  }
}

// The commands

const say = problem => console.error(process.env.GITHUB_ACTIONS === 'true' ? `::error::${problem}` : `release: ${problem}`);

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function git(...args) {
  const done = spawnSync('git', args, { encoding: 'utf8', windowsHide: true });
  return { status: done.status, output: `${done.stdout ?? ''}${done.stderr ?? ''}`.trim() };
}

/** Whether HEAD is on origin/main, which the checkout must have fetched. */
function onMain() {
  if (git('rev-parse', '--verify', '--quiet', `${MAIN}^{commit}`).status !== 0) return { problem: `${MAIN} is not in this clone: the checkout fetches it with fetch-depth: 0` };
  const head = git('rev-parse', '--verify', 'HEAD^{commit}').output;
  const { status, output } = git('merge-base', '--is-ancestor', 'HEAD', MAIN);
  if (status === 0) return {};
  if (status === 1) return { problem: `the tagged commit ${head.slice(0, 10)} is not on main: a release is tagged on a commit of main` };
  return { problem: `git merge-base --is-ancestor HEAD ${MAIN} failed: ${output}` };
}

/** `npm view <name>@<version> version --json`; npm is a .cmd on Windows, which runs only through a shell. */
function npmView(version) {
  const args = ['view', `${PACKAGE_NAME}@${version}`, 'version', '--json'];
  // the version passed the semver pattern, so it holds only letters, digits, dots and hyphens
  const done = process.platform === 'win32' ? spawnSync(['npm', ...args].join(' '), { shell: true, encoding: 'utf8', windowsHide: true }) : spawnSync('npm', args, { encoding: 'utf8' });
  return npmViewVerdict({ status: done.status, stdout: done.stdout ?? '', stderr: `${done.stderr ?? ''}${done.error ? done.error.message : ''}` }, version);
}

function check([tag]) {
  if (!tag) return usage();
  const { version } = versionFromTag(tag);
  const problems = tagProblems({
    tag,
    packageVersion: readJson(PACKAGE_FILE)?.version,
    changelog: existsSync(CHANGELOG_FILE) ? readFileSync(CHANGELOG_FILE, 'utf8') : '',
    onMain: onMain(),
    npmView: version ? npmView(version) : {},
  });
  for (const problem of problems) say(problem);
  if (problems.length) {
    console.error(`release: ${tag} is not released, for the ${problems.length} problem(s) above. docs/releasing.md says what to do.`);
    return 1;
  }
  const distTag = isPrerelease(version) ? 'next' : 'latest';
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\ndist-tag=${distTag}\nprerelease=${isPrerelease(version)}\n`);
  console.log(`release: ${tag} is on main and is ${PACKAGE_FILE}'s version; ${CHANGELOG_FILE} has its dated section; npm has no ${version} yet. It publishes under npm's ${distTag} tag.`);
  return 0;
}

function option(args, name, fallback) {
  const at = args.indexOf(name);
  if (at < 0) return fallback;
  const value = Number(args[at + 1]);
  return Number.isFinite(value) && value >= 0 ? value : NaN;
}

async function ci(args) {
  const [commit] = args;
  const [poll, wait, grace] = [option(args, '--poll', 30), option(args, '--wait', 2700), option(args, '--grace', 300)];
  if (!commit || !COMMIT.test(commit) || [poll, wait, grace].some(Number.isNaN)) return usage();
  const { GITHUB_API_URL: api = 'https://api.github.com', GITHUB_REPOSITORY: repo, GH_TOKEN: token } = process.env;
  if (!repo || !token) {
    say('ci needs GITHUB_REPOSITORY and GH_TOKEN, a token with actions: read');
    return 1;
  }
  const url = `${api}/repos/${repo}/actions/workflows/ci.yml/runs?head_sha=${commit}&per_page=100`;
  const listRuns = async () => {
    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' } });
    if (!response.ok) {
      const error = new Error(`GET ${url} answered ${response.status}: ${(await response.text()).slice(0, 200)}`);
      error.retry = response.status >= 500;
      throw error;
    }
    return (await response.json()).workflow_runs ?? [];
  };
  const { ok, detail } = await waitForCi({ listRuns, commit, pollMs: poll * 1000, waitMs: wait * 1000, graceMs: grace * 1000 });
  if (ok) console.log(`release: ${detail}`);
  else say(detail);
  return ok ? 0 : 1;
}

function notes([version]) {
  if (!version) return usage();
  const text = releaseNotes(existsSync(CHANGELOG_FILE) ? readFileSync(CHANGELOG_FILE, 'utf8') : '', version);
  if (text === null) {
    say(`${CHANGELOG_FILE} has no single section with lines for ${version}`);
    return 1;
  }
  console.log(text);
  return 0;
}

function usage() {
  console.error('usage: node tools/release.mjs check <tag> | ci <commit> [--poll <s>] [--wait <s>] [--grace <s>] | notes <version>');
  return 2;
}

async function main([command, ...args]) {
  if (command === 'check') return check(args);
  if (command === 'ci') return ci(args);
  if (command === 'notes') return notes(args);
  return usage();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
