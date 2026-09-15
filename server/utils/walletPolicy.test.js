import test from 'node:test';
import assert from 'node:assert/strict';
import { assessWithdrawal, isFailedTransfer, isSuccessfulTransfer, quoteCollectionFee, toKobo } from './walletPolicy.js';

test('quotes collection fees in integer kobo', () => {
  assert.equal(toKobo(1000.25), 100025);
  assert.equal(quoteCollectionFee(100000, 1.5, 50), 6500);
});

test('queues large, daily-limit, and recently changed-account withdrawals', () => {
  const oldBank = new Date('2026-09-01T00:00:00Z').toISOString();
  const now = new Date('2026-09-09T12:00:00Z').getTime();
  assert.equal(assessWithdrawal({ amountKobo: 10_000_000, rollingDailyKobo: 0, bankChangedAt: oldBank, now }).needsReview, false);
  assert.match(assessWithdrawal({ amountKobo: 10_000_001, rollingDailyKobo: 0, bankChangedAt: oldBank, now }).reason, /automatic/);
  assert.match(assessWithdrawal({ amountKobo: 5_000_000, rollingDailyKobo: 21_000_000, bankChangedAt: oldBank, now }).reason, /daily/);
  assert.match(assessWithdrawal({ amountKobo: 100000, rollingDailyKobo: 0, bankChangedAt: new Date(now).toISOString(), now }).reason, /changed/);
});

test('normalizes terminal Monnify transfer statuses', () => {
  assert.equal(isSuccessfulTransfer('completed'), true);
  assert.equal(isSuccessfulTransfer('pending'), false);
  assert.equal(isFailedTransfer('REVERSED'), true);
  assert.equal(isFailedTransfer('IN_PROGRESS'), false);
});
