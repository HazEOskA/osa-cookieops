# Cookie Chain Bounty Fit

## Submission thesis

OSA CookieOps nie jest kolejnym wallet dashboardem. To auditowalny agent execution primitive:

- agent może proponować,
- operator musi jawnie zatwierdzić,
- wykonanie ma on-chain state/evidence,
- brak fake success.

## Demo sequence

1. Otwórz aplikację i pokaż Cookie Chain RPC slot.
2. Podłącz Nightly.
3. Zeskanuj COOK balance / recent tx.
4. Utwórz `DEMO_PING` intent.
5. Pokaż `PROPOSED` na Cookiescan.
6. Zatwierdź intent podpisem walleta.
7. Pokaż `APPROVED`.
8. Execute i pokaż `EXECUTED` + slot.
9. Odśwież stronę i odczytaj ten sam on-chain evidence.
