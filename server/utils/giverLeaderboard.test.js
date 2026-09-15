import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDemoGiverLeaderboard,
  buildGiverLeaderboard,
  buildPersonalGiverPerformance,
} from './giverLeaderboard.js';

const now = new Date('2026-09-09T12:00:00.000Z');
const users = [
  { id: 'a', name: 'Ada', active: true, profile_img_url: '/ada.jpg' },
  { id: 'b', name: 'Bola', active: true, profile_img_url: null },
  { id: 'c', name: 'Chidi', active: false, profile_img_url: null },
];
const profiles = [
  { user_id: 'a', location: 'Lagos', verification_status: 'verified', level: 'bronze' },
  { user_id: 'b', location: 'Abuja', verification_status: 'unverified', level: 'novice' },
];
const giveaways = [
  { id: 'g1', created_by: 'a', giveaway_type: 'challenge', prize_amount: 5000, is_funded: true, is_deleted: false, is_cancelled: false },
  { id: 'free', created_by: 'a', giveaway_type: 'free', prize_amount: 0, is_funded: true, is_deleted: false, is_cancelled: false },
];

test('scores qualifying actions equally and deduplicates a funded giveaway', () => {
  const transactions = [
    { funder_id: 'a', purpose: 'request', status: 'released', is_anonymous: false, released_at: '2026-09-02T09:00:00Z' },
    { funder_id: 'a', purpose: 'giveaway', giveaway_id: 'g1', status: 'held', is_anonymous: false, held_at: '2026-09-03T09:00:00Z' },
    { funder_id: 'a', purpose: 'giveaway', giveaway_id: 'g1', status: 'released', is_anonymous: false, held_at: '2026-09-03T09:00:00Z' },
  ];
  const result = buildGiverLeaderboard({ transactions, users, profiles, giveaways, now });
  assert.equal(result.givers[0].points, 200);
  assert.equal(result.givers[0].impactCount, 2);
  assert.equal(result.givers[0].helpCount, 1);
  assert.equal(result.givers[0].giveawayCount, 1);
});

test('uses UTC month boundaries and supports all-time ranking', () => {
  const transactions = [
    { funder_id: 'a', purpose: 'request', status: 'released', is_anonymous: false, released_at: '2026-08-31T23:59:59Z' },
    { funder_id: 'b', purpose: 'request', status: 'released', is_anonymous: false, released_at: '2026-09-01T00:00:00Z' },
  ];
  const monthly = buildGiverLeaderboard({ transactions, users, profiles, giveaways, now });
  const allTime = buildGiverLeaderboard({ transactions, users, profiles, giveaways, period: 'all', now });
  assert.deepEqual(monthly.givers.map((giver) => giver.user.id), ['b']);
  assert.equal(allTime.givers.length, 2);
});

test('excludes anonymous, inactive, pending, failed, refunded, disputed, and free-giveaway activity', () => {
  const transactions = [
    { funder_id: 'a', purpose: 'request', status: 'released', is_anonymous: true, released_at: '2026-09-02T09:00:00Z' },
    { funder_id: 'c', purpose: 'request', status: 'released', is_anonymous: false, released_at: '2026-09-02T09:00:00Z' },
    ...['pending', 'failed', 'refunded', 'disputed'].map((status) => ({ funder_id: 'a', purpose: 'request', status, is_anonymous: false, released_at: '2026-09-02T09:00:00Z' })),
    { funder_id: 'a', purpose: 'giveaway', giveaway_id: 'free', status: 'held', is_anonymous: false, held_at: '2026-09-03T09:00:00Z' },
  ];
  const result = buildGiverLeaderboard({ transactions, users, profiles, giveaways, now });
  assert.equal(result.givers.length, 0);
});

test('breaks equal-score ties by recency and then name', () => {
  const transactions = [
    { funder_id: 'a', purpose: 'request', status: 'released', is_anonymous: false, released_at: '2026-09-02T09:00:00Z' },
    { funder_id: 'b', purpose: 'request', status: 'released', is_anonymous: false, released_at: '2026-09-04T09:00:00Z' },
  ];
  const result = buildGiverLeaderboard({ transactions, users, profiles, giveaways, now });
  assert.deepEqual(result.givers.map((giver) => giver.user.id), ['b', 'a']);
  assert.deepEqual(result.givers.map((giver) => giver.rank), [1, 2]);
});

test('masks a member who chooses anonymous Givers-board visibility', () => {
  const transactions = [
    { funder_id: 'a', purpose: 'request', status: 'released', is_anonymous: false, released_at: '2026-09-02T09:00:00Z' },
  ];
  const privateProfiles = [{ ...profiles[0], leaderboard_anonymous: true }];
  const result = buildGiverLeaderboard({ transactions, users, profiles: privateProfiles, giveaways, now });
  assert.deepEqual(result.givers[0].user, { id: 'anonymous-1', name: 'Anonymous Giver', profileImg: '' });
  assert.equal(result.givers[0].location, '');
  assert.equal(result.givers[0].isVerified, false);
  assert.equal(result.givers[0].points, 100);
  assert.equal(JSON.stringify(result).includes('Ada'), false);
});

test('provides clearly marked demo rankings without transaction records', () => {
  const result = buildDemoGiverLeaderboard('month');
  assert.equal(result.isDemo, true);
  assert.equal(result.givers.length, 6);
  assert.equal(result.givers.every((giver) => giver.isDemo), true);
});

test('builds private performance with nearby ranks and next-position progress', () => {
  const transactions = [
    { funder_id: 'a', purpose: 'request', status: 'released', is_anonymous: false, released_at: '2026-09-02T09:00:00Z' },
    { funder_id: 'b', purpose: 'request', status: 'released', is_anonymous: false, released_at: '2026-09-04T09:00:00Z' },
  ];
  const board = buildGiverLeaderboard({ transactions, users, profiles, giveaways, now, viewerUserId: 'a', limit: Infinity });
  const result = buildPersonalGiverPerformance(board, 'a');
  assert.equal(result.performance.rank, 2);
  assert.equal(result.performance.points, 100);
  assert.equal(result.performance.nextRank.actionsNeeded, 1);
  assert.equal(result.nearbyGivers.length, 2);
  assert.equal(JSON.stringify(result).includes('isViewer'), false);
});

test('returns a useful zero-impact personal state without demo data', () => {
  const board = buildGiverLeaderboard({ users, profiles, giveaways, now, viewerUserId: 'a', limit: Infinity });
  const result = buildPersonalGiverPerformance(board, 'a');
  assert.equal(result.performance.isRanked, false);
  assert.equal(result.performance.points, 0);
  assert.equal(result.performance.nextRank.actionsNeeded, 1);
  assert.deepEqual(result.nearbyGivers, []);
});
