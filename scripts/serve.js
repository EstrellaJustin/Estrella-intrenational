/* ============================================================
   伊斯特拉国际 · 零依赖本地静态服务器
   用法：node scripts/serve.js [--port 4173] [--no-open]
   ============================================================ */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const portArg = args.find((a) => a.startsWith('--port='));
const port = portArg ? Number(portArg.split('=')[1]) : (process.env.PORT || 4173);
const openBrowser = !args.includes('--no-open');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (urlPath === '/') urlPath = '/index.html';

    const filePath = path.normalize(path.join(root, urlPath));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<h1 style="font-family:sans-serif">404 · 页面不存在</h1><p><a href="/">返回首页</a></p>');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  } catch (e) {
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log('');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │  伊斯特拉国际 · 本地开发服务器已启动          │');
  console.log(`  │  地址: ${url.padEnd(44)}│`);
  console.log('  └──────────────────────────────────────────────┘');
  console.log('');
  if (openBrowser) {
    const cmd = process.platform === 'win32' ? `start "" ${url}` : `open ${url}`;
    setTimeout(() => exec(cmd), 400);
  }
});
