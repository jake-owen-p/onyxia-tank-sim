import { config } from 'dotenv';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import handler from '../api/index.js';
config({ path: '.env.local', quiet: true });
const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ttf': 'font/ttf', '.bin': 'application/octet-stream' };
createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) return handler(req, res);
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (['/','/play','/account','/history','/settings'].includes(pathname) ? '/index.html' : pathname));
    if (!file.startsWith(root + '/') || !(await stat(file)).isFile()) throw new Error('Not found');
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.statusCode = 404; res.end('Not found'); }
}).listen(Number(process.env.PORT || 8081), '127.0.0.1', () => console.log(`Game and API: http://127.0.0.1:${process.env.PORT || 8081}`));
