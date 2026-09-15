import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { transformHelperProfile, transformRequest } from '../utils/transformers.js';
import {
  buildDemoGiverLeaderboard,
  buildGiverLeaderboard,
  buildPersonalGiverPerformance,
} from '../utils/giverLeaderboard.js';

const fetchAllEscrowActivity = async () => {
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('escrow_transactions')
      .select('funder_id,purpose,status,is_anonymous,giveaway_id,released_at,held_at')
      .in('status', ['held', 'releasing', 'released'])
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
};

const fetchByIds = async (table, columns, key, ids) => {
  const rows = [];
  for (let index = 0; index < ids.length; index += 200) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .in(key, ids.slice(index, index + 200));
    if (error) throw error;
    rows.push(...(data || []));
  }
  return rows;
};

const includeDevelopmentDemo = (leaderboard) =>
  process.env.NODE_ENV === 'development' && leaderboard.givers.length === 0
    ? buildDemoGiverLeaderboard(leaderboard.period)
    : leaderboard;

const loadGiverLeaderboard = async (period, options = {}) => {
  const transactions = await fetchAllEscrowActivity();
  const userIds = [...new Set(transactions.map((row) => row.funder_id).filter(Boolean))];
  const giveawayIds = [...new Set(transactions.map((row) => row.giveaway_id).filter(Boolean))];

  if (userIds.length === 0) {
    return buildGiverLeaderboard({ period, viewerUserId: options.viewerUserId, limit: options.limit });
  }

  const [users, profiles, giveaways] = await Promise.all([
    fetchByIds('users', 'id,name,profile_img_url,active', 'id', userIds),
    fetchByIds('helper_profiles', 'user_id,location,verification_status,level,leaderboard_anonymous', 'user_id', userIds),
    giveawayIds.length
      ? fetchByIds('giveaways', 'id,created_by,giveaway_type,prize_amount,is_funded,is_deleted,is_cancelled', 'id', giveawayIds)
      : Promise.resolve([]),
  ]);

  return buildGiverLeaderboard({
    transactions,
    users,
    profiles,
    giveaways,
    period,
    viewerUserId: options.viewerUserId,
    limit: options.limit,
  });
};

const countReleasedAsFunder = async (userId) => {
  const { count } = await supabase
    .from('escrow_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('funder_id', userId)
    .eq('status', 'released');
  return count || 0;
};

// ─── Awards engine: evaluate + grant awards for a user ───
export const evaluateAwards = async (userId) => {
  const { data: awards } = await supabase.from('awards').select('*');
  if (!awards) return [];

  // Gather metrics
  const helpsRendered = await countReleasedAsFunder(userId);
  const { count: requestsCreated } = await supabase
    .from('help_requests')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  const { data: profile } = await supabase
    .from('helper_profiles')
    .select('verification_status')
    .eq('user_id', userId)
    .single();
  const isVerified = profile?.verification_status === 'verified';

  const metrics = {
    helps_rendered: helpsRendered,
    requests_created: requestsCreated || 0,
    verified: isVerified ? 1 : 0,
    escrow_released: helpsRendered,
    first_help: helpsRendered,
  };

  const earned = [];
  for (const award of awards) {
    const value = metrics[award.criteria_type] ?? 0;
    if (value >= award.threshold) {
      const { error } = await supabase
        .from('user_awards')
        .insert({ user_id: userId, award_id: award.id });
      if (!error) earned.push(award.slug);
    }
  }

  // Sync helper_profile helps_count + level
  const level =
    helpsRendered >= 100 ? 'platinum'
    : helpsRendered >= 25 ? 'gold'
    : helpsRendered >= 5 ? 'silver'
    : helpsRendered >= 1 ? 'bronze'
    : 'novice';
  await supabase
    .from('helper_profiles')
    .upsert({ user_id: userId, helps_count: helpsRendered, level }, { onConflict: 'user_id' });

  return earned;
};

// Trigger my award re-evaluation
export const refreshMyAwards = catchAsync(async (req, res) => {
  const earned = await evaluateAwards(req.user._id);
  return res.status(200).json({ status: 'success', data: { newlyEarned: earned } });
});

// Public Givers-board — transaction amounts and anonymous activity never leave the server.
export const getGiverLeaderboard = catchAsync(async (req, res, next) => {
  const period = req.query.period === 'all' ? 'all' : 'month';

  try {
    return res.status(200).json({
      status: 'success',
      data: includeDevelopmentDemo(await loadGiverLeaderboard(period)),
    });
  } catch {
    return next(new AppError('Failed to load the Givers-board', 500));
  }
});

// Private member performance — always uses real activity, never public preview data.
export const getMyGiverPerformance = catchAsync(async (req, res, next) => {
  const period = req.query.period === 'all' ? 'all' : 'month';
  try {
    const leaderboard = await loadGiverLeaderboard(period, {
      viewerUserId: req.user._id,
      limit: Infinity,
    });
    return res.status(200).json({
      status: 'success',
      data: buildPersonalGiverPerformance(leaderboard, req.user._id),
    });
  } catch {
    return next(new AppError('Failed to load your Givers-board performance', 500));
  }
});

// ─── Public portfolio ───
export const getPortfolio = catchAsync(async (req, res, next) => {
  const { name } = req.params;

  const { data: userRow } = await supabase
    .from('users')
    .select('id,name,email,role,profile_img_url,profile_img_path,created_at')
    .eq('name', name)
    .eq('active', true)
    .single();
  if (!userRow) return next(new AppError('User not found', 404));

  const { data: profile } = await supabase
    .from('helper_profiles')
    .select('*')
    .eq('user_id', userRow.id)
    .single();

  // Awards
  const { data: userAwards } = await supabase
    .from('user_awards')
    .select('earned_at, awards!user_awards_award_id_fkey(slug,name,description,icon,tier)')
    .eq('user_id', userRow.id)
    .order('earned_at', { ascending: false });

  // Their help requests (public)
  const { data: requests } = await supabase
    .from('help_requests')
    .select('*')
    .eq('user_id', userRow.id)
    .order('created_at', { ascending: false })
    .limit(12);

  const helpsRendered = await countReleasedAsFunder(userRow.id);

  return res.status(200).json({
    status: 'success',
    data: {
      profile: transformHelperProfile(
        profile || { user_id: userRow.id, verification_status: 'unverified', helps_count: helpsRendered },
        userRow,
      ),
      helpsRendered,
      awards: (userAwards || []).map((a) => ({
        ...a.awards,
        earnedAt: a.earned_at,
      })),
      requests: (requests || []).map(transformRequest),
      joinedAt: userRow.created_at,
    },
  });
});
