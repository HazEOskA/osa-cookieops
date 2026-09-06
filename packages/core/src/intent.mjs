import { createHash } from 'node:crypto';

export const IntentStatus = Object.freeze({
  PROPOSED: 'PROPOSED',
  APPROVED: 'APPROVED',
  EXECUTED: 'EXECUTED',
  CANCELLED: 'CANCELLED',
});

export const ActionType = Object.freeze({
  DEMO_PING: 1,
  REFRESH_WALLET: 2,
});

export function canonicalPayload(payload) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('payload must be an object');
  }
  return JSON.stringify(sortObject(payload));
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortObject(value[key])]));
  }
  return value;
}

export function hashPayload(payload) {
  return createHash('sha256').update(canonicalPayload(payload)).digest('hex');
}

export function createIntent({ owner, nonce, actionType, payload, now, expiresAt }) {
  if (!owner) throw new Error('owner required');
  if (!Number.isSafeInteger(nonce) || nonce < 0) throw new Error('nonce must be a non-negative safe integer');
  if (!Number.isSafeInteger(actionType) || actionType < 0 || actionType > 255) throw new Error('actionType must fit u8');
  if (!Number.isFinite(now) || !Number.isFinite(expiresAt) || expiresAt <= now) throw new Error('invalid expiry');

  return Object.freeze({
    owner,
    nonce,
    actionType,
    payloadHash: hashPayload(payload),
    status: IntentStatus.PROPOSED,
    createdAt: now,
    expiresAt,
    approvedAt: null,
    executedAt: null,
  });
}

export function transition(intent, target, now) {
  if (!intent || typeof intent !== 'object') throw new TypeError('intent required');
  if (!Number.isFinite(now)) throw new TypeError('now must be finite');

  if (target !== IntentStatus.CANCELLED && now > intent.expiresAt) {
    throw new Error('INTENT_EXPIRED');
  }

  const allowed = {
    [IntentStatus.PROPOSED]: new Set([IntentStatus.APPROVED, IntentStatus.CANCELLED]),
    [IntentStatus.APPROVED]: new Set([IntentStatus.EXECUTED, IntentStatus.CANCELLED]),
    [IntentStatus.EXECUTED]: new Set(),
    [IntentStatus.CANCELLED]: new Set(),
  };

  if (!allowed[intent.status]?.has(target)) {
    throw new Error(`INVALID_TRANSITION:${intent.status}->${target}`);
  }

  return Object.freeze({
    ...intent,
    status: target,
    approvedAt: target === IntentStatus.APPROVED ? now : intent.approvedAt,
    executedAt: target === IntentStatus.EXECUTED ? now : intent.executedAt,
  });
}

export function verifyPayload(intent, payload) {
  return intent.payloadHash === hashPayload(payload);
}
