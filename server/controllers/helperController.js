import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { transformHelperProfile } from '../utils/transformers.js';

// List available criteria/skill tags
export const getHelperTags = catchAsync(async (req, res) => {
  const { data } = await supabase.from('helper_tags').select('*').order('name');
  return res.status(200).json({ status: 'success', data: data || [] });
});

// Get the current user's helper profile (creates a blank one if missing)
export const getMyHelperProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  let { data: profile } = await supabase
    .from('helper_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    const { data: created, error } = await supabase
      .from('helper_profiles')
      .insert({ user_id: userId })
      .select('*')
      .single();
    if (error) return next(new AppError(error.message, 400));
    profile = created;
  }

  return res.status(200).json({
    status: 'success',
    data: transformHelperProfile(profile, req.userRow),
  });
});

// Create or update the current user's helper profile
export const upsertMyHelperProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { bio, skills, criteriaTags, location, leaderboardAnonymous } = req.body;

  const payload = {
    user_id: userId,
    bio,
    skills: Array.isArray(skills) ? skills : undefined,
    criteria_tags: Array.isArray(criteriaTags) ? criteriaTags : undefined,
    location,
    leaderboard_anonymous: typeof leaderboardAnonymous === 'boolean' ? leaderboardAnonymous : undefined,
  };
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const { data: profile, error } = await supabase
    .from('helper_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) return next(new AppError(error.message, 400));

  return res.status(200).json({
    status: 'success',
    message: 'Helper profile saved',
    data: transformHelperProfile(profile, req.userRow),
  });
});

// Public helper profile by user name
export const getPublicHelperProfile = catchAsync(async (req, res, next) => {
  const { name } = req.params;

  const { data: userRow } = await supabase
    .from('users')
    .select('id,name,email,role,profile_img_url,profile_img_path')
    .eq('name', name)
    .single();

  if (!userRow) return next(new AppError('User not found', 404));

  const { data: profile } = await supabase
    .from('helper_profiles')
    .select('*')
    .eq('user_id', userRow.id)
    .single();

  return res.status(200).json({
    status: 'success',
    data: transformHelperProfile(profile || { user_id: userRow.id, verification_status: 'unverified' }, userRow),
  });
});
