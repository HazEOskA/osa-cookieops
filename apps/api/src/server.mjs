import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT || 8080);
const rpcUrl = process.env.COOKIE_RPC_URL || 'https://rpc.cookiescan.io';
// Static build output: apps/web/dist
const webRoot = fileURLToPath(new URL('../../web/dist/', import.meta.url));
const indexFile = resolve(webRoot, 'index.html');

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function sendFile(req, res, filePath) {
  const info = await stat(filePath);
  if (!info.isFile()) return false;

  res.statusCode = 200;
  res.setHeader('content-type', contentTypes.get(extname(filePath).toLowerCase()) || 'application/octet-stream');
  res.setHeader('cache-control', filePath.includes(`${sep}assets${sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache');

  if (req.method === 'HEAD') {
    res.end();
    return true;
  }

  createReadStream(filePath).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === '/api/health' || pathname === '/health') {
      sendJson(res, 200, { ok: true, service: 'osa-cookieops', network: 'cookie-chain', rpcUrl });
      return;
    }

    if (pathname === '/api/config' || pathname === '/config') {
      sendJson(res, 200, { rpcUrl, network: 'cookie-chain' });
      return;
    }

    if (pathname.startsWith('/api/')) {
      sendJson(res, 404, { error: 'not_found' });
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, { error: 'method_not_allowed' });
      return;
    }

    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const requestedFile = resolve(webRoot, relativePath);
    const insideWebRoot = requestedFile === resolve(webRoot) || requestedFile.startsWith(`${resolve(webRoot)}${sep}`);

    if (!insideWebRoot) {
      sendJson(res, 400, { error: 'invalid_path' });
      return;
    }

    try {
      if (await sendFile(req, res, requestedFile)) return;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }

    if (pathname.startsWith('/assets/')) {
      sendJson(res, 404, { error: 'not_found' });
      return;
    }

    await sendFile(req, res, indexFile);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) sendJson(res, 500, { error: 'internal_error' });
    else res.destroy(error);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`osa-cookieops listening on 0.0.0.0:${port}`);
});
