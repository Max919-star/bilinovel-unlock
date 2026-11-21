// Local replica of a bilinovel mobile chapter page, driven by the site's real (archived)
// anti-adblock code. The ad script URL always 404s, which is what an ad blocker produces.
// /__userscript serves the built dist/bilinovel-unlock.user.js so a test browser can run it
// at document start, e.g. via CDP Page.addScriptToEvaluateOnNewDocument with a sync XHR + eval.
// Usage: node test/serve.mjs [port]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || 8765);

const antiAdblock = fs.readFileSync(path.join(root, 'research/readtools.js'), 'utf8').split('\n')[594];
const paragraphs = Array.from({ length: 80 }, (_, i) => `<p>第 ${i + 1} 段：白流雪再次拿出异界的碎片，凝视着地球仪。</p>`).join('\n');

const page = `<!DOCTYPE html>
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<meta name="viewport" content="initial-scale=1.0,width=device-width">
<title>fixture chapter</title>
<style>body{margin:0;font-size:18px;line-height:1.8}#acontent{padding:0 16px}</style>
</head>
<body id="aread">
<div class="main"><div id="abox" class="abox"><div id="apage" class="apage">
<div class="atitle"><h1 id="atitle">79. 异空间(5)</h1></div>
<div id="acontent" class="contente">${paragraphs}</div>
</div></div></div>
<script>window.addEventListener('error', (e) => { window.__errs = (window.__errs || []).concat((e.error && e.error.stack) || e.message); });</script>
<script async src="/pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0"></script>
<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-0" data-ad-slot="1" data-ad-format="auto"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
<script src="/themes/zhmb/js/anti-adblock.js"></script>
</body>
</html>`;

const routes = {
  '/novel/4502/260876.html': ['text/html; charset=utf-8', page],
  '/themes/zhmb/js/anti-adblock.js': ['application/javascript; charset=utf-8', antiAdblock],
  '/public/mesp.css': ['text/css; charset=utf-8', fs.readFileSync(path.join(root, 'research/mesp.css'))],
};

http
  .createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/__userscript') {
      res.writeHead(200, { 'content-type': 'application/javascript; charset=utf-8' });
      res.end(fs.readFileSync(path.join(root, 'dist/bilinovel-unlock.user.js')));
      return;
    }
    const route = routes[pathname];
    if (route) {
      res.writeHead(200, { 'content-type': route[0] });
      res.end(route[1]);
      return;
    }
    setTimeout(() => {
      res.writeHead(404);
      res.end();
    }, req.url.includes('adsbygoogle') ? 1500 : 0);
  })
  .listen(port, () => console.log(`fixture on http://localhost:${port}/novel/4502/260876.html`));
