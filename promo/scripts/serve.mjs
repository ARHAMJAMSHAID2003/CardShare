import http from 'node:http';
import fs from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROMO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.map': 'application/json',
};

function within(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

/** A local-only preview server; port 0 reserves an unused port for export/QA. */
export async function createPreviewServer({ port = 4173, root = PROMO_ROOT } = {}) {
  const canonicalRoot = await realpath(root);
  const server = http.createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
      return;
    }
    try {
      const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (requestPath.includes('\0') || requestPath.includes('\\')) {
        res.writeHead(400).end('Invalid path');
        return;
      }
      const segments = requestPath.split('/');
      if (segments.some((segment) => segment.startsWith('.') && segment !== '.')) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      let filePath = path.resolve(canonicalRoot, `.${requestPath}`);
      if (!within(canonicalRoot, filePath)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, 'index.html');
      filePath = await realpath(filePath);
      if (!within(canonicalRoot, filePath)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      const info = await stat(filePath);
      if (!info.isFile()) throw new Error('Not a file');
      const headers = {
        'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream',
        'Content-Length': info.size,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      };
      let start = 0;
      let end = info.size - 1;
      let status = 200;
      if (req.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (range && (range[1] || range[2])) {
          if (range[1]) {
            start = Number(range[1]);
            end = range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
          } else {
            start = Math.max(0, info.size - Number(range[2]));
          }
        } else start = info.size;
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= info.size) {
          res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
          return;
        }
        status = 206;
        headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
        headers['Content-Length'] = end - start + 1;
      }
      res.writeHead(status, headers);
      if (req.method === 'HEAD') res.end();
      else {
        const stream = fs.createReadStream(filePath, { start, end });
        stream.on('error', () => res.destroy());
        res.on('close', () => stream.destroy());
        stream.pipe(res);
      }
    } catch (error) {
      if (!res.headersSent) res.writeHead(error instanceof URIError ? 400 : 404);
      res.end('Not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  const address = server.address();
  return {
    server,
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeAllConnections();
    }),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be a valid TCP port.');
  const preview = await createPreviewServer({ port });
  console.log(`CardShare film preview: ${preview.origin}`);
  console.log('Press Ctrl+C to stop.');
  const stop = () => preview.close().finally(() => process.exit(0));
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}
