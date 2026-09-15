import { supabase } from '../config/supabase.js';
import { catchAsync } from '../utils/catchAsync.js';

const countOf = async (table, filters = {}) => {
  let q = supabase.from(table).select('id', { count: 'exact', head: true });
  Object.entries(filters).forEach(([k, v]) => {
    q = q.eq(k, v);
  });
  const { count } = await q;
  return count || 0;
};

// Platform-wide + per-user stats for dashboards
export const getStats = catchAsync(async (req, res) => {
  const financialGiveawayCount = async (activeOnly = false) => {
    let query = supabase.from('giveaways').select('id', { count: 'exact', head: true })
      .eq('is_deleted', false).gt('prize_amount', 0);
    if (activeOnly) query = query.eq('is_active', true);
    const { count } = await query;
    return count || 0;
  };
  const [
    totalRequests,
    activeRequests,
    totalGiveaways,
    activeGiveaways,
  ] = await Promise.all([
    countOf('help_requests'),
    countOf('help_requests', { status: 'active' }),
    financialGiveawayCount(false),
    financialGiveawayCount(true),
  ]);

  let myRequests = 0;
  let myActiveRequests = 0;
  if (req.user?.id) {
    myRequests = await countOf('help_requests', { user_id: req.user.id });
    // active among mine
    const { count } = await supabase
      .from('help_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('status', 'active');
    myActiveRequests = count || 0;
  }

  return res.status(200).json({
    status: 'success',
    data: {
      totalRequests,
      activeRequests,
      totalGiveaways,
      activeGiveaways,
      myRequests,
      myActiveRequests,
    },
  });
});
