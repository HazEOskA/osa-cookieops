# Cookie Chain Bounty Fit

## Submission thesis

OSA CookieOps nie jest kolejnym wallet dashboardem. To audytowalny execution-control primitive dla AI:

- Nightly jest portfelem operatora,
- agent/operator tworzy intent,
- PROPOSED, APPROVED i EXECUTED są trzema realnymi Cookie Chain transactions,
- wszystkie trzy transakcje wiążą ten sam intent id + SHA-256 payload hash,
- UI przechodzi dalej dopiero po RPC confirmation,
- brak custody i brak fake success.

## On-chain implementation used for the bounty

Bounty MVP używa kanonicznego Solana Memo Programu (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`) na Cookie Chain. To pozwala pokazać prawdziwe, publiczne i tanie evidence bez konieczności wdrażania custom programu tylko po to, żeby spełnić demo.

Każdy memo zapisuje:

- `app: OSA_COOKIEOPS`
- `intent`
- `stage`
- `payload` (SHA-256)

Repo nadal zawiera eksperymentalny program Anchor `osa_intent`, ale nie jest on wymagany do bounty MVP i nie deklarujemy jego deploymentu.

## Demo sequence

1. W Nightly ustaw Cookie Chain custom RPC `https://rpc.cookiescan.io`.
2. Otwórz aplikację i połącz Nightly.
3. Pokaż COOK balance, current slot i recent transactions.
4. Kliknij `PROPOSED ON-CHAIN` i podpisz.
5. Poczekaj na confirmation i otwórz signature w CookieScan.
6. Kliknij `APPROVED ON-CHAIN` i podpisz.
7. Kliknij `EXECUTED ON-CHAIN` i podpisz.
8. Pokaż trzy signatures + slots i ten sam intent/payload hash.
9. Odśwież stronę — lokalny dashboard zachowuje ostatni intent, a on-chain signatures pozostają publiczne.
