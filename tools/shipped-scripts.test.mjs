// The shipped scripts' tests: update-icons.js and downloadFonts.js from the source tree, run as an app runs them,
// against local stubs, checking the files they write; CI's Windows leg runs the same checks from the packed tarball.
// Run with `npm run test:tools`.

import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  checkFontScript,
  checkIconScript,
  copyUsedIcons,
  FONT_FILES,
  FONT_SCRIPT,
  ICON_CSS_URL_ENV,
  ICON_SCRIPT,
  iconList,
  runScript,
  servedBytes,
  startFontServer,
  startIconServer,
  testCertificates,
} from './shipped-scripts.mjs';

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), '..', 'projects', 'component-library');

// An app's folder outside the repo, so nothing resolves from the repo's node_modules but the scripts' own imports
let app;
beforeEach(() => {
  app = mkdtempSync(join(tmpdir(), 'tableau-ui-app-'));
});
afterEach(() => {
  rmSync(app, { recursive: true, force: true });
});

describe('update-icons.js', () => {
  test('downloads each font and writes their CSS, from the CSS API in TABLEAU_UI_ICONS_CSS_URL', async () => {
    copyUsedIcons(app);

    assert.deepEqual(await checkIconScript({ packageDir: PACKAGE, appDir: app, usedIconsImport: './used-icons' }), []);
  });

  test('exits 1 and writes nothing when the CSS API answers an error', async () => {
    copyUsedIcons(app);
    writeFileSync(join(app, 'icons.ts'), iconList('./used-icons'));
    const stub = await startIconServer({ cssStatus: 500 });
    try {
      const { code, output } = await runScript(join(PACKAGE, ICON_SCRIPT), ['icons.ts', 'out'], { cwd: app, env: { [ICON_CSS_URL_ENV]: `${stub.url}/css2` } });

      assert.equal(code, 1, output);
      assert.match(output, /answered 500/);
      assert.deepEqual(existsSync(join(app, 'out')) ? readdirSync(join(app, 'out')) : [], []);
    } finally {
      await stub.close();
    }
  });

  // It required axios, which the package never declared, before typescript, whose absence gave a bare module error
  test('says how to install typescript in an app without it', async () => {
    copyFileSync(join(PACKAGE, ICON_SCRIPT), join(app, 'update-icons.js'));
    writeFileSync(join(app, 'package.json'), '{ "type": "module" }\n');

    const { code, output } = await runScript(join(app, 'update-icons.js'), ['icons.ts', 'out'], { cwd: app });

    assert.equal(code, 1, output);
    assert.match(output, /compiles the icon list with typescript, which an Angular app has: npm install --save-dev typescript/);
  });
});

describe('downloadFonts.js', () => {
  test('downloads each font file from the server, over HTTPS', async () => {
    assert.deepEqual(await checkFontScript({ packageDir: PACKAGE, appDir: app }), []);
  });

  // F137: a failed download left a 0-byte file and the script reported success; one that broke off stopped the script
  test('exits 1, and keeps no file for a font that failed, when one is missing and one breaks off', async () => {
    const certs = testCertificates();
    writeFileSync(join(app, 'ca.pem'), certs.ca);
    const missing = 'BentonSans-Book_Italic.woff';
    const broken = 'BentonSans-Medium.woff2';
    const stub = await startFontServer(certs, { missing: [missing], broken: [broken] });
    try {
      const { code, output } = await runScript(join(PACKAGE, FONT_SCRIPT), [stub.url, 'fonts'], { cwd: app, env: { NODE_EXTRA_CA_CERTS: join(app, 'ca.pem') } });

      assert.equal(code, 1, output);
      assert.match(output, /2 of 12 font files failed to download: BentonSans-Book_Italic\.woff, BentonSans-Medium\.woff2/);
      const others = FONT_FILES.filter(file => file !== missing && file !== broken);
      assert.deepEqual(readdirSync(join(app, 'fonts')).sort(), others.sort());
      for (const file of others) assert.ok(readFileSync(join(app, 'fonts', file)).equals(servedBytes(`/img/${file}`)), file);
    } finally {
      await stub.close();
    }
  });
});
