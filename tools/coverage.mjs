// The library's line coverage floor, in tools/coverage.json: a whole percent that only rises. The gate's coverage check
// reads the floor, the floor at the base commit and what the tests measured, and asks verdict() what they mean.

export const FLOOR_FILE = 'tools/coverage.json';

/** A floor file's `lines`, a whole percent from 0 to 100, as `{ floor }`, or `{ problem }` saying why it is not one. */
export function readFloor(text, where = FLOOR_FILE) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { problem: `${where} is not JSON` };
  }
  const lines = parsed?.lines;
  return Number.isInteger(lines) && lines >= 0 && lines <= 100 ? { floor: lines } : { problem: `${where} needs "lines", a whole percent from 0 to 100` };
}

/**
 * Whether the measured line coverage, a percent, passes the floor: `{ ok, detail }`. It fails below the floor, and when
 * the floor is below the base's, since the floor only rises; with no floor at the base yet, nothing is compared.
 */
export function verdict({ measured, floor, baseFloor }) {
  if (baseFloor !== undefined && floor < baseFloor) {
    return { ok: false, detail: `the floor in ${FLOOR_FILE} is ${floor}%, below the base's ${baseFloor}%: it only rises` };
  }
  if (measured < floor) {
    return { ok: false, detail: `the library's line coverage is ${measured}%, below the floor of ${floor}% in ${FLOOR_FILE}` };
  }
  const rise = Math.floor(measured) > floor ? `; raise it to ${Math.floor(measured)}` : '';
  return { ok: true, detail: `library lines ${measured}%, floor ${floor}%${rise}` };
}
