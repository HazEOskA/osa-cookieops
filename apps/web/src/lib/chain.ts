import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export const COOKIE_RPC_URL = import.meta.env.VITE_COOKIE_RPC_URL || 'https://rpc.cookiescan.io';
export const COOKIE_WS_URL = import.meta.env.VITE_COOKIE_WS_URL || 'https://wss.cookiescan.io';

export const connection = new Connection(COOKIE_RPC_URL, {
  commitment: 'confirmed',
  wsEndpoint: COOKIE_WS_URL,
});

export async function readWallet(address: string) {
  const publicKey = new PublicKey(address);
  const [lamports, signatures, slot] = await Promise.all([
    connection.getBalance(publicKey, 'confirmed'),
    connection.getSignaturesForAddress(publicKey, { limit: 8 }, 'confirmed'),
    connection.getSlot('confirmed'),
  ]);
  return {
    address,
    cook: lamports / LAMPORTS_PER_SOL,
    slot,
    signatures,
  };
}
