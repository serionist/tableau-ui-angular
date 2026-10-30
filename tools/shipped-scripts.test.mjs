// The shipped scripts' tests: update-icons.js and downloadFonts.js from the source tree, run as an app runs them,
// against local stubs, checking the files they write; CI's Windows leg runs the same checks from the packed tarball.
// Run with `npm run test:tools`.

import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
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
    // a node_modules with typescript above the temp folder would decide this test for the wrong reason
    assert.throws(() => createRequire(join(app, 'update-icons.js')).resolve('typescript'), { code: 'MODULE_NOT_FOUND' });

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

  // The file was truncated as its answer started and deleted when the answer broke off, so a run that failed there
  // lost the copy the folder had from the run before
  test('keeps the copy the folder had when its download breaks off on a later run', async () => {
    const certs = testCertificates();
    writeFileSync(join(app, 'ca.pem'), certs.ca);
    const broken = 'BentonSans-Medium.woff2';
    const run = async options => {
      const stub = await startFontServer(certs, options);
      try {
        return await runScript(join(PACKAGE, FONT_SCRIPT), [stub.url, 'fonts'], { cwd: app, env: { NODE_EXTRA_CA_CERTS: join(app, 'ca.pem') } });
      } finally {
        await stub.close();
      }
    };

    assert.equal((await run({ tag: 'first' })).code, 0);
    const second = await run({ tag: 'second', broken: [broken] });

    assert.equal(second.code, 1, second.output);
    assert.deepEqual(readdirSync(join(app, 'fonts')).sort(), [...FONT_FILES].sort());
    for (const file of FONT_FILES) assert.ok(readFileSync(join(app, 'fonts', file)).equals(servedBytes(`/img/${file}`, file === broken ? 'first' : 'second')), file);
  });
});

// The checks CI runs on the tarball must fail a script that exits 0 without writing what the stubs served
describe('the checks', () => {
  function fakePackage({ icons, fonts }) {
    // CommonJS, which needs no package.json
    const dir = join(app, 'package');
    for (const script of [ICON_SCRIPT, FONT_SCRIPT]) mkdirSync(dirname(join(dir, script)), { recursive: true });
    writeFileSync(join(dir, ICON_SCRIPT), icons);
    writeFileSync(join(dir, FONT_SCRIPT), fonts);
    return dir;
  }
  // a script that writes `files`, each holding "wrong", into the folder its second argument names
  const writes = files => `const fs = require('fs');
const path = require('path');
const out = path.resolve(process.argv[3]);
fs.mkdirSync(out, { recursive: true });
for (const file of ${JSON.stringify(files)}) fs.writeFileSync(path.join(out, file), 'wrong');
`;

  test('fail scripts that exit 0 and write nothing', async () => {
    copyUsedIcons(app);
    const packageDir = fakePackage({ icons: '// writes nothing\n', fonts: '// writes nothing\n' });

    assert.match((await checkIconScript({ packageDir, appDir: app, usedIconsImport: './used-icons' })).join('\n'), /update-icons\.js wrote \[\]/);
    assert.match((await checkFontScript({ packageDir, appDir: app })).join('\n'), /downloadFonts\.js wrote \[\]/);
  });

  test('fail scripts that write the files with the wrong bytes', async () => {
    copyUsedIcons(app);
    const packageDir = fakePackage({
      icons: writes(['material-icons.css', 'material-symbols-outlined.woff2', 'material-symbols-rounded.woff2']),
      fonts: writes(FONT_FILES),
    });

    const icons = (await checkIconScript({ packageDir, appDir: app, usedIconsImport: './used-icons' })).join('\n');
    assert.match(icons, /asked the CSS API for \[\]/);
    assert.match(icons, /material-symbols-outlined\.woff2 is not the font the stub served/);
    assert.match(icons, /material-icons\.css has no @font-face for Material Symbols Outlined/);
    const fonts = await checkFontScript({ packageDir, appDir: app });
    assert.equal(fonts.length, FONT_FILES.length);
    assert.match(fonts[0], /is not the file the stub served/);
  });
});
