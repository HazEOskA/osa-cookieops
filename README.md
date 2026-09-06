# OSA CookieOps

Audytowalny control plane dla agentów AI na Cookie Chain.

## Co robi aplikacja

CookieOps rozdziela działanie agenta na trzy jawne fazy:

1. `PROPOSED` — operator Nightly podpisuje propozycję.
2. `APPROVED` — operator podpisuje zatwierdzenie tej samej intencji.
3. `EXECUTED` — operator podpisuje wykonanie.

Każdy etap jest osobną realną transakcją na Cookie Chain. Transakcja zawiera `intent id`, etap oraz ten sam SHA-256 hash payloadu. UI uznaje etap za zakończony dopiero po confirmation z Cookie Chain RPC i pokazuje signature, slot oraz link do CookieScan.

MVP jest celowo **non-custodial**: nie przechowuje private keys, nie wykonuje swapów i nie transferuje aktywów. Demonstracja pokazuje bezpieczny primitive, który później może gate'ować akcje finansowe lub `cookie-mcp`.

## Live

https://osa-cookieops-bmnzqzarxa-ew.a.run.app/

## Cookie Chain

- RPC: `https://rpc.cookiescan.io`
- WebSocket: `https://wss.cookiescan.io`
- Explorer: `https://cookiescan.io`
- Bridge: `https://hyperlane.cookiescan.io`
- Wallet: Nightly z ustawionym custom SVM RPC

## Bounty on-chain flow

Bounty MVP używa standardowego Solana Memo Programu na Cookie Chain:

`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`

Przykładowy payload memo:

```json
{
  "app": "OSA_COOKIEOPS",
  "v": 1,
  "intent": "...",
  "stage": "APPROVED",
  "payload": "<sha256>"
}
```

Nightly podpisuje transakcję po stronie użytkownika. Backend nigdy nie dostaje klucza prywatnego.

## Repo

```text
apps/
  web/                 React/Vite UI + Nightly + Cookie Chain TX flow
  api/                 Cloud Run static/API server
packages/
  core/                policy + state-machine tests
programs/
  osa_intent/          experimental Anchor implementation (not required by bounty MVP)
scripts/
  verify.mjs
  cookie-rpc-smoke.mjs
  cloud-run-smoke.mjs
docs/
  ARCHITECTURE.md
  DECISIONS.md
  BOUNTY.md
  SUBMISSION.md
```

## Quick validation

```bash
npm test
npm run verify
```

Optional live RPC smoke:

```bash
npm run smoke:rpc
```

## Cloud Run

```bash
npm install
npm run gcp-build
npm run smoke:cloudrun
npm start
```

Cloud Run contract:

- `npm run gcp-build` → builds `apps/web/dist`
- `npm start` → listens on `0.0.0.0:$PORT`
- `/` → UI
- `/api/health` → health/config evidence

## Nightly setup

In Nightly add/select Cookie Chain as a custom SVM network:

- RPC: `https://rpc.cookiescan.io`
- WebSocket: `https://wss.cookiescan.io`

The wallet needs a small COOK balance for transaction fees. Use the official community bridge linked above if needed.

## Security

- no private keys in backend
- no custody
- no asset transfer in bounty demo
- every stage requires Nightly signature
- same SHA-256 payload binding across stages
- confirmation required before state advances
- error state shown to user

## Status

- Nightly integration: ✅ code
- real Cookie Chain memo transaction flow: ✅ code
- confirmation/error UI: ✅ code
- Cloud Run packaging: ✅
- public live URL: ✅ existing deployment; redeploy required after the latest bounty-complete commit
- actual signed Cookie Chain demo signatures: require user Nightly + COOK
- Superteam submission: prepared in `docs/SUBMISSION.md`
