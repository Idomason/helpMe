alter table public.helper_profiles
  add column if not exists leaderboard_anonymous boolean not null default false;

comment on column public.helper_profiles.leaderboard_anonymous is
  'Masks this member identity on the public Givers-board while retaining qualifying impact totals.';
