# Decisions

## D001 — standalone
CookieOps ma własne repo i lifecycle. Brak runtime coupling do innych projektów OSA.

## D002 — safe MVP
Pierwszy on-chain execute to własna zmiana stanu programu, nie transfer/swap.

## D003 — hash binding
Payload intentu jest canonicalizowany i wiązany SHA-256. UI/backend nie mogą po approval podmienić treści bez wykrycia.

## D004 — owner approval
MVP wymaga podpisu właściciela do approve i execute. Delegated executors są późniejszym, osobno zatwierdzanym scope.

## D005 — Cookie Chain endpoint
Domyślny RPC: https://rpc.cookiescan.io. WebSocket: https://wss.cookiescan.io.

## D006 — deploy hold
Brak deployu i bounty submission w bieżącym scope.
