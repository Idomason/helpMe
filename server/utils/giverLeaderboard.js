const GIVEAWAY_STATUSES = new Set(['held', 'releasing', 'released']);

export const startOfUtcMonth = (date = new Date()) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const qualifiesForPeriod = (timestamp, periodStart) => {
  if (!timestamp) return false;
  const value = new Date(timestamp);
  return !Number.isNaN(value.getTime()) && (!periodStart || value >= periodStart);
};

export function buildGiverLeaderboard({
  transactions = [],
  users = [],
  profiles = [],
  giveaways = [],
  period = 'month',
  now = new Date(),
  limit = 50,
  viewerUserId,
} = {}) {
  const selectedPeriod = period === 'all' ? 'all' : 'month';
  const periodStart = selectedPeriod === 'month' ? startOfUtcMonth(now) : null;
  const activeUsers = new Map(users.filter((user) => user.active !== false).map((user) => [user.id, user]));
  const profileByUser = new Map(profiles.map((profile) => [profile.user_id, profile]));
  const giveawayById = new Map(giveaways.map((giveaway) => [giveaway.id, giveaway]));
  const impactByUser = new Map();
  const countedGiveaways = new Set();

  const addImpact = (userId, kind, occurredAt) => {
    const current = impactByUser.get(userId) || {
      helpCount: 0,
      giveawayCount: 0,
      latestImpactAt: null,
    };
    if (kind === 'help') current.helpCount += 1;
    else current.giveawayCount += 1;
    if (!current.latestImpactAt || new Date(occurredAt) > new Date(current.latestImpactAt)) {
      current.latestImpactAt = occurredAt;
    }
    impactByUser.set(userId, current);
  };

  for (const transaction of transactions) {
    const userId = transaction.funder_id;
    if (!userId || transaction.is_anonymous === true || !activeUsers.has(userId)) continue;

    if (
      transaction.purpose === 'request' &&
      transaction.status === 'released' &&
      qualifiesForPeriod(transaction.released_at, periodStart)
    ) {
      addImpact(userId, 'help', transaction.released_at);
      continue;
    }

    if (transaction.purpose !== 'giveaway' || !GIVEAWAY_STATUSES.has(transaction.status)) continue;
    const giveaway = giveawayById.get(transaction.giveaway_id);
    if (
      !giveaway ||
      giveaway.giveaway_type !== 'challenge' ||
      Number(giveaway.prize_amount) <= 0 ||
      giveaway.is_funded !== true ||
      giveaway.is_deleted === true ||
      giveaway.is_cancelled === true ||
      giveaway.created_by !== userId ||
      countedGiveaways.has(giveaway.id) ||
      !qualifiesForPeriod(transaction.held_at, periodStart)
    ) continue;

    countedGiveaways.add(giveaway.id);
    addImpact(userId, 'giveaway', transaction.held_at);
  }

  const ranked = [...impactByUser.entries()]
    .map(([userId, impact]) => {
      const user = activeUsers.get(userId);
      const profile = profileByUser.get(userId);
      const impactCount = impact.helpCount + impact.giveawayCount;
      return {
        user: {
          id: user.id,
          name: user.name,
          profileImg: user.profile_img_url || 'https://www.gravatar.com/avatar/?d=mp',
        },
        location: profile?.location || '',
        isAnonymous: profile?.leaderboard_anonymous === true,
        isVerified: profile?.verification_status === 'verified',
        level: profile?.level || 'novice',
        points: impactCount * 100,
        impactCount,
        helpCount: impact.helpCount,
        giveawayCount: impact.giveawayCount,
        latestImpactAt: impact.latestImpactAt,
      };
    })
    .sort((a, b) =>
      b.points - a.points ||
      new Date(b.latestImpactAt).getTime() - new Date(a.latestImpactAt).getTime() ||
      a.user.name.localeCompare(b.user.name),
    )
    .map((giver, index) => {
      const isViewer = viewerUserId === giver.user.id;
      if (!giver.isAnonymous) return { ...giver, rank: index + 1, ...(viewerUserId ? { isViewer } : {}) };
      return {
        ...giver,
        rank: index + 1,
        user: { id: `anonymous-${index + 1}`, name: 'Anonymous Giver', profileImg: '' },
        location: '',
        isVerified: false,
        level: 'private',
        ...(viewerUserId ? { isViewer } : {}),
      };
    });

  const requestedLimit = limit === Infinity
    ? ranked.length
    : Math.max(1, Math.min(Number(limit) || 50, 50));

  return {
    period: selectedPeriod,
    periodStart: periodStart?.toISOString() || null,
    summary: {
      totalGivers: ranked.length,
      totalImpactActions: ranked.reduce((total, giver) => total + giver.impactCount, 0),
    },
    givers: ranked.slice(0, requestedLimit),
  };
}

export function buildPersonalGiverPerformance(leaderboard, userId) {
  const givers = leaderboard.givers || [];
  const member = givers.find((giver) => giver.isViewer || giver.user.id === userId);
  const position = member ? givers.indexOf(member) : -1;
  const rank = member?.rank || null;
  const nextGiver = position > 0 ? givers[position - 1] : null;
  const pointsNeeded = rank === 1 ? 0 : Math.max(100, (nextGiver?.points || 0) - (member?.points || 0));
  const nearby = member
    ? givers.slice(Math.max(0, position - 2), position + 3)
    : givers.slice(0, 3);

  const cleanGiver = (giver) => {
    if (!giver) return null;
    const { isViewer: _isViewer, ...publicGiver } = giver;
    return publicGiver;
  };

  return {
    period: leaderboard.period,
    periodStart: leaderboard.periodStart,
    performance: {
      isRanked: Boolean(member),
      rank,
      totalGivers: leaderboard.summary.totalGivers,
      points: member?.points || 0,
      impactCount: member?.impactCount || 0,
      helpCount: member?.helpCount || 0,
      giveawayCount: member?.giveawayCount || 0,
      latestImpactAt: member?.latestImpactAt || null,
      isAnonymous: member?.isAnonymous || false,
      nextRank: rank === 1 ? null : {
        rank: rank ? rank - 1 : leaderboard.summary.totalGivers + 1,
        pointsNeeded,
        actionsNeeded: Math.ceil(pointsNeeded / 100),
      },
    },
    nearbyGivers: nearby.map(cleanGiver),
  };
}

export function buildDemoGiverLeaderboard(period = 'month') {
  const selectedPeriod = period === 'all' ? 'all' : 'month';
  const multiplier = selectedPeriod === 'all' ? 3 : 1;
  const now = new Date();
  const demo = [
    ['demo-amara', 'Amara Okafor', 'Lagos, Nigeria', 8, 4, true],
    ['demo-chinedu', 'Chinedu Bello', 'Abuja, Nigeria', 7, 3, true],
    ['demo-private', 'Anonymous Giver', '', 7, 2, false],
    ['demo-amina', 'Amina Yusuf', 'Kano, Nigeria', 5, 2, true],
    ['demo-tunde', 'Tunde Adeyemi', 'Ibadan, Nigeria', 4, 1, false],
    ['demo-ngozi', 'Ngozi Eze', 'Enugu, Nigeria', 3, 1, true],
  ].map(([id, name, location, helps, giveaways, verified], index) => {
    const isAnonymous = id === 'demo-private';
    const helpCount = Number(helps) * multiplier;
    const giveawayCount = Number(giveaways) * multiplier;
    const impactCount = helpCount + giveawayCount;
    return {
      rank: index + 1,
      user: { id, name, profileImg: '' },
      location,
      isAnonymous,
      isVerified: verified,
      isDemo: true,
      level: isAnonymous ? 'private' : index < 2 ? 'silver' : 'bronze',
      points: impactCount * 100,
      impactCount,
      helpCount,
      giveawayCount,
      latestImpactAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  return {
    period: selectedPeriod,
    periodStart: selectedPeriod === 'month' ? startOfUtcMonth(now).toISOString() : null,
    isDemo: true,
    summary: {
      totalGivers: demo.length,
      totalImpactActions: demo.reduce((total, giver) => total + giver.impactCount, 0),
    },
    givers: demo,
  };
}
