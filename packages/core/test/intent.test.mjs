import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ActionType,
  IntentStatus,
  canonicalPayload,
  createIntent,
  hashPayload,
  transition,
  verifyPayload,
} from '../src/intent.mjs';

test('canonical payload is stable across key order', () => {
  assert.equal(canonicalPayload({ b: 2, a: 1 }), canonicalPayload({ a: 1, b: 2 }));
  assert.equal(hashPayload({ b: 2, a: 1 }), hashPayload({ a: 1, b: 2 }));
});

test('intent starts PROPOSED and binds payload hash', () => {
  const payload = { kind: 'DEMO_PING', memo: 'cookieops' };
  const intent = createIntent({
    owner: 'owner-pubkey', nonce: 1, actionType: ActionType.DEMO_PING,
    payload, now: 100, expiresAt: 200,
  });
  assert.equal(intent.status, IntentStatus.PROPOSED);
  assert.equal(verifyPayload(intent, payload), true);
  assert.equal(verifyPayload(intent, { ...payload, memo: 'tampered' }), false);
});

test('happy path requires explicit approval before execution', () => {
  let intent = createIntent({
    owner: 'owner-pubkey', nonce: 2, actionType: ActionType.DEMO_PING,
    payload: { kind: 'DEMO_PING' }, now: 100, expiresAt: 200,
  });
  assert.throws(() => transition(intent, IntentStatus.EXECUTED, 110), /INVALID_TRANSITION/);
  intent = transition(intent, IntentStatus.APPROVED, 110);
  assert.equal(intent.status, IntentStatus.APPROVED);
  intent = transition(intent, IntentStatus.EXECUTED, 120);
  assert.equal(intent.status, IntentStatus.EXECUTED);
  assert.equal(intent.executedAt, 120);
});

test('expired intent cannot be approved or executed', () => {
  const intent = createIntent({
    owner: 'owner-pubkey', nonce: 3, actionType: ActionType.DEMO_PING,
    payload: {}, now: 100, expiresAt: 101,
  });
  assert.throws(() => transition(intent, IntentStatus.APPROVED, 102), /INTENT_EXPIRED/);
});

test('cancel is terminal', () => {
  let intent = createIntent({
    owner: 'owner-pubkey', nonce: 4, actionType: ActionType.DEMO_PING,
    payload: {}, now: 100, expiresAt: 200,
  });
  intent = transition(intent, IntentStatus.CANCELLED, 105);
  assert.equal(intent.status, IntentStatus.CANCELLED);
  assert.throws(() => transition(intent, IntentStatus.APPROVED, 110), /INVALID_TRANSITION/);
});
