# OSA CookieOps

**OSA CookieOps** is a standalone, auditable on-chain control plane for AI agents operating on Cookie Chain.

The MVP deliberately separates **proposal**, **approval**, and **execution**. Agents can suggest an action, but the owner remains the authority that approves and executes it.

## Core flow

```
PROPOSED -> APPROVED -> EXECUTED
     \-> CANCELLED
```

The Anchor program stores an intent PDA bound to the owner, nonce, payload hash, expiry, status, timestamps, and execution evidence.

## Safety properties

- no custody in the MVP
- no autonomous swaps in the MVP
- owner-bound approval
- SHA-256 payload binding
- expiry guard
- terminal EXECUTED / CANCELLED states
- execution slot + timestamp evidence
- proposal and execution are separate transactions

## Repository layout

```
apps/
  api/                  small read-only config/health API
  web/                  React/Vite operator interface
packages/
  core/                 off-chain policy/state-machine mirror + tests
programs/
  osa_intent/           Anchor program
scripts/
  verify.mjs            repository verifier
  cookie-rpc-smoke.mjs  Cookie Chain JSON-RPC smoke test
docs/
  ARCHITECTURE.md
  DECISIONS.md
  BOUNTY.md
```

## Cookie Chain

Default RPC:

```
https://rpc.cookiescan.io
```

Cookie Chain uses the Solana runtime, so standard Solana/Anchor tooling and wallet flows remain applicable.

## Local verification

Core policy tests:

```bash
npm test
```

Repository structural verification:

```bash
npm run verify
```

Cookie Chain RPC smoke:

```bash
npm run smoke:rpc
```

API:

```bash
npm run api
```

Web UI:

```bash
npm install
npm run web
```

Anchor program (requires Rust, Solana CLI and Anchor CLI):

```bash
anchor build
anchor test
```

## Verification status of this artifact

Verified in the build environment:

- core policy tests: PASS
- repository verifier: PASS
- Node syntax checks: PASS
- API health/config smoke: PASS

Not claimed as verified in the build environment:

- Anchor compilation (toolchain unavailable)
- live Cookie Chain RPC call (network/DNS restricted in build container)
- deployment
- bounty submission

## Status

**v0.1 — local standalone MVP scaffold. Deploy and bounty submission are intentionally HOLD.**
