// The coverage floor's tests: the floor file must hold a whole percent, coverage below the floor fails, and so does a
// floor lowered below the base's, since it only rises. Run with `npm run test:tools`.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { FLOOR_FILE, readFloor, verdict } from './coverage.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('the floor file', () => {
  test('holds a whole percent', () => {
    assert.deepEqual(readFloor('{ "lines": 25 }'), { floor: 25 });
    assert.deepEqual(readFloor('{ "lines": 0 }'), { floor: 0 });
  });

  const bad = {
    'a fraction': '{ "lines": 25.5 }',
    'above 100': '{ "lines": 101 }',
    'below 0': '{ "lines": -1 }',
    'a string': '{ "lines": "25" }',
    'no lines': '{ "branches": 25 }',
    'not JSON': 'lines: 25',
  };
  for (const [name, text] of Object.entries(bad)) {
    test(`refuses ${name}`, () => {
      assert.match(readFloor(text).problem, /tools\/coverage\.json/);
    });
  }

  test("the repo's own is one", () => {
    assert.equal(typeof readFloor(readFileSync(join(ROOT, FLOOR_FILE), 'utf8')).floor, 'number');
  });
});

describe('the verdict', () => {
  test('passes at the floor', () => {
    assert.deepEqual(verdict({ measured: 25, floor: 25, baseFloor: 25 }), { ok: true, detail: 'library lines 25%, floor 25%' });
  });

  test('passes above the floor, and says to what it can rise', () => {
    const { ok, detail } = verdict({ measured: 27.4, floor: 25, baseFloor: 25 });
    assert.equal(ok, true);
    assert.match(detail, /raise it to 27$/);
  });

  test('fails below the floor', () => {
    const { ok, detail } = verdict({ measured: 24.99, floor: 25, baseFloor: 25 });
    assert.equal(ok, false);
    assert.match(detail, /24\.99%, below the floor of 25%/);
  });

  test("fails when the floor is lowered below the base's, even with the coverage above both", () => {
    const { ok, detail } = verdict({ measured: 40, floor: 20, baseFloor: 25 });
    assert.equal(ok, false);
    assert.match(detail, /below the base's 25%: it only rises/);
  });

  test('passes a raised floor', () => {
    assert.equal(verdict({ measured: 31, floor: 30, baseFloor: 25 }).ok, true);
  });

  test('compares nothing with a base that has no floor yet', () => {
    assert.equal(verdict({ measured: 25.8, floor: 25, baseFloor: undefined }).ok, true);
  });
});
