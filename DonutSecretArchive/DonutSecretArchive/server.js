const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const PACKS = path.join(ROOT, 'modpacks');
const PORT = Number(process.env.PORT) || 4173;
const TYPES = new Set(['.zip', '.mrpack', '.jar', '.7z', '.rar', '.tar', '.gz']);
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.ico': 'image/x-icon' };

function inventory() {
  fs.mkdirSync(PACKS, { recursive: true });
  return fs.readdirSync(PACKS, { withFileTypes: true })
    .filter(entry => entry.isFile() && TYPES.has(path.extname(entry.name).toLowerCase()))
    .map(entry => {
      const file = path.join(PACKS, entry.name);
      const stat = fs.statSync(file);
      const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      return { name: entry.name, size: stat.size, updated: stat.mtime.toISOString(), sha256: hash, url: `/modpacks/${encodeURIComponent(entry.name)}` };
    }).sort((a, b) => a.name.localeCompare(b.name));
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (pathname === '/api/packs') {
    try { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(inventory())); }
    catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: 'Could not read the modpack archive.' })); }
    return;
  }
  let target;
  try { target = path.resolve(ROOT, `.${decodeURIComponent(pathname)}`); } catch { res.writeHead(400); res.end('Bad request'); return; }
  if (!target.startsWith(ROOT + path.sep) && target !== ROOT) { res.writeHead(403); res.end('Forbidden'); return; }
  if (pathname === '/') target = path.join(ROOT, 'index.html');
  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    fs.createReadStream(target).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`DonutSecretArchive is running at http://localhost:${PORT}`));
