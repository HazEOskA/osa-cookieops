import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const required = [
  'README.md',
  'Anchor.toml',
  'programs/osa_intent/src/lib.rs',
  'packages/core/src/intent.mjs',
  'apps/web/src/App.tsx',
  'apps/api/src/server.mjs',
  'docs/ARCHITECTURE.md',
];
for (const path of required) await access(path, constants.R_OK);

const rust = await readFile('programs/osa_intent/src/lib.rs', 'utf8');
for (const guard of ['InvalidTransition', 'IntentExpired', 'has_one = owner', 'payload_hash']) {
  if (!rust.includes(guard)) throw new Error(`missing Rust guard: ${guard}`);
}

const arch = await readFile('docs/ARCHITECTURE.md', 'utf8');
if (!arch.includes('brak custody') && !arch.includes('brak private keys')) {
  throw new Error('security boundary missing');
}

const rootPackage = JSON.parse(await readFile('package.json', 'utf8'));
for (const script of ['start', 'gcp-build', 'build:web']) {
  if (!rootPackage.scripts?.[script]) throw new Error(`missing Cloud Run script: ${script}`);
}

const webTsconfig = JSON.parse(await readFile('apps/web/tsconfig.json', 'utf8'));
if (!webTsconfig.compilerOptions?.types?.includes('vite/client')) {
  throw new Error('Vite import.meta.env typings missing');
}

const server = await readFile('apps/api/src/server.mjs', 'utf8');
for (const guard of ['0.0.0.0', '/api/health', '/api/config', 'apps/web/dist']) {
  if (!server.includes(guard)) throw new Error(`missing Cloud Run server guard: ${guard}`);
}

console.log('VERIFY PASS: repository, security and Cloud Run packaging guards present');
