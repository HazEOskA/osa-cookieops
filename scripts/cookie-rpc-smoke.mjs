const url = process.env.COOKIE_RPC_URL || 'https://rpc.cookiescan.io';
const body = { jsonrpc: '2.0', id: 1, method: 'getSlot', params: [{ commitment: 'confirmed' }] };
const response = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
  signal: AbortSignal.timeout(10_000),
});
if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
const json = await response.json();
if (!Number.isInteger(json.result)) throw new Error(`unexpected RPC payload: ${JSON.stringify(json)}`);
console.log(JSON.stringify({ ok: true, rpc: url, slot: json.result }));
