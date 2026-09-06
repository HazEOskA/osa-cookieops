# Architecture Lock v0.1

## Boundary

OSA CookieOps jest standalone. Nie importuje RuntimeV2 i nie zależy od żadnego istniejącego OSA runtime.
Reuse jest konceptualny: approval binding, evidence, deterministic hashing, explicit state transitions.

## Components

1. **Web** — odczyt stanu Cookie Chain, operator UI, przygotowanie/podpisanie transakcji.
2. **API** — lekki backend konfiguracyjny; agent provider w późniejszym scope.
3. **Core** — canonical payload + SHA-256 + transition policy.
4. **osa_intent Anchor program** — on-chain source of truth dla intent lifecycle.

## Security invariants

- brak private keys w backendzie,
- brak custody,
- brak automatycznej akcji finansowej w MVP,
- `execute` tylko po `approve`,
- owner signer wiąże każdą mutację,
- payload jest wiązany hashem,
- intent ma expiry,
- terminal states nie są odwracalne,
- deploy ma osobny approval gate.

## MVP transaction flow

```text
wallet
  └─ create_intent(payload_hash, expiry)
       └─ PROPOSED
           └─ approve_intent()
                └─ APPROVED
                    └─ execute_intent()
                         └─ EXECUTED + executed_slot
```

## Next scopes — NIE są częścią v0.1

- Nightly Wallet Standard adapter end-to-end,
- generated Anchor IDL client,
- Cookie MCP adapter,
- SPL/Token-2022 actions,
- swaps / LP / bridge,
- agent LLM provider,
- deploy GCP / public URL,
- Superteam submission.
