// The PR text check, which pr-text.yml runs: a squash merge makes the PR's title and description the commit on main,
// so neither carries tool attribution (AGENTS.md, Commits and PRs), and the description names its issue with
// `Refs #<n>`, `Closes #<n>` or `Fixes #<n>`. The lines refused are attributionLines', the same as the commit-msg
// hook's and the gate's.
//
// Usage: node tools/pr-text.mjs <event file>
//        node tools/pr-text.mjs --text <file>
//
// The event file is the JSON GitHub writes for a pull_request event ($GITHUB_EVENT_PATH). With --text the file is a
// commit message's text, such as the squash body finish-work writes to .local/squash.md, checked as a description is.
// It prints each problem and exits 1 when there is one.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { attributionLines } from './attribution.mjs';

// The issue, as AGENTS.md says a description ends: `Refs #24`, `Closes #24`, `Fixes #24`, in any case. A `#24` in a
// sentence is a mention, not the issue the commit belongs to.
const ISSUE = /\b(?:refs|closes|fixes)[ \t]+#\d+\b/i;
// The same word with no number, as the PR template leaves it: the squash commit would end with it.
const BARE = /\b(refs|closes|fixes)[ \t]+#(?!\d)/gi;
// What GitHub doesn't read as a reference: an HTML comment, where the template's guidance sits and which the PR page
// doesn't show, and code, a fenced block or a span, where a PR about these rules quotes them.
const NOT_REFERENCES = /<!--[\s\S]*?(?:-->|$)|```[\s\S]*?(?:```|$)|~~~[\s\S]*?(?:~~~|$)|`[^`\n]*`/g;

/** What is wrong with a PR's title and description: each attribution line, a bare reference, no issue named. */
export function prTextProblems(title, body) {
  const problems = [];
  for (const [where, text] of [
    ['title', title],
    ['description', body],
  ]) {
    problems.push(...attributionLines(text).map(line => `tool attribution in the ${where}: ${line}`));
  }
  const shown = body.replace(NOT_REFERENCES, '');
  for (const [, word] of shown.matchAll(BARE)) problems.push(`the description has a bare "${word} #": give it the issue's number`);
  if (!ISSUE.test(shown)) problems.push('the description names no issue: end it with Refs #<n> or Closes #<n>');
  return problems;
}

/** The title and description to check: a pull_request event's, or with --text a plain file's, as a description. */
function readText(args) {
  if (args.length === 2 && args[0] === '--text') return { title: '', body: readFileSync(args[1], 'utf8') };
  if (args.length !== 1 || args[0].startsWith('--')) return { problem: 'usage: node tools/pr-text.mjs <event file> | --text <file>' };
  const pr = JSON.parse(readFileSync(args[0], 'utf8')).pull_request;
  if (!pr) return { problem: `${args[0]} holds no pull_request: the check runs on a pull_request event` };
  return { title: pr.title ?? '', body: pr.body ?? '' };
}

function main(args) {
  const { title, body, problem } = readText(args);
  if (problem) {
    console.error(problem);
    return 2;
  }
  const problems = prTextProblems(title, body);
  for (const line of problems) console.error(`PR text: ${line}`);
  if (problems.length) {
    console.error('PR text: edit the text, and check it again (AGENTS.md, Commits and PRs)');
    return 1;
  }
  console.log('PR text: no tool attribution, and the issue named');
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
