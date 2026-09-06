# Superteam Submission — OSA CookieOps

## Live application
https://osa-cookieops-bmnzqzarxa-ew.a.run.app/

## Source
https://github.com/HazEOskA/osa-cookieops

## Short description
OSA CookieOps is an auditable AI-agent execution control plane for Cookie Chain. Nightly users create a three-stage on-chain evidence trail — PROPOSED, APPROVED, EXECUTED — with the same SHA-256 payload binding. Every stage is a real Cookie Chain transaction, confirmed via RPC and linked to CookieScan. The MVP is intentionally non-custodial and does not move user assets.

## Why it is useful
AI agents often report actions without a durable proof layer. CookieOps separates proposal, human approval and execution, and only marks a stage complete after the chain confirms the transaction. This pattern can later gate swaps, LP actions, treasury operations or cookie-mcp commands.

## Demo steps
1. Configure Nightly custom SVM network with RPC `https://rpc.cookiescan.io` and WebSocket `https://wss.cookiescan.io`.
2. Fund the wallet with a small amount of COOK for fees via https://hyperlane.cookiescan.io if needed.
3. Open the live app and connect Nightly.
4. Click `PROPOSED ON-CHAIN` and sign.
5. Wait for confirmed signature/slot and open CookieScan evidence.
6. Repeat `APPROVED ON-CHAIN`.
7. Repeat `EXECUTED ON-CHAIN`.
8. Verify all three signatures share the same intent id and payload hash in their memo data.

## X thread draft
1/ Built OSA CookieOps for @TheCookieChain 🍪 — an auditable control plane for AI-agent actions on Cookie Chain.

2/ The problem: agents can say “done” without durable execution evidence. CookieOps separates PROPOSED → APPROVED → EXECUTED and only advances after a real on-chain transaction confirms.

3/ Nightly is the operator wallet. Each stage is signed by the user and written to Cookie Chain with the same SHA-256 payload binding, then the UI shows the confirmed signature + slot + CookieScan link.

4/ The MVP is intentionally non-custodial: no swaps, no asset transfer, no private keys in the backend. It demonstrates the primitive safely before attaching higher-risk actions such as swaps, LP, treasury ops or cookie-mcp commands.

5/ Try it: https://osa-cookieops-bmnzqzarxa-ew.a.run.app/
Source: https://github.com/HazEOskA/osa-cookieops
Need COOK for fees? Bridge: https://hyperlane.cookiescan.io

6/ CookieOps = agent proposes, human approves, chain proves. 🍪⚡
