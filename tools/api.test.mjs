// The public API file's tests: private and protected members are left out, but not a protected input or output, nor an
// exported abstract class's protected ones; a changed input in a component's declaration, protected or not, makes the
// compare fail with a diff; and the text is the same whatever the comments, the order of the statements or the line
// endings. Run with `npm run test:tools`.

import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { API_DIR, apiFile, buildApi, compareApi, entryPoints, publicDeclarations, readApi, unifiedDiff, writeApi } from './api.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHIP = { name: 'chip', path: 'tableau-ui-angular/chip', types: './types/tableau-ui-angular-chip.d.ts' };

// Typings as ng-packagr writes them: a component and a directive with Angular's declarations, and a base class apps
// extend
const chipTypings = ({ alias = 'value', type = 'string', size = 'number' } = {}) => `import * as i0 from "@angular/core";
/**
 * A chip.
 */
export declare class ChipComponent {
  /** The chip's value. */
  readonly $value: i0.InputSignal<${type}>;
  readonly removed: i0.OutputEmitterRef<void>;
  private readonly host;
  #private;
  protected readonly $label: i0.Signal<string>;
  protected remove(): void;
  protected readonly $size: i0.InputSignal<${size}>;
  protected readonly closed: i0.OutputEmitterRef<string>;
  static ɵfac: i0.ɵɵFactoryDeclaration<ChipComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<ChipComponent, "tab-chip", never, { "$value": { "alias": "${alias}"; "required": true; "isSignal": true; }; "$size": { "alias": "size"; "required": false; "isSignal": true; }; }, { "removed": "removed"; "closed": "closed"; }, never, never, true, never>;
}
export declare class ChipFocusDirective {
  protected readonly $focusDelay: i0.InputSignal<number>;
  protected readonly $hidden: i0.Signal<boolean>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<ChipFocusDirective, "[tabChipFocus]", never, { "$focusDelay": { "alias": "focusDelay"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
export declare abstract class ChipBaseComponent {
  abstract $label: i0.Signal<string>;
  protected abstract measure(): number;
  protected readonly $loading: i0.Signal<boolean>;
  private readonly loader;
}
declare abstract class InnerBaseComponent {
  protected abstract select(): void;
  private readonly state;
}
export declare class Locked {
  private constructor();
  protected secret(): void;
}
export {};
`;

describe('the public declarations', () => {
  const text = publicDeclarations(chipTypings());

  test('leave out private and protected members', () => {
    const chip = /class ChipComponent \{[^}]*/.exec(text)[0];
    assert.match(chip, /readonly \$value: i0\.InputSignal<string>;/);
    assert.match(chip, /readonly removed: i0\.OutputEmitterRef<void>;/);
    assert.doesNotMatch(chip, /host|#private|\$label|remove\(\)/);
    assert.match(text, /class InnerBaseComponent \{\s*\}/);
  });

  test('keep the protected members of an exported abstract class, which apps extend, but not its private ones', () => {
    const base = /class ChipBaseComponent \{[^}]*/.exec(text)[0];
    assert.match(base, /protected abstract measure\(\): number;/);
    assert.match(base, /protected readonly \$loading/);
    assert.doesNotMatch(base, /loader/);
  });

  test('keep a protected input or output, since a parent binds it and Angular checks the binding against its type', () => {
    const chip = /class ChipComponent \{[^}]*/.exec(text)[0];
    assert.match(chip, /protected readonly \$size: i0\.InputSignal<number>;/);
    assert.match(chip, /protected readonly closed: i0\.OutputEmitterRef<string>;/);
    const focus = /class ChipFocusDirective \{[^}]*/.exec(text)[0];
    assert.match(focus, /protected readonly \$focusDelay: i0\.InputSignal<number>;/);
    assert.doesNotMatch(focus, /\$hidden/);
  });

  test('keep a constructor whatever its modifier, since it says how apps may create the class', () => {
    assert.match(text, /class Locked \{\s*private constructor\(\);\s*\}/);
  });

  test("keep Angular's declarations, with the selector, the inputs and the outputs", () => {
    assert.match(text, /static ɵcmp: i0\.ɵɵComponentDeclaration<ChipComponent, "tab-chip", never, \{\s*"\$value": \{\s*"alias": "value";/);
    assert.match(text, /"removed": "removed";/);
    assert.match(text, /static ɵfac/);
  });

  test('drop the comments', () => {
    assert.doesNotMatch(text, /\/\*|\/\//);
  });
});

describe('the API file', () => {
  test('is the same for the same typings, whatever their comments, statement order and line endings', async () => {
    const typings = chipTypings();
    const first = await apiFile(CHIP, typings);
    assert.equal(await apiFile(CHIP, typings), first);
    assert.equal(await apiFile(CHIP, typings.replace(/\n/g, '\r\n')), first);
    assert.equal(await apiFile(CHIP, typings.replace("/** The chip's value. */", '/** What the chip shows. */')), first);
    const [imports, ...rest] = typings.split(/\n(?=export declare abstract class ChipBaseComponent)/);
    assert.equal(await apiFile(CHIP, [rest.join('\n'), imports].join('\n')), first);
  });

  test('has LF line endings, no path but the import path, and the format of the repo', async () => {
    const file = await apiFile(CHIP, chipTypings().replace(/\n/g, '\r\n'));
    assert.doesNotMatch(file, /\r/);
    assert.ok(file.startsWith('// The public API of tableau-ui-angular/chip, from its built typings.'));
    assert.ok(!file.includes(ROOT) && !file.includes(tmpdir()));
    assert.match(file, /'tab-chip'/);
    assert.match(file, /^ {2}readonly \$value/m);
    assert.ok(file.endsWith('}\n\nexport {};\n'));
  });
});

describe('the compare', () => {
  const temp = mkdtempSync(join(tmpdir(), 'api-test-'));
  after(() => rmSync(temp, { recursive: true, force: true }));

  /** A built package in a folder of its own: package.json's exports, and the chip's typings. */
  function dist(name, typings) {
    const dir = join(temp, name);
    mkdirSync(join(dir, 'types'), { recursive: true });
    const exports = { './package.json': { default: './package.json' }, './chip': { types: CHIP.types, default: './fesm2022/chip.mjs' } };
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'tableau-ui-angular', exports }));
    writeFileSync(join(dir, CHIP.types), typings);
    return dir;
  }

  test('passes the build the files were written from, and a build of the same source', async () => {
    const committed = join(temp, 'api-same');
    writeApi(committed, await buildApi(dist('same-1', chipTypings())));
    const built = join(temp, 'built-same');
    writeApi(built, await buildApi(dist('same-2', chipTypings())));
    assert.deepEqual(compareApi(readApi(committed), readApi(built)), { changed: [], diff: '' });
  });

  for (const [what, change, lines] of [
    ["an input's public name", { alias: 'text' }, ["-        alias: 'value';", "+        alias: 'text';"]],
    ["an input's type", { type: 'number' }, ['-  readonly $value: i0.InputSignal<string>;', '+  readonly $value: i0.InputSignal<number>;']],
    ["a protected input's type", { size: 'string' }, ['-  protected readonly $size: i0.InputSignal<number>;', '+  protected readonly $size: i0.InputSignal<string>;']],
  ]) {
    test(`fails on a change to ${what} in the component's declaration, and shows it in a diff`, async () => {
      const name = Object.values(change)[0];
      const committed = join(temp, `api-${name}`);
      writeApi(committed, await buildApi(dist(`before-${name}`, chipTypings())));
      const built = join(temp, `built-${name}`);
      writeApi(built, await buildApi(dist(`after-${name}`, chipTypings(change))));
      const { changed, diff } = compareApi(readApi(committed), readApi(built));
      assert.deepEqual(changed, ['chip.d.ts']);
      assert.ok(diff.startsWith(`--- a/${API_DIR}/chip.d.ts\n+++ b/${API_DIR}/chip.d.ts\n@@ `), diff);
      assert.deepEqual(
        diff.split('\n').filter(line => /^[-+](?![-+])/.test(line)),
        lines,
      );
    });
  }

  test('fails on an entry point added or removed', () => {
    const { changed, diff } = compareApi(new Map([['chip.d.ts', 'a\n']]), new Map([['menu.d.ts', 'b\n']]));
    assert.deepEqual(changed, ['chip.d.ts', 'menu.d.ts']);
    assert.match(diff, /^--- a\/projects\/component-library\/api\/chip\.d\.ts\n\+\+\+ \/dev\/null\n@@ -1,1 \+0,0 @@\n-a\n/);
    assert.match(diff, /--- \/dev\/null\n\+\+\+ b\/projects\/component-library\/api\/menu\.d\.ts\n@@ -0,0 \+1,1 @@\n\+b\n$/);
  });

  test("reads a committed file with a checkout's CRLF line endings as the same", () => {
    const dir = join(temp, 'crlf');
    mkdirSync(dir);
    writeFileSync(join(dir, 'chip.d.ts'), 'a\r\nb\r\n');
    assert.deepEqual(compareApi(readApi(dir), new Map([['chip.d.ts', 'a\nb\n']])).changed, []);
  });

  test('update writes one file per entry point, and removes one whose entry point went', async () => {
    const dir = join(temp, 'update');
    mkdirSync(dir);
    writeFileSync(join(dir, 'stepper.d.ts'), 'export {};\n');
    writeApi(dir, await buildApi(dist('update-dist', chipTypings())));
    assert.deepEqual(readdirSync(dir), ['chip.d.ts']);
  });

  test('refuses a build whose package.json names no typings, so update deletes nothing', async () => {
    const dir = join(temp, 'no-types');
    mkdirSync(dir);
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'tableau-ui-angular', exports: { './package.json': { default: './package.json' } } }));
    await assert.rejects(buildApi(dir), /names no entry point with typings/);
  });
});

describe('the unified diff', () => {
  test('is empty for equal text', () => {
    assert.equal(unifiedDiff('x.d.ts', 'a\nb\n', 'a\nb\n'), '');
  });

  test('shows a changed line with three lines of context, and merges hunks whose context meets', () => {
    const before = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].join('\n') + '\n';
    const after = before.replace('5\n', 'five\n').replace('8\n', '8\neight\n');
    assert.equal(
      unifiedDiff('x.d.ts', before, after),
      ['--- a/x.d.ts', '+++ b/x.d.ts', '@@ -2,10 +2,11 @@', ' 2', ' 3', ' 4', '-5', '+five', ' 6', ' 7', ' 8', '+eight', ' 9', ' 10', ' 11', ''].join('\n'),
    );
  });

  test('keeps hunks apart when their context does not meet', () => {
    const before = Array.from({ length: 20 }, (_, i) => `${i + 1}`).join('\n') + '\n';
    const after = before.replace(/^2$/m, 'two').replace(/^19$/m, 'nineteen');
    const headers = unifiedDiff('x.d.ts', before, after)
      .split('\n')
      .filter(line => line.startsWith('@@'));
    assert.deepEqual(headers, ['@@ -1,5 +1,5 @@', '@@ -16,5 +16,5 @@']);
  });
});

describe('entry points', () => {
  test('are the exports with typings, sorted, the root named after the package', () => {
    const packageJson = {
      name: 'tableau-ui-angular',
      exports: {
        './package.json': { default: './package.json' },
        '.': { types: './types/tableau-ui-angular.d.ts', default: './fesm2022/tableau-ui-angular.mjs' },
        './table': { types: './types/tableau-ui-angular-table.d.ts', default: './fesm2022/tableau-ui-angular-table.mjs' },
        './button': { types: './types/tableau-ui-angular-button.d.ts', default: './fesm2022/tableau-ui-angular-button.mjs' },
      },
    };
    assert.deepEqual(entryPoints(packageJson), [
      { name: 'button', path: 'tableau-ui-angular/button', types: './types/tableau-ui-angular-button.d.ts' },
      { name: 'table', path: 'tableau-ui-angular/table', types: './types/tableau-ui-angular-table.d.ts' },
      { name: 'tableau-ui-angular', path: 'tableau-ui-angular', types: './types/tableau-ui-angular.d.ts' },
    ]);
  });

  test("the repo's API files are one per entry point folder, and the root's", () => {
    const library = join(ROOT, 'projects', 'component-library');
    const folders = readdirSync(library, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && existsSync(join(library, entry.name, 'ng-package.json')))
      .map(entry => `${entry.name}.d.ts`);
    assert.deepEqual([...readApi(join(ROOT, API_DIR)).keys()].sort(), [...folders, 'tableau-ui-angular.d.ts'].sort());
  });
});
