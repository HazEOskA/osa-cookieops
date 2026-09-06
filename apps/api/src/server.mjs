import http from 'node:http';

const port = Number(process.env.PORT || 8080);
const rpcUrl = process.env.COOKIE_RPC_URL || 'https://rpc.cookiescan.io';

const server = http.createServer((req, res) => {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  if (req.url === '/health') {
    res.end(JSON.stringify({ ok: true, service: 'osa-cookieops-api', rpcUrl }));
    return;
  }
  if (req.url === '/config') {
    res.end(JSON.stringify({ rpcUrl, network: 'cookie-chain' }));
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'not_found' }));
});

server.listen(port, () => {
  console.log(`osa-cookieops-api listening on :${port}`);
});
