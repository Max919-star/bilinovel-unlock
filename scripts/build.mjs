// Builds dist/bilinovel-unlock.zip (MV3 extension) and dist/bilinovel-unlock.user.js (Tampermonkey).
// No dependencies; requires Node 22+ for zlib.crc32.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const manifest = JSON.parse(read('manifest.json'));
const matches = manifest.content_scripts[0].matches;
const extensionFiles = ['manifest.json', 'src/main-world.js', 'src/guard.js', 'src/unlock.css'];

function dosDateTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function zip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  const { time, day } = dosDateTime(new Date());

  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const compressed = zlib.deflateRawSync(data);
    const crc = zlib.crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    locals.push(local, nameBuf, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);

    offset += local.length + nameBuf.length + compressed.length;
  }

  const centralSize = centrals.reduce((sum, buf) => sum + buf.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}

function userscript() {
  const header = [
    '// ==UserScript==',
    `// @name         ${manifest.name}`,
    '// @namespace    bilinovel-unlock',
    `// @version      ${manifest.version}`,
    `// @description  ${manifest.description}`,
    ...matches.map((m) => `// @match        ${m}`),
    '// @run-at       document-start',
    '// @inject-into  page',
    '// @grant        none',
    '// ==/UserScript==',
  ].join('\n');

  const css = JSON.stringify(read('src/unlock.css'));
  const injectCss = `(() => {
  const css = ${css};
  const apply = () => {
    const style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  };
  if (document.documentElement) apply();
  else {
    new MutationObserver((_, observer) => {
      if (document.documentElement) {
        observer.disconnect();
        apply();
      }
    }).observe(document, { childList: true });
  }
})();`;

  return [header, read('src/main-world.js'), injectCss, read('src/guard.js')].join('\n\n');
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const zipPath = path.join(dist, 'bilinovel-unlock.zip');
fs.writeFileSync(zipPath, zip(extensionFiles.map((name) => ({ name, data: fs.readFileSync(path.join(root, name)) }))));

const userscriptPath = path.join(dist, 'bilinovel-unlock.user.js');
fs.writeFileSync(userscriptPath, userscript());

console.log(`built ${path.relative(root, zipPath)} and ${path.relative(root, userscriptPath)}`);
