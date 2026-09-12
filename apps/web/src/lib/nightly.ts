import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { connection } from './chain';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const encoder = new TextEncoder();

export type IntentStage = 'PROPOSED' | 'APPROVED' | 'EXECUTED';

export type WalletAccount = {
  address: string;
};

type SignTransactionOutput = {
  signedTransaction: Uint8Array;
};

type NightlySolana = {
  features?: Record<string, unknown>;
};

declare global {
  interface Window {
    nightly?: {
      solana?: NightlySolana;
    };
  }
}

function feature<T extends object>(name: string): T {
  const nightly = window.nightly?.solana;
  if (!nightly) throw new Error('Nightly Wallet nie został wykryty. Zainstaluj Nightly i ustaw Cookie Chain custom RPC.');
  const value = nightly.features?.[name];
  if (!value || typeof value !== 'object') throw new Error(`Nightly nie udostępnia wymaganej funkcji: ${name}`);
  return value as T;
}

export function isNightlyInstalled() {
  return Boolean(window.nightly?.solana);
}

export async function connectNightly(): Promise<WalletAccount> {
  const connector = feature<{ connect(input?: { silent?: boolean }): Promise<{ accounts?: readonly WalletAccount[] }> }>('standard:connect');
  const result = await connector.connect({ silent: false });
  const account = result.accounts?.[0];
  if (!account?.address) throw new Error('Nightly nie zwrócił aktywnego konta.');
  return account;
}

export async function disconnectNightly() {
  try {
    const disconnector = feature<{ disconnect(): Promise<void> }>('standard:disconnect');
    await disconnector.disconnect();
  } catch {
    // Some Nightly builds may not expose disconnect. UI state is still cleared locally.
  }
}

export async function sha256Hex(input: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function cookiescanTransactionUrl(signature: string) {
  return `https://cookiescan.io/tx/${signature}`;
}

export async function sendCookieOpsEvidence(params: {
  account: WalletAccount;
  intentId: string;
  payloadHash: string;
  stage: IntentStage;
}) {
  const signer = feature<{
    signTransaction(input: {
      account: WalletAccount;
      transaction: Uint8Array;
      options?: { preflightCommitment?: 'processed' | 'confirmed' | 'finalized' };
    }): Promise<readonly SignTransactionOutput[]>;
  }>('standard:signTransaction');

  const latest = await connection.getLatestBlockhash('confirmed');
  const feePayer = new PublicKey(params.account.address);
  const memo = JSON.stringify({
    app: 'OSA_COOKIEOPS',
    v: 1,
    intent: params.intentId,
    stage: params.stage,
    payload: params.payloadHash,
  });

  const transaction = new Transaction({
    feePayer,
    recentBlockhash: latest.blockhash,
  }).add(new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: encoder.encode(memo) as unknown as TransactionInstruction['data'],
  }));

  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  const outputs = await signer.signTransaction({
    account: params.account,
    transaction: serialized,
    options: { preflightCommitment: 'confirmed' },
  });
  const signedTransaction = outputs[0]?.signedTransaction;
  if (!signedTransaction) throw new Error('Nightly nie zwrócił podpisanej transakcji.');

  const signature = await connection.sendRawTransaction(signedTransaction, {
    skipPreflight: false,
    maxRetries: 5,
  });

  const confirmation = await connection.confirmTransaction({
    signature,
    blockhash: latest.blockhash,
    lastValidBlockHeight: latest.lastValidBlockHeight,
  }, 'confirmed');

  if (confirmation.value.err) {
    throw new Error(`Cookie Chain odrzucił transakcję: ${JSON.stringify(confirmation.value.err)}`);
  }

  const status = await connection.getSignatureStatus(signature, { searchTransactionHistory: true });
  return {
    signature,
    slot: status.value?.slot ?? null,
    explorerUrl: cookiescanTransactionUrl(signature),
  };
}
