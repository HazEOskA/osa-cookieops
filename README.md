# OSA CookieOps

Audytowalny control plane dla agentów AI na Cookie Chain.

## Cel MVP

Realny on-chain flow bez custody i bez automatycznego obrotu środkami:

1. `PROPOSED` — agent/operator tworzy intent PDA.
2. `APPROVED` — właściciel portfela jawnie zatwierdza intent.
3. `EXECUTED` — właściciel wykonuje zatwierdzony intent on-chain.
4. Evidence — stan konta zawiera hash payloadu, sloty i timestampy.

MVP celowo nie wykonuje swapów ani transferów. Najpierw udowadnia bezpieczny model approval/evidence; adaptery Cookie MCP i akcje finansowe mogą wejść dopiero jako osobny scope.

## Cookie Chain

- RPC: `https://rpc.cookiescan.io`
- WebSocket: `https://wss.cookiescan.io`
- Explorer: `https://cookiescan.io`
- Wallet: Nightly / standardowy portfel SVM z custom RPC

## Repo

```text
apps/
  web/                 React/Vite UI shell
  api/                 minimalny backend health/config
packages/
  core/                policy + state machine, testy bez zależności
programs/
  osa_intent/          Anchor program
scripts/
  verify.mjs           lokalny verifier repo
  cookie-rpc-smoke.mjs opcjonalny live RPC smoke

docs/
  ARCHITECTURE.md
  DECISIONS.md
  BOUNTY.md
```

## Szybka walidacja bez instalowania zależności

```bash
npm test
npm run verify
```

Opcjonalny live RPC smoke (wymaga internetu):

```bash
npm run smoke:rpc
```

## Pełny dev setup

Wymagane później: Node 20+, Rust, Solana CLI, Anchor CLI.

```bash
npm install
npm run dev:web
```

Dla programu Anchor ustaw provider na Cookie Chain w `Anchor.toml` i przed deployem wygeneruj właściwy program id. Aktualny `declare_id!` jest development placeholderem i NIE jest deklaracją wdrożenia.

## Status

- architecture lock: ✅
- core transition tests: ✅ lokalnie
- repository verifier: ✅ lokalnie
- Cookie RPC live smoke: zależny od sieci
- Anchor build: wymaga toolchain/dependencies
- web build: wymaga `npm install`
- deploy: HOLD
- bounty submission: HOLD
