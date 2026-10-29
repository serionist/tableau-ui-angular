// What the gate reads from Angular: every project's tests run, the library's with coverage, and the demo app's
// prerender passes only with a route prerendered and no page throwing. Run with `npm run test:tools`.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { prerenderVerdict, testRuns } from './angular.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('the test runs', () => {
  test("cover every project with a test target, and the library's with coverage", () => {
    const angularJson = {
      projects: {
        'component-library': { architect: { build: {}, test: {} } },
        docs: { architect: { build: {}, test: {} } },
        'no-tests': { architect: { build: {} } },
      },
    };
    assert.deepEqual(testRuns(angularJson), [
      ['test', 'component-library', '--watch=false', '--coverage'],
      ['test', 'docs', '--watch=false'],
    ]);
  });

  test("include the repo's library and demo app", () => {
    const runs = testRuns(JSON.parse(readFileSync(join(ROOT, 'angular.json'), 'utf8')));
    assert.deepEqual(
      runs.map(args => args[1]),
      ['component-library', 'test-app'],
    );
  });
});

describe('the prerender', () => {
  const built = ['✔ Building...', 'main-NUP3PRX2.js | main | 196.00 kB', 'Prerendered 3 static routes.', 'Application bundle generation complete.'];

  test('passes with routes prerendered and no error', () => {
    assert.deepEqual(prerenderVerdict(built.join('\n')), { ok: true, detail: 'Prerendered 3 static routes.' });
  });

  test('passes one route', () => {
    assert.equal(prerenderVerdict('Prerendered 1 static route.').ok, true);
  });

  test('fails without the prerender line', () => {
    assert.match(prerenderVerdict('✔ Building...\nApplication bundle generation complete.').detail, /did not prerender/);
  });

  test('fails when no route prerendered', () => {
    assert.match(prerenderVerdict('Prerendered 0 static routes.').detail, /prerendered no route/);
  });

  test('fails when a page threw while prerendering, though the build went on', () => {
    const { ok, detail } = prerenderVerdict(['❯ Building...', 'ERROR ReferenceError: ResizeObserver is not defined', ...built].join('\r\n'));
    assert.equal(ok, false);
    assert.equal(detail, 'a page threw while prerendering: ERROR ReferenceError: ResizeObserver is not defined');
  });

  test('reads ERROR only at the start of a line', () => {
    assert.equal(prerenderVerdict(['NO ERRORS here', ...built].join('\n')).ok, true);
  });
});
