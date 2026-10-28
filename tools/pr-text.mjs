// The PR text check, which pr-text.yml runs: a squash merge makes the PR's title and description the commit on main,
// so neither carries tool attribution (AGENTS.md, Commits and PRs), and the description names the issue. The lines
// refused are attributionLines', the same as the commit-msg hook's and the gate's.
//
// Usage: node tools/pr-text.mjs <event file>
//
// The event file is the JSON GitHub writes for a pull_request event ($GITHUB_EVENT_PATH). It prints each problem and
// exits 1 when there is one.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { attributionLines } from './attribution.mjs';

// An issue: `#24`, `Refs #24`, `Closes #24`, `Fixes #24`. The `#` stands on its own, so an HTML entity (`&#39;`), a
// URL's fragment (`page#24`) and another repository's issue (`owner/repo#24`) don't count.
const ISSUE = /(?<![\w&/#])#\d+\b/;
// The template's guidance sits in HTML comments, which the PR page doesn't show, so an issue named only there is none.
const HTML_COMMENT = /<!--[\s\S]*?(?:-->|$)/g;

/** What is wrong with a PR's title and description: each attribution line, and a description that names no issue. */
export function prTextProblems(title, body) {
  const problems = [];
  for (const [where, text] of [
    ['title', title],
    ['description', body],
  ]) {
    problems.push(...attributionLines(text).map(line => `tool attribution in the ${where}: ${line}`));
  }
  if (!ISSUE.test(body.replace(HTML_COMMENT, ''))) problems.push('the description names no issue: end it with Refs #<n> or Closes #<n>');
  return problems;
}

function main(args) {
  if (args.length !== 1) {
    console.error('usage: node tools/pr-text.mjs <event file>');
    return 2;
  }
  const pr = JSON.parse(readFileSync(args[0], 'utf8')).pull_request;
  if (!pr) {
    console.error(`${args[0]} holds no pull_request: the check runs on a pull_request event`);
    return 2;
  }
  const problems = prTextProblems(pr.title ?? '', pr.body ?? '');
  for (const problem of problems) console.error(`PR text: ${problem}`);
  if (problems.length) {
    console.error('PR text: edit the title or the description, and the check runs again (AGENTS.md, Commits and PRs)');
    return 1;
  }
  console.log('PR text: no tool attribution, and the description names an issue');
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
