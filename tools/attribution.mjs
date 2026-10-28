// Tool attribution: the lines a tool adds to say it wrote a change. Nothing on main carries them (AGENTS.md, Commits
// and PRs). The commit-msg hook refuses a message with one, and the gate checks every commit on the branch, both
// through attributionLines, so the two never disagree. Case never matters.
//
// Each pattern matches the line a tool writes, so a sentence about Claude, or a person named Claude, passes. A line may
// start behind symbols ("🤖 ", "- ", "# "): git keeps comment lines in a message given with -m.

const TOOLS = String.raw`claude|anthropic|codex|openai|chatgpt|copilot|gemini|cursor|aider|devin|windsurf`;
const CO_AUTHOR = /^\W*co-authored-by\s*:\s*(.*?)\s*$/i;
const WHO = /^([^<>]*?)\s*(?:<([^<>]*)>)?$/;
// A co-author is a tool by its address, or by a name that is a tool's alone or with a model and a version ("Claude",
// "Claude Opus 5.5", "GitHub Copilot", "claude[bot]"). "Claude Martin" is a person.
const TOOL_EMAIL = /(?:@anthropic\.com|@openai\.com|@cursor\.com|@aider\.chat|\+copilot@users\.noreply\.github\.com)$/i;
const TOOL_NAME = new RegExp(
  String.raw`^(?:github\s+)?(?:${TOOLS}|gpt-?\d[\w.]*)(?:\[bot\])?` + String.raw`(?:\s+(?:code|opus|sonnet|haiku|cli|agent|ai|assist|pro|flash|mini|max|preview|v?\d[\w.]*|\([^()]*\)))*$`,
  'i',
);
const GENERATED = new RegExp(String.raw`^\W*(?:generated|created|written|authored|produced|assisted|made)\s+(?:with|by|using|via|in)\b.*?\b(?:${TOOLS})\b`, 'i');
const GENERATED_ANYWHERE = /\bgenerated\s+(?:with|by)\s+\[?claude\s+code\b/i;
const TOOL_TRAILER = new RegExp(String.raw`^\W*(?:${TOOLS})-[\w-]+\s*:`, 'i');
const SESSION_LINK = /(?:https?:\/\/)?(?:www\.)?(?:claude\.ai\/(?:code|chat|share)\b|chatgpt\.com\/(?:codex|share|c)\/)/i;

// The line above the diff `git commit -v` adds. git drops it and what follows only for -v, commit.verbose or
// --cleanup=scissors, none of which a hook can see, so below it only the lines a diff can't hold are read.
const SCISSORS = /^\S+ -{24} >8 -{24}\s*$/;
const DIFF_LINE = /^(?:[-+ ]|@@|diff --git |index |(?:old|new|new file|deleted file) mode |(?:dis)?similarity index |(?:rename|copy) (?:from|to) |Binary files |\\ No newline)/;

/** True when a Co-authored-by trailer's `Name <email>` is a tool. */
export function toolCoAuthor(who) {
  const match = WHO.exec(who.trim());
  if (!match) return false;
  const [, name, email = ''] = match;
  return TOOL_EMAIL.test(email.trim()) || TOOL_NAME.test(name.trim());
}

/** The lines of a commit message, PR title or body that carry tool attribution, trimmed. */
export function attributionLines(message) {
  return message
    .split(/\r?\n/)
    .filter(line => {
      const coAuthor = CO_AUTHOR.exec(line);
      return (coAuthor && toolCoAuthor(coAuthor[1])) || GENERATED.test(line) || GENERATED_ANYWHERE.test(line) || TOOL_TRAILER.test(line) || SESSION_LINK.test(line);
    })
    .map(line => line.trim());
}

/** A commit-msg file as far as git may record it: every line above a scissors line, and below it every line a diff can't hold. */
export function messageText(raw) {
  const kept = [];
  let below = false;
  for (const line of raw.split(/\r?\n/)) {
    if (!below && SCISSORS.test(line)) below = true;
    else if (!(below && DIFF_LINE.test(line))) kept.push(line);
  }
  return kept.join('\n').trim();
}
