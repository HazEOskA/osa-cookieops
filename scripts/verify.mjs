import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const required = [
  'README.md',
  'Anchor.toml',
  'programs/osa_intent/src/lib.rs',
  'packages/core/src/intent.mjs',
  'apps/web/src/App.tsx',
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
console.log('VERIFY PASS: repository structure and mandatory guards present');
