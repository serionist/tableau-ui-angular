// What the gate reads from Angular: the test runs angular.json asks for, and the verdict on the demo app's build output.

// The project whose tests the coverage floor measures (tools/coverage.json)
export const COVERED_PROJECT = 'component-library';

/**
 * The `ng test` arguments for every project in `angularJson` that has a test target, the library's with coverage, so
 * a new project's tests run without anyone adding them to the gate.
 */
export function testRuns(angularJson) {
  return Object.entries(angularJson.projects ?? {})
    .filter(([, project]) => project?.architect?.test)
    .map(([name]) => ['test', name, '--watch=false', ...(name === COVERED_PROJECT ? ['--coverage'] : [])]);
}

/**
 * Whether the demo app's build output shows a good prerender: `{ ok, detail }`. It needs the build's "Prerendered N
 * static routes" line with N above 0, and no line starting with ERROR, which is how the build reports a page that threw
 * while it rendered on the server, though it writes the page and goes on.
 */
export function prerenderVerdict(output) {
  const lines = output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  const prerendered = lines.find(line => /^Prerendered \d+ static routes?/.test(line));
  if (!prerendered) return { ok: false, detail: 'the build printed no "Prerendered N static routes" line, so it did not prerender' };
  if (/^Prerendered 0 /.test(prerendered)) return { ok: false, detail: 'the build prerendered no route: app.routes.server.ts lists the ones that render on the server' };
  const error = lines.find(line => /^ERROR\b/.test(line));
  return error ? { ok: false, detail: `a page threw while prerendering: ${error}` } : { ok: true, detail: prerendered };
}
