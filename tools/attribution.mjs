// Tool attribution: the lines a tool adds to say it wrote a change. Nothing on main carries them (AGENTS.md, Commits
// and PRs). The commit-msg hook refuses a message with one, and the gate checks every commit it is given, both through
// attributionLines, so the two never disagree. Case never matters.
//
// Each pattern matches the line a tool writes, so a sentence about Claude, or a person named Claude, passes. A line may
// start behind symbols ("🤖 ", "- ", "# "): git keeps comment lines in a message given with -m.

// The names a "Generated with" line gives. Cursor and Devin count only with the word that makes them the tool: alone
// they are a CSS property, an editor's caret and a first name.
const TOOLS = String.raw`claude|anthropic|codex|openai|chatgpt|gpt-?\d\w*|copilot|gemini|aider|windsurf|devin[\s-]+ai|cursor\s*(?:agent|ai|ide)|cursoragent|cursor\.com`;
// Any `<word>-by:` trailer: Co-authored-by, and Assisted-by or Generated-by, which some tools write instead.
const BY_TRAILER = /^\W*((?:[a-z]+-)*[a-z]+-by)\s*:\s*(.*?)\s*$/i;
const WHO = /^([^<>]*?)\s*(?:<([^<>]*)>)?$/;
// A trailer names a tool by its address, or by a name that is a tool's alone or with a model and a version ("Claude",
// "Claude Opus 5.5", "Claude Code Action", "GitHub Copilot", "aider (gpt-4o)"). "Claude Martin" is a person.
const TOOL_EMAIL = /(?:@anthropic\.com|@openai\.com|@cursor\.com|@aider\.chat|\+copilot@users\.noreply\.github\.com)$/i;
const TOOL_NAME = new RegExp(
  String.raw`^(?:claude(?:\s+code)?|anthropic|(?:openai\s+)?codex|chatgpt|gpt-?\d[\w.]*|(?:github\s+)?copilot|gemini(?:\s+code\s+assist)?|cursor(?:\s+agent)?|devin[\s-]+ai|aider|windsurf)` +
    String.raw`(?:\s+(?:opus|sonnet|haiku|code|cli|pro|flash|ultra|nano|mini|turbo|max|agent|ai|assist|action|codex|preview|latest|thinking|v?\d[\w.]*|\([^()]*\)))*$`,
  'i',
);
// Any GitHub bot is a tool, by its address or by its `<login>[bot]` name, unless it is one of the bots GitHub names a
// co-author when a person pushes onto their PR, under that bot's own name and address. So a new AI review bot, whose
// "Commit suggestion" button writes such a trailer, is refused without anyone adding it here.
const BOT_EMAIL = /^(?:\d+\+)?([^@\s]*)\[bot\]@users\.noreply\.github\.com$/i;
const BOT_NAME = /^([^\s[\]]+)\[bot\]$/i;
const NON_AI_BOTS = new Set(['dependabot', 'github-actions', 'renovate']);
const GENERATED = new RegExp(String.raw`^\W*(?:generated|created|written|authored|produced|assisted|made)\s+(?:with|by|using|via|in)\b.*?\b(?:${TOOLS})\b`, 'i');
const TOOL_TRAILER = /^\W*(?:claude|anthropic|codex|openai|chatgpt|copilot|gemini)-[\w-]+\s*:/i;
const SESSION_LINK = /(?:https?:\/\/)?(?:www\.)?(?:claude\.ai\/(?:code|chat|share)\b|chatgpt\.com\/(?:codex|share|c)\/)/i;
// git splits a message on LF; a bare CR is split too, so no line can hide behind one.
const LINE_BREAK = /\r\n?|\n/;

// The line above the diff `git commit -v` adds. git drops it and what follows only for -v, commit.verbose or
// --cleanup=scissors, none of which a hook can see, so below it only the lines a diff can't hold are read.
const SCISSORS = /^\S+ -{24} >8 -{24}\s*$/;
const DIFF_LINE = /^(?:[-+ ]|@@|diff --git |index |(?:old|new|new file|deleted file) mode |(?:dis)?similarity index |(?:rename|copy) (?:from|to) |Binary files |\\ No newline)/;

/** True when a trailer's `Name <email>` is a tool. */
export function toolCoAuthor(who) {
  const match = WHO.exec(who.trim());
  if (!match) return false;
  const name = match[1].trim();
  const email = (match[2] ?? '').trim();
  const bot = BOT_EMAIL.exec(email);
  if (bot) return !(NON_AI_BOTS.has(bot[1].toLowerCase()) && name.toLowerCase() === `${bot[1].toLowerCase()}[bot]`);
  const namedBot = BOT_NAME.exec(name);
  if (namedBot && !NON_AI_BOTS.has(namedBot[1].toLowerCase())) return true;
  return TOOL_EMAIL.test(email) || TOOL_NAME.test(name);
}

/** The lines of a commit message, PR title or body that carry tool attribution, trimmed. */
export function attributionLines(message) {
  return message
    .split(LINE_BREAK)
    .filter(line => {
      const trailer = BY_TRAILER.exec(line);
      return (trailer && toolCoAuthor(trailer[2])) || GENERATED.test(line) || TOOL_TRAILER.test(line) || SESSION_LINK.test(line);
    })
    .map(line => line.trim());
}

/** A commit-msg file as far as git may record it: every line above a scissors line, and below it every line a diff can't hold. */
export function messageText(raw) {
  const kept = [];
  let below = false;
  for (const line of raw.split(LINE_BREAK)) {
    if (!below && SCISSORS.test(line)) below = true;
    else if (!(below && DIFF_LINE.test(line))) kept.push(line);
  }
  return kept.join('\n').trim();
}
