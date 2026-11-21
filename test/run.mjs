// Loads the fixture chapter page in mobile-emulated Edge with the built userscript
// injected at document start, and checks the dialog never appears and scrolling works.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const userscript = fs
  .readFileSync(path.join(root, 'dist/bilinovel-unlock.user.js'), 'utf8')
  .replace(/^[\s\S]*?==\/UserScript==\s*/, '');

// `fallback` mode drops the main-world defuse and keeps only the CSS and guard layers,
// proving the page stays readable even when the detection itself is not disarmed.
const fallbackOnly = process.argv[2] === 'fallback';
const script = fallbackOnly ? userscript.replace(/^[\s\S]*?^(\(\(\) => \{\n {2}const css = )/m, '$1') : userscript;

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 412, height: 860 },
  userAgent:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 EdgA/130.0.0.0',
  isMobile: true,
  hasTouch: true,
});
await context.addInitScript(`try { ${script} } catch (e) { window.__initErr = e.stack; }`);

const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (err) => pageErrors.push(err.stack || err.message));

await page.goto('http://localhost:8765/novel/4502/260876.html', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);

const result = await page.evaluate(() => {
  const dialog = document.getElementById('adblock-dialog');
  window.scrollTo(0, 800);
  return {
    dialogVisible: !!dialog && getComputedStyle(dialog).display !== 'none',
    noScroll: document.body.classList.contains('no-scroll'),
    bodyOverflowY: getComputedStyle(document.body).overflowY,
    scrollY: window.scrollY,
    adSlots: document.querySelectorAll('ins.adsbygoogle').length,
    contentText: document.getElementById('acontent').textContent.slice(0, 12),
    errs: window.__errs || [],
    initErr: window.__initErr || null,
  };
});

console.log(JSON.stringify({ result, pageErrors }, null, 2));
await browser.close();
process.exit(result.dialogVisible || result.noScroll || result.scrollY === 0 ? 1 : 0);
