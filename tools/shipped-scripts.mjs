// The two scripts apps run from node_modules/tableau-ui-angular/, run as an app runs them, against local stubs:
// used-icons/scripts/update-icons.js against an HTTP server that answers as Google Fonts' CSS API does, through
// TABLEAU_UI_ICONS_CSS_URL, and styles/fonts/downloadFonts.js against an HTTPS server with a test CA, as a Tableau
// Server does, through NODE_EXTRA_CA_CERTS. Each check reads the files the scripts wrote, not only their exit codes.
//
// Usage: node tools/shipped-scripts.mjs <the packed tarball>
//
// It installs the tarball into an empty app, with typescript as an Angular app has it, and runs both scripts there:
// CI's Windows leg does that. The tools' tests (shipped-scripts.test.mjs) run the same checks on the source tree.

import { spawn } from 'node:child_process';
import { createHash, generateKeyPairSync, randomBytes, sign } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const ICON_SCRIPT = 'used-icons/scripts/update-icons.js';
export const FONT_SCRIPT = 'styles/fonts/downloadFonts.js';
export const ICON_CSS_URL_ENV = 'TABLEAU_UI_ICONS_CSS_URL';
// What downloadFonts.js downloads, from <server>/img/
export const FONT_FILES = ['Book', 'Book_Italic', 'Medium', 'SemiDemi', 'SemiDemi_Italic', 'Light'].flatMap(name => [`BentonSans-${name}.woff`, `BentonSans-${name}.woff2`]);

// A test CA and a certificate it signed for 127.0.0.1, in DER, which Node can't make itself: ECDSA P-256 keys,
// valid for a day either side of now.

function derLength(length) {
  if (length < 0x80) return Buffer.from([length]);
  const bytes = [];
  for (let rest = length; rest; rest >>= 8) bytes.unshift(rest & 0xff);
  return Buffer.from([0x80 | bytes.length, ...bytes]);
}
const der = (tag, ...parts) => {
  const body = Buffer.concat(parts);
  return Buffer.concat([Buffer.from([tag]), derLength(body.length), body]);
};
const sequence = (...parts) => der(0x30, ...parts);
const set = (...parts) => der(0x31, ...parts);
const integer = bytes => der(0x02, bytes[0] & 0x80 ? Buffer.concat([Buffer.from([0]), bytes]) : bytes);
const octets = bytes => der(0x04, bytes);
const bits = (bytes, unused = 0) => der(0x03, Buffer.from([unused]), bytes);
const yes = der(0x01, Buffer.from([0xff]));
const explicit = (n, ...parts) => der(0xa0 + n, ...parts);
const utcTime = date => der(0x17, Buffer.from(`${date.toISOString().replace(/[-:T]/g, '').slice(2, 14)}Z`));
function oid(dotted) {
  const [first, second, ...rest] = dotted.split('.').map(Number);
  const bytes = [40 * first + second];
  for (const n of rest) {
    const chunk = [n & 0x7f];
    for (let v = n >> 7; v; v >>= 7) chunk.unshift(0x80 | (v & 0x7f));
    bytes.push(...chunk);
  }
  return der(0x06, Buffer.from(bytes));
}
const commonName = name => sequence(set(sequence(oid('2.5.4.3'), der(0x0c, Buffer.from(name)))));
const extension = (id, critical, value) => sequence(oid(id), ...(critical ? [yes] : []), octets(value));
const ECDSA_WITH_SHA256 = sequence(oid('1.2.840.10045.4.3.2'));

function certificate({ subject, issuer, publicKey, signingKey, extensions }) {
  const serial = randomBytes(8);
  serial[0] = 0x40 | (serial[0] & 0x3f); // positive, and no leading zero byte
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const tbs = sequence(
    explicit(0, integer(Buffer.from([2]))), // X.509 v3
    integer(serial),
    ECDSA_WITH_SHA256,
    commonName(issuer),
    sequence(utcTime(new Date(now - day)), utcTime(new Date(now + day))),
    commonName(subject),
    publicKey.export({ type: 'spki', format: 'der' }),
    explicit(3, sequence(...extensions)),
  );
  const signed = sequence(tbs, ECDSA_WITH_SHA256, bits(sign('sha256', tbs, signingKey)));
  return `-----BEGIN CERTIFICATE-----\n${signed.toString('base64').replace(/.{64}/g, '$&\n')}\n-----END CERTIFICATE-----\n`;
}

/** A test CA's certificate, and a key and a certificate it signed for 127.0.0.1 and localhost, as PEM. */
export function testCertificates() {
  const ca = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const server = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const caKeyId = createHash('sha1')
    .update(ca.publicKey.export({ type: 'spki', format: 'der' }))
    .digest();
  const caCert = certificate({
    subject: 'tableau-ui-angular test CA',
    issuer: 'tableau-ui-angular test CA',
    publicKey: ca.publicKey,
    signingKey: ca.privateKey,
    extensions: [
      extension('2.5.29.19', true, sequence(yes)), // a CA
      extension('2.5.29.15', true, bits(Buffer.from([0x06]), 1)), // it signs certificates and CRLs
      extension('2.5.29.14', false, octets(caKeyId)),
    ],
  });
  const serverCert = certificate({
    subject: '127.0.0.1',
    issuer: 'tableau-ui-angular test CA',
    publicKey: server.publicKey,
    signingKey: ca.privateKey,
    extensions: [
      extension('2.5.29.19', false, sequence()), // no CA
      extension('2.5.29.15', true, bits(Buffer.from([0x80]), 7)), // digital signatures
      extension('2.5.29.37', false, sequence(oid('1.3.6.1.5.5.7.3.1'))), // a TLS server
      extension('2.5.29.17', false, sequence(der(0x82, Buffer.from('localhost')), der(0x87, Buffer.from([127, 0, 0, 1])))),
      extension('2.5.29.35', false, sequence(der(0x80, caKeyId))),
    ],
  });
  return { ca: caCert, key: server.privateKey.export({ type: 'pkcs8', format: 'pem' }), cert: serverCert };
}

// The stubs

async function listen(server) {
  await new Promise((done, failed) => {
    server.once('error', failed);
    server.listen(0, '127.0.0.1', done);
  });
  return server.address().port;
}

async function close(server) {
  server.closeAllConnections?.();
  await new Promise(done => server.close(done));
}

/** The bytes a stub serves for a path, so a check can tell each file from the others. */
export const servedBytes = path => Buffer.from(`stub bytes of ${path}\n`);

/**
 * Google Fonts' CSS API: GET <url>/css2?family=<font>:<axes>&icon_names=... answers a @font-face for the font, whose
 * src is a WOFF2 file this server serves too. `cssStatus` answers the CSS with another status, such as 500.
 */
export async function startIconServer({ cssStatus = 200 } = {}) {
  const requests = [];
  const server = createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    requests.push(url);
    if (url.pathname === '/css2' && cssStatus !== 200) {
      response.writeHead(cssStatus).end('stub failure');
    } else if (url.pathname === '/css2') {
      const family = (url.searchParams.get('family') ?? '').split(':')[0];
      const fontUrl = `http://127.0.0.1:${port}/s/${family.split(' ').join('-')}.woff2`;
      response.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
      response.end(
        `/* fallback */\n@font-face {\n  font-family: '${family}';\n  font-style: normal;\n  font-display: block;\n  src: url(${fontUrl}) format('woff2');\n}\n\n.material-symbols { font-family: '${family}'; }\n`,
      );
    } else if (url.pathname.startsWith('/s/')) {
      response.writeHead(200, { 'Content-Type': 'font/woff2' }).end(servedBytes(url.pathname));
    } else {
      response.writeHead(404).end();
    }
  });
  const port = await listen(server);
  return { url: `http://127.0.0.1:${port}`, requests, close: async () => close(server) };
}

/**
 * A Tableau Server's fonts over HTTPS, with the certificate from testCertificates(): GET /img/<file>. A file in
 * `missing` answers 404; one in `broken` breaks off after its first bytes.
 */
export async function startFontServer({ key, cert }, { missing = [], broken = [] } = {}) {
  const server = createHttpsServer({ key, cert }, (request, response) => {
    const file = decodeURIComponent(new URL(request.url, 'https://127.0.0.1').pathname.replace(/^\/img\//, ''));
    if (!FONT_FILES.includes(file) || missing.includes(file)) {
      response.writeHead(404).end();
    } else if (broken.includes(file)) {
      response.writeHead(200, { 'Content-Length': 1000 });
      response.write(servedBytes(request.url));
      setTimeout(() => response.socket?.destroy(), 50);
    } else {
      response.writeHead(200, { 'Content-Type': 'font/woff2' }).end(servedBytes(request.url));
    }
  });
  const port = await listen(server);
  return { url: `https://127.0.0.1:${port}`, close: async () => close(server) };
}

/** Runs a script with Node, in `cwd`, with more environment: `{ code, output }`. */
export async function runScript(script, args, { cwd, env = {} }) {
  return new Promise((done, failed) => {
    const child = spawn(process.execPath, [script, ...args], { cwd, env: { ...process.env, ...env }, windowsHide: true });
    let output = '';
    child.stdout.on('data', chunk => (output += chunk));
    child.stderr.on('data', chunk => (output += chunk));
    child.on('error', failed);
    child.on('close', code => done({ code, output }));
  });
}

/** The icon list an app writes, with `UsedIcons` imported from `usedIconsImport`. */
export function iconList(usedIconsImport) {
  return `import { UsedIcons } from '${usedIconsImport}';

export class Icons extends UsedIcons {
  override fonts: ('Material Symbols Outlined' | 'Material Symbols Rounded' | 'Material Symbols Sharp')[] = ['Material Symbols Outlined', 'Material Symbols Rounded'];
  override weights: (100 | 200 | 300 | 400 | 500 | 600 | 700)[] = [400, 700];
  override usedIcons: string[] = ['search', 'home'];
}
`;
}

// The checks

/**
 * Runs update-icons.js from `packageDir` in the app at `appDir`, whose icon list imports `UsedIcons` from
 * `usedIconsImport`, against an icon CSS stub. The problems it found, or none.
 */
export async function checkIconScript({ packageDir, appDir, usedIconsImport }) {
  const problems = [];
  writeFileSync(join(appDir, 'icons.ts'), iconList(usedIconsImport));
  const out = join(appDir, 'public', 'icons');
  const stub = await startIconServer();
  try {
    const { code, output } = await runScript(join(packageDir, ICON_SCRIPT), ['icons.ts', 'public/icons'], { cwd: appDir, env: { [ICON_CSS_URL_ENV]: `${stub.url}/css2` } });
    if (code !== 0) return [`update-icons.js exited ${code}:\n${output}`];
    const css = stub.requests.filter(url => url.pathname === '/css2');
    const families = css.map(url => url.searchParams.get('family'));
    // each font, with the axes the list sets: its weights, and the default grade, optical size and fill
    const expectedFamilies = ['Outlined', 'Rounded'].map(font => `Material Symbols ${font}:opsz,wght,FILL,GRAD@24,400..700,0,0`);
    if (families.join() !== expectedFamilies.join()) {
      problems.push(`update-icons.js asked the CSS API for ${JSON.stringify(families)}, not ${JSON.stringify(expectedFamilies)}`);
    }
    const names = css.map(url => url.searchParams.get('icon_names')?.split(','));
    if (!names.every(list => list?.includes('home') && list.includes('search') && list.includes('keyboard_arrow_down'))) {
      problems.push(`update-icons.js asked for the icons ${JSON.stringify(names)}, not the app's and the library's`);
    }
    const written = existsSync(out) ? readdirSync(out).sort() : [];
    const expected = ['material-icons.css', 'material-symbols-outlined.woff2', 'material-symbols-rounded.woff2'];
    if (written.join() !== expected.join()) return [...problems, `update-icons.js wrote ${JSON.stringify(written)}, not ${JSON.stringify(expected)}`];
    for (const font of ['Material-Symbols-Outlined', 'Material-Symbols-Rounded']) {
      if (!readFileSync(join(out, `${font.toLowerCase()}.woff2`)).equals(servedBytes(`/s/${font}.woff2`))) problems.push(`${font.toLowerCase()}.woff2 is not the font the stub served`);
    }
    const sheet = readFileSync(join(out, 'material-icons.css'), 'utf8');
    for (const font of ['Outlined', 'Rounded']) {
      const face = new RegExp(`@font-face \\{[^}]*font-family: 'Material Symbols ${font}';[^}]*src: url\\(material-symbols-${font.toLowerCase()}\\.woff2\\) format\\('woff2'\\);[^}]*\\}`);
      if (!face.test(sheet)) problems.push(`material-icons.css has no @font-face for Material Symbols ${font} from its own file:\n${sheet}`);
    }
  } finally {
    await stub.close();
  }
  return problems;
}

/**
 * Runs downloadFonts.js from `packageDir` in the app at `appDir` against an HTTPS font stub, whose test CA it trusts
 * through NODE_EXTRA_CA_CERTS. The problems it found, or none.
 */
export async function checkFontScript({ packageDir, appDir }) {
  const certs = testCertificates();
  const caFile = join(appDir, 'test-ca.pem');
  writeFileSync(caFile, certs.ca);
  const out = join(appDir, 'public', 'fonts');
  const stub = await startFontServer(certs);
  try {
    const { code, output } = await runScript(join(packageDir, FONT_SCRIPT), [stub.url, 'public/fonts'], { cwd: appDir, env: { NODE_EXTRA_CA_CERTS: caFile } });
    if (code !== 0) return [`downloadFonts.js exited ${code}:\n${output}`];
    const written = existsSync(out) ? readdirSync(out).sort() : [];
    if (written.join() !== [...FONT_FILES].sort().join()) return [`downloadFonts.js wrote ${JSON.stringify(written)}, not the ${FONT_FILES.length} font files`];
    return FONT_FILES.filter(file => !readFileSync(join(out, file)).equals(servedBytes(`/img/${file}`))).map(file => `${file} is not the file the stub served`);
  } finally {
    await stub.close();
  }
}

// The CLI, for CI's Windows leg: the tarball in an empty app, as an app installs it

async function npm(args, cwd) {
  // npm is a .cmd on Windows, which Node runs only through a shell; every argument is quoted
  const command = process.platform === 'win32' ? ['npm', ...args.map(arg => `"${arg}"`)].join(' ') : 'npm';
  return new Promise((done, failed) => {
    const child = spawn(command, process.platform === 'win32' ? [] : args, { cwd, shell: process.platform === 'win32', stdio: 'inherit', windowsHide: true });
    child.on('error', failed);
    child.on('close', done);
  });
}

async function main([tarball]) {
  if (!tarball || !existsSync(tarball)) {
    console.error('usage: node tools/shipped-scripts.mjs <the packed tarball>');
    return 2;
  }
  const appDir = mkdtempSync(join(tmpdir(), 'tableau-ui-app-'));
  writeFileSync(join(appDir, 'package.json'), `${JSON.stringify({ name: 'shipped-scripts-app', version: '0.0.0', private: true }, null, 2)}\n`);
  const typescript = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).devDependencies.typescript;
  console.log(`An empty app in ${appDir}, with ${tarball} and typescript@${typescript}`);
  const installed = await npm(['install', '--no-audit', '--no-fund', '--ignore-scripts', resolve(tarball), `typescript@${typescript}`], appDir);
  if (installed !== 0) {
    console.error(`npm install exited ${installed}`);
    return 1;
  }
  const packageDir = join(appDir, 'node_modules', 'tableau-ui-angular');
  const results = [
    [ICON_SCRIPT, await checkIconScript({ packageDir, appDir, usedIconsImport: 'tableau-ui-angular/used-icons' })],
    [FONT_SCRIPT, await checkFontScript({ packageDir, appDir })],
  ];
  for (const [script, problems] of results) {
    console.log(problems.length ? `FAIL  ${script}\n${problems.join('\n')}` : `pass  ${script}: wrote the files the stubs served`);
  }
  if (results.some(([, problems]) => problems.length)) return 1;
  rmSync(appDir, { recursive: true, force: true });
  return 0;
}

/** A copy of the source tree's UsedIcons in `appDir`, for an icon list there to import as './used-icons'. */
export function copyUsedIcons(appDir) {
  mkdirSync(appDir, { recursive: true });
  copyFileSync(join(ROOT, 'projects', 'component-library', 'used-icons', 'src', 'used-icons.ts'), join(appDir, 'used-icons.ts'));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
