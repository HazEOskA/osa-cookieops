import { spawn } from 'node:child_process';

const port = Number(process.env.SMOKE_PORT || 18081);
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['apps/api/src/server.mjs'], {
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
child.stdout.on('data', (chunk) => { output += chunk; });
child.stderr.on('data', (chunk) => { output += chunk; });

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`server did not become ready\n${output}`);
}

try {
  await waitForServer();

  const checks = [
    ['/', 'text/html'],
    ['/api/health', 'application/json'],
    ['/api/config', 'application/json'],
    ['/operator/deep-link', 'text/html'],
  ];

  for (const [path, contentType] of checks) {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
    if (!response.headers.get('content-type')?.includes(contentType)) {
      throw new Error(`${path} returned unexpected content-type ${response.headers.get('content-type')}`);
    }
  }

  console.log('CLOUD RUN SMOKE PASS: UI + API + SPA fallback');
} finally {
  child.kill('SIGTERM');
}
