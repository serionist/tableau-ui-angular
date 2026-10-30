// The public API file: each entry point's built typings, without private and protected members, committed as
// projects/component-library/api/<entry>.d.ts. Through Angular's declarations (ɵcmp, ɵdir, ɵpipe, ɵmod) it holds each
// component's selector, inputs and outputs, beside every export. A change to it is named in the PR (AGENTS.md).
//
// Usage: node tools/api.mjs update|check
//
// Both read the built package, dist/component-library, which `npm run build:component-library` writes: its
// package.json's exports name each entry point's typings. update writes the API files, and `npm run api:update` builds
// the library first. check writes them into a temp folder and compares them with the committed ones: it prints a
// unified diff of each difference and exits 1 on one. The gate's full lane runs check after its library build.
//
// The files are the same on every machine and OS: each is printed by the TypeScript compiler from its syntax tree,
// with no comments and its top-level statements sorted, then formatted by Prettier with the repo's settings, with LF
// whatever line endings the build's typings had. An exported abstract class keeps its protected members, since an app
// that extends it implements and calls them; so does a protected input or output, since a parent binds it and Angular
// checks the binding against the member's type.

import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const API_DIR = 'projects/component-library/api';
export const DIST_DIR = 'dist/component-library';
const UPDATE = 'npm run api:update';

/**
 * Each entry point of the built package's `packageJson` that has typings, sorted by name: `{ name, path, types }`,
 * where `name` is the folder (the package's own name for the root), `path` what apps import, `types` the typings file.
 */
export function entryPoints(packageJson) {
  return Object.entries(packageJson.exports ?? {})
    .filter(([, target]) => typeof target?.types === 'string')
    .map(([key, target]) => {
      const name = key === '.' ? packageJson.name : key.replace(/^\.\//, '');
      return { name, path: key === '.' ? packageJson.name : `${packageJson.name}/${name}`, types: target.types };
    })
    .sort((a, b) => compareText(a.name, b.name));
}

// Code-unit order, never the locale's, so every machine sorts alike
const compareText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const hasModifier = (node, kind) => (ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined)?.some(modifier => modifier.kind === kind) ?? false;

/** The names a typings file exports: those declared with `export`, and those in an `export { }` list. */
function exportedNames(file) {
  const names = new Set();
  for (const statement of file.statements) {
    if (ts.isExportDeclaration(statement) && !statement.moduleSpecifier && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) names.add((element.propertyName ?? element.name).text);
    } else if (hasModifier(statement, ts.SyntaxKind.ExportKeyword) && statement.name && ts.isIdentifier(statement.name)) {
      names.add(statement.name.text);
    }
  }
  return names;
}

const memberName = member => (member.name && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)) ? member.name.text : null);

/**
 * The members a class's Angular declaration (`ɵcmp`, `ɵdir`) names as inputs or outputs: the keys of its type
 * arguments 3 and 4. A parent may bind a protected one, and Angular checks the binding against the member's type.
 */
function boundMembers(node) {
  const names = new Set();
  for (const member of node.members) {
    if (!['ɵcmp', 'ɵdir'].includes(memberName(member)) || !member.type || !ts.isTypeReferenceNode(member.type)) continue;
    for (const literal of (member.type.typeArguments ?? []).slice(3, 5).filter(ts.isTypeLiteralNode)) {
      for (const key of literal.members) if (memberName(key)) names.add(memberName(key));
    }
  }
  return names;
}

/**
 * Whether a class member is left out: a private one (`private x`, `#private`), and a protected one unless `keepProtected`
 * or it is an input or an output, which `bound` names. A constructor stays whatever its modifier, since a private or
 * protected one says how apps may create the class.
 */
function isHidden(member, keepProtected, bound) {
  if (ts.isConstructorDeclaration(member)) return false;
  if (member.name && ts.isPrivateIdentifier(member.name)) return true;
  if (hasModifier(member, ts.SyntaxKind.PrivateKeyword)) return true;
  return hasModifier(member, ts.SyntaxKind.ProtectedKeyword) && !keepProtected && !bound.has(memberName(member));
}

/** Where a top-level statement sorts: imports first, by module, then declarations by name, then export lists. */
function sortKey(statement, printed) {
  if (ts.isImportDeclaration(statement)) return [0, `${statement.moduleSpecifier.text}\0${printed}`];
  if (ts.isImportEqualsDeclaration(statement)) return [0, printed];
  if (ts.isExportDeclaration(statement) || ts.isExportAssignment(statement)) return [2, printed];
  if (ts.isVariableStatement(statement)) return [1, statement.declarationList.declarations[0]?.name.getText() ?? ''];
  return [1, statement.name?.text ?? ''];
}

/**
 * A typings file's public declarations as text, before formatting: every statement, each class without its private
 * and protected members (an exported abstract class keeps its protected ones, and a protected input or output stays),
 * no comments, the top-level statements in a stable order. Declaration order means nothing in a typings file, so the
 * sort changes no meaning.
 */
export function publicDeclarations(text) {
  const file = ts.createSourceFile('api.d.ts', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const exported = exportedNames(file);
  const hideMembers = context => {
    const visit = node => {
      if (!ts.isClassDeclaration(node)) return ts.visitEachChild(node, visit, context);
      const keepProtected = hasModifier(node, ts.SyntaxKind.AbstractKeyword) && Boolean(node.name && exported.has(node.name.text));
      const bound = boundMembers(node);
      const members = node.members.filter(member => !isHidden(member, keepProtected, bound));
      return ts.factory.updateClassDeclaration(node, node.modifiers, node.name, node.typeParameters, node.heritageClauses, members);
    };
    return root => ts.visitNode(root, visit);
  };
  const result = ts.transform(file, [hideMembers]);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true });
  const statements = result.transformed[0].statements
    .map((statement, at) => {
      const printed = printer.printNode(ts.EmitHint.Unspecified, statement, file);
      return { key: sortKey(file.statements[at], printed), printed };
    })
    .sort((a, b) => a.key[0] - b.key[0] || compareText(a.key[1], b.key[1]));
  result.dispose();
  // A blank line between statements, but not between two imports
  return `${statements.map(({ key, printed }, at) => (at && !(key[0] === 0 && statements[at - 1].key[0] === 0) ? `\n${printed}` : printed)).join('\n')}\n`;
}

/** The API file of the entry point `entry` (from entryPoints) whose typings are `text`, formatted as the repo's code. */
export async function apiFile(entry, text) {
  const header = `// The public API of ${entry.path}, from its built typings. ${UPDATE} writes it; a change to it is named in the PR.\n\n`;
  const filepath = join(ROOT, API_DIR, `${entry.name}.d.ts`);
  const options = await prettier.resolveConfig(filepath, { editorconfig: true });
  return prettier.format(header + publicDeclarations(text), { ...options, filepath });
}

/** Every entry point's API file from the built package in `distDir`, as a Map of file name to text. */
export async function buildApi(distDir) {
  const packageJson = JSON.parse(readFileSync(join(distDir, 'package.json'), 'utf8'));
  const entries = entryPoints(packageJson);
  // An update from none would delete every committed file
  if (!entries.length) throw new Error(`${join(distDir, 'package.json')} names no entry point with typings in its exports`);
  const files = new Map();
  for (const entry of entries) files.set(`${entry.name}.d.ts`, await apiFile(entry, readFileSync(join(distDir, entry.types), 'utf8')));
  return files;
}

/** The API files in `dir`, as a Map of file name to text; none when the folder is missing. */
export function readApi(dir) {
  let names = [];
  try {
    names = readdirSync(dir).filter(name => name.endsWith('.d.ts'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return new Map(names.sort(compareText).map(name => [name, readFileSync(join(dir, name), 'utf8')]));
}

/** Writes `files` into `dir`, as its only API files. */
export function writeApi(dir, files) {
  mkdirSync(dir, { recursive: true });
  for (const name of readApi(dir).keys()) if (!files.has(name)) rmSync(join(dir, name));
  for (const [name, text] of files) writeFileSync(join(dir, name), text);
}

/**
 * A unified diff of `before` and `after`, the lines of one file, with three lines of context: '' when they are equal.
 * A file that is missing on one side is null there, and shows as /dev/null.
 */
export function unifiedDiff(name, before, after) {
  if (before === after) return '';
  const a = before === null ? [] : before.replace(/\n$/, '').split('\n');
  const b = after === null ? [] : after.replace(/\n$/, '').split('\n');
  // The longest common subsequence of what lies between the shared first and last lines: lcs[i * width + j] is its
  // length from a[i] and b[j] on.
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) [endA, endB] = [endA - 1, endB - 1];
  const width = endB - start + 1;
  const lcs = new Uint32Array((endA - start + 1) * width);
  for (let i = endA - 1; i >= start; i--) {
    for (let j = endB - 1; j >= start; j--) {
      const at = (i - start) * width + (j - start);
      lcs[at] = a[i] === b[j] ? lcs[at + width + 1] + 1 : Math.max(lcs[at + width], lcs[at + 1]);
    }
  }
  // Each line once, in order: kept (' '), removed ('-') or added ('+'), with its line numbers on both sides.
  const ops = [];
  for (let k = 0; k < start; k++) ops.push([' ', a[k], k, k]);
  let [i, j] = [start, start];
  while (i < endA || j < endB) {
    const at = (i - start) * width + (j - start);
    if (i < endA && j < endB && a[i] === b[j]) ops.push([' ', a[i++], i - 1, j++]);
    else if (j >= endB || (i < endA && lcs[at + width] >= lcs[at + 1])) ops.push(['-', a[i++], i - 1, j]);
    else ops.push(['+', b[j++], i, j - 1]);
  }
  for (let k = 0; endA + k < a.length; k++) ops.push([' ', a[endA + k], endA + k, endB + k]);
  // Hunks: the changed lines with three lines of context, merged where their contexts meet.
  const changed = ops.flatMap(([kind], at) => (kind === ' ' ? [] : [at]));
  const hunks = [];
  for (const at of changed) {
    const [from, to] = [Math.max(0, at - 3), Math.min(ops.length, at + 4)];
    if (hunks.length && from <= hunks.at(-1)[1]) hunks.at(-1)[1] = to;
    else hunks.push([from, to]);
  }
  const range = (first, count) => `${count ? first + 1 : first},${count}`;
  const out = [`--- ${before === null ? '/dev/null' : `a/${name}`}`, `+++ ${after === null ? '/dev/null' : `b/${name}`}`];
  if (!hunks.length) out.push('\\ the files differ only in the newline at their end');
  for (const [from, to] of hunks) {
    const lines = ops.slice(from, to);
    const countA = lines.filter(([kind]) => kind !== '+').length;
    const countB = lines.filter(([kind]) => kind !== '-').length;
    out.push(`@@ -${range(lines[0][2], countA)} +${range(lines[0][3], countB)} @@`, ...lines.map(([kind, line]) => `${kind}${line}`));
  }
  return `${out.join('\n')}\n`;
}

/**
 * How the `built` API files differ from the `committed` ones: the names of those that differ, and their diff. A
 * committed file is read with LF line endings, whatever the checkout wrote; a built one is this tool's own output,
 * printed with LF whatever line endings the build's typings had.
 */
export function compareApi(committed, built) {
  const names = [...new Set([...committed.keys(), ...built.keys()])].sort(compareText);
  const before = name => committed.get(name)?.replace(/\r\n/g, '\n') ?? null;
  const diffs = names.filter(name => before(name) !== (built.get(name) ?? null)).map(name => [name, unifiedDiff(`${API_DIR}/${name}`, before(name), built.get(name) ?? null)]);
  return { changed: diffs.map(([name]) => name), diff: diffs.map(([, diff]) => diff).join('') };
}

async function main([command, ...rest]) {
  if (!['update', 'check'].includes(command) || rest.length) {
    console.error('usage: node tools/api.mjs update|check');
    return 2;
  }
  const dist = join(ROOT, DIST_DIR);
  let built;
  try {
    built = await buildApi(dist);
  } catch (error) {
    console.error(error.code === 'ENOENT' ? `API: no built package in ${DIST_DIR}: npm run build:component-library first (${error.message})` : `API: ${error.message}`);
    return 1;
  }
  if (command === 'update') {
    writeApi(join(ROOT, API_DIR), built);
    console.log(`API: wrote ${built.size} files to ${API_DIR}`);
    return 0;
  }
  const temp = mkdtempSync(join(tmpdir(), 'tableau-ui-api-'));
  try {
    writeApi(temp, built);
    const { changed, diff } = compareApi(readApi(join(ROOT, API_DIR)), readApi(temp));
    if (!changed.length) {
      console.log(`API: ${built.size} entry points match ${API_DIR}`);
      return 0;
    }
    console.log(diff);
    console.log(`API: ${changed.length} file(s) in ${API_DIR} differ from the build (${changed.join(', ')}): run \`${UPDATE}\` and name the change in the PR`);
    return 1;
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
