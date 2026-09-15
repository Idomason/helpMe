-- Closed-loop NGN wallet and Monnify payment lifecycle.
-- All amounts in these tables are integer kobo.

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  available_kobo bigint not null default 0 check (available_kobo >= 0),
  withdrawable_kobo bigint not null default 0 check (withdrawable_kobo >= 0),
  committed_kobo bigint not null default 0 check (committed_kobo >= 0),
  status text not null default 'active' check (status in ('active','frozen','closed')),
  version bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (withdrawable_kobo <= available_kobo)
);

create table if not exists public.wallet_entries (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id),
  user_id uuid not null references public.users(id),
  entry_type text not null,
  available_delta_kobo bigint not null default 0,
  withdrawable_delta_kobo bigint not null default 0,
  committed_delta_kobo bigint not null default 0,
  available_after_kobo bigint not null,
  withdrawable_after_kobo bigint not null,
  committed_after_kobo bigint not null,
  reference text,
  entity_type text,
  entity_id uuid,
  provider text not null default 'wallet',
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists wallet_entries_user_created_idx on public.wallet_entries(user_id, created_at desc);

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  provider text not null default 'monnify',
  purpose text not null check (purpose in ('wallet_topup')),
  amount_kobo bigint not null check (amount_kobo > 0),
  fee_kobo bigint not null default 0 check (fee_kobo >= 0),
  total_kobo bigint not null check (total_kobo > 0),
  currency text not null default 'NGN',
  reference text not null unique,
  provider_reference text,
  checkout_url text,
  status text not null default 'pending' check (status in ('pending','paid','failed','expired','cancelled')),
  paid_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_key text not null,
  event_type text,
  reference text,
  signature_valid boolean not null default false,
  payload jsonb not null,
  status text not null default 'received' check (status in ('received','processed','ignored','failed')),
  error text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, event_key)
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  wallet_id uuid not null references public.wallets(id),
  bank_account_id uuid not null references public.bank_accounts(id),
  amount_kobo bigint not null check (amount_kobo >= 100000),
  fee_kobo bigint not null default 0 check (fee_kobo >= 0),
  provider text not null default 'monnify',
  reference text not null unique,
  provider_reference text,
  provider_status text,
  status text not null default 'queued' check (status in ('queued','pending_review','processing','successful','failed','reversed','rejected')),
  risk_reason text,
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  completed_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists withdrawals_user_created_idx on public.withdrawals(user_id, created_at desc);

create table if not exists public.request_claims (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.help_requests(id),
  claimant_id uuid not null references public.users(id),
  amount_kobo bigint not null check (amount_kobo > 0),
  status text not null default 'reviewing' check (status in ('reviewing','partially_released','released','disputed','cancelled')),
  review_ends_at timestamptz not null,
  released_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists request_claims_open_unique on public.request_claims(request_id)
  where status in ('reviewing','partially_released','disputed');

create table if not exists public.giveaway_allocations (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid not null references public.giveaways(id),
  submission_id uuid not null references public.giveaway_submissions(id),
  winner_id uuid not null references public.users(id),
  amount_kobo bigint not null check (amount_kobo > 0),
  status text not null default 'selected' check (status in ('selected','claimed','expired','reassigned','cancelled')),
  selected_at timestamptz not null default now(),
  claim_expires_at timestamptz not null,
  claimed_at timestamptz,
  replacement_for uuid references public.giveaway_allocations(id),
  created_at timestamptz not null default now(),
  unique(giveaway_id, submission_id)
);
create index if not exists giveaway_allocations_winner_idx on public.giveaway_allocations(winner_id, status);

create table if not exists public.member_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.escrow_transactions add column if not exists provider text not null default 'paystack';
alter table public.escrow_transactions add column if not exists amount_kobo bigint;
alter table public.escrow_transactions add column if not exists funded_nonwithdrawable_kobo bigint not null default 0;
alter table public.escrow_transactions add column if not exists funded_withdrawable_kobo bigint not null default 0;
alter table public.escrow_transactions add column if not exists request_claim_id uuid references public.request_claims(id);
update public.escrow_transactions set amount_kobo = round(amount * 100)::bigint where amount_kobo is null;

alter table public.bank_accounts add column if not exists provider text not null default 'paystack';
alter table public.bank_accounts add column if not exists account_name_verified boolean not null default false;
alter table public.bank_accounts add column if not exists verified_at timestamptz;
alter table public.bank_accounts add column if not exists changed_at timestamptz not null default now();

alter table public.giveaways add column if not exists prize_per_winner_kobo bigint;
alter table public.giveaways add column if not exists total_prize_kobo bigint;
alter table public.giveaways add column if not exists financial_only boolean not null default false;

create or replace function public.wallet_credit(
  p_user_id uuid, p_amount_kobo bigint, p_withdrawable_kobo bigint,
  p_entry_type text, p_idempotency_key text, p_reference text default null,
  p_entity_type text default null, p_entity_id uuid default null, p_provider text default 'wallet',
  p_metadata jsonb default '{}'::jsonb
) returns public.wallets language plpgsql security definer set search_path = public as $$
declare w public.wallets;
begin
  if p_amount_kobo <= 0 or p_withdrawable_kobo < 0 or p_withdrawable_kobo > p_amount_kobo then
    raise exception 'Invalid wallet credit';
  end if;
  if exists(select 1 from wallet_entries where idempotency_key = p_idempotency_key) then
    select * into w from wallets where user_id = p_user_id;
    return w;
  end if;
  insert into wallets(user_id) values(p_user_id) on conflict(user_id) do nothing;
  select * into w from wallets where user_id = p_user_id for update;
  if w.status = 'closed' then raise exception 'Wallet is closed'; end if;
  update wallets set available_kobo = available_kobo + p_amount_kobo,
    withdrawable_kobo = withdrawable_kobo + p_withdrawable_kobo,
    version = version + 1, updated_at = now() where id = w.id returning * into w;
  insert into wallet_entries(wallet_id,user_id,entry_type,available_delta_kobo,withdrawable_delta_kobo,
    available_after_kobo,withdrawable_after_kobo,committed_after_kobo,reference,entity_type,entity_id,provider,idempotency_key,metadata)
  values(w.id,p_user_id,p_entry_type,p_amount_kobo,p_withdrawable_kobo,w.available_kobo,w.withdrawable_kobo,
    w.committed_kobo,p_reference,p_entity_type,p_entity_id,p_provider,p_idempotency_key,p_metadata);
  return w;
end $$;

create or replace function public.wallet_commit(
  p_user_id uuid, p_amount_kobo bigint, p_entry_type text, p_idempotency_key text,
  p_reference text default null, p_entity_type text default null, p_entity_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare w public.wallets; nonwithdrawable bigint; from_withdrawable bigint;
begin
  if p_amount_kobo <= 0 then raise exception 'Invalid wallet debit'; end if;
  if exists(select 1 from wallet_entries where idempotency_key = p_idempotency_key) then
    select * into w from wallets where user_id = p_user_id;
    return jsonb_build_object('wallet',to_jsonb(w),'nonwithdrawableKobo',0,'withdrawableKobo',0,'duplicate',true);
  end if;
  insert into wallets(user_id) values(p_user_id) on conflict(user_id) do nothing;
  select * into w from wallets where user_id = p_user_id for update;
  if w.status <> 'active' then raise exception 'Wallet is not active'; end if;
  if w.available_kobo < p_amount_kobo then raise exception 'Insufficient wallet balance'; end if;
  nonwithdrawable := greatest(w.available_kobo - w.withdrawable_kobo, 0);
  from_withdrawable := greatest(p_amount_kobo - nonwithdrawable, 0);
  nonwithdrawable := p_amount_kobo - from_withdrawable;
  update wallets set available_kobo = available_kobo - p_amount_kobo,
    withdrawable_kobo = withdrawable_kobo - from_withdrawable,
    committed_kobo = committed_kobo + p_amount_kobo,
    version = version + 1, updated_at = now() where id = w.id returning * into w;
  insert into wallet_entries(wallet_id,user_id,entry_type,available_delta_kobo,withdrawable_delta_kobo,committed_delta_kobo,
    available_after_kobo,withdrawable_after_kobo,committed_after_kobo,reference,entity_type,entity_id,provider,idempotency_key,metadata)
  values(w.id,p_user_id,p_entry_type,-p_amount_kobo,-from_withdrawable,p_amount_kobo,w.available_kobo,w.withdrawable_kobo,
    w.committed_kobo,p_reference,p_entity_type,p_entity_id,'wallet',p_idempotency_key,
    p_metadata || jsonb_build_object('nonwithdrawableKobo',nonwithdrawable,'withdrawableKobo',from_withdrawable));
  return jsonb_build_object('wallet',to_jsonb(w),'nonwithdrawableKobo',nonwithdrawable,'withdrawableKobo',from_withdrawable,'duplicate',false);
end $$;

create or replace function public.wallet_settle_escrow(
  p_funder_id uuid, p_beneficiary_id uuid, p_amount_kobo bigint,
  p_entry_type text, p_idempotency_key text, p_reference text,
  p_entity_type text, p_entity_id uuid
) returns void language plpgsql security definer set search_path = public as $$
declare fw public.wallets; bw public.wallets;
begin
  if exists(select 1 from wallet_entries where idempotency_key = p_idempotency_key) then return; end if;
  insert into wallets(user_id) values(p_beneficiary_id) on conflict(user_id) do nothing;
  select * into fw from wallets where user_id=p_funder_id for update;
  select * into bw from wallets where user_id=p_beneficiary_id for update;
  if fw.committed_kobo < p_amount_kobo then raise exception 'Committed balance is insufficient'; end if;
  update wallets set committed_kobo=committed_kobo-p_amount_kobo,version=version+1,updated_at=now() where id=fw.id returning * into fw;
  update wallets set available_kobo=available_kobo+p_amount_kobo,withdrawable_kobo=withdrawable_kobo+p_amount_kobo,
    version=version+1,updated_at=now() where id=bw.id returning * into bw;
  insert into wallet_entries(wallet_id,user_id,entry_type,committed_delta_kobo,available_after_kobo,withdrawable_after_kobo,
    committed_after_kobo,reference,entity_type,entity_id,provider,idempotency_key)
  values(fw.id,p_funder_id,p_entry_type||'_settled',-p_amount_kobo,fw.available_kobo,fw.withdrawable_kobo,fw.committed_kobo,
    p_reference,p_entity_type,p_entity_id,'wallet',p_idempotency_key||':funder');
  insert into wallet_entries(wallet_id,user_id,entry_type,available_delta_kobo,withdrawable_delta_kobo,available_after_kobo,
    withdrawable_after_kobo,committed_after_kobo,reference,entity_type,entity_id,provider,idempotency_key)
  values(bw.id,p_beneficiary_id,p_entry_type,p_amount_kobo,p_amount_kobo,bw.available_kobo,bw.withdrawable_kobo,bw.committed_kobo,
    p_reference,p_entity_type,p_entity_id,'wallet',p_idempotency_key);
end $$;

create or replace function public.wallet_refund_commitment(
  p_user_id uuid, p_amount_kobo bigint, p_withdrawable_kobo bigint,
  p_entry_type text, p_idempotency_key text, p_reference text,
  p_entity_type text, p_entity_id uuid
) returns void language plpgsql security definer set search_path = public as $$
declare w public.wallets;
begin
  if exists(select 1 from wallet_entries where idempotency_key=p_idempotency_key) then return; end if;
  select * into w from wallets where user_id=p_user_id for update;
  if w.committed_kobo < p_amount_kobo then raise exception 'Committed balance is insufficient'; end if;
  update wallets set available_kobo=available_kobo+p_amount_kobo,withdrawable_kobo=withdrawable_kobo+p_withdrawable_kobo,
    committed_kobo=committed_kobo-p_amount_kobo,version=version+1,updated_at=now() where id=w.id returning * into w;
  insert into wallet_entries(wallet_id,user_id,entry_type,available_delta_kobo,withdrawable_delta_kobo,committed_delta_kobo,
    available_after_kobo,withdrawable_after_kobo,committed_after_kobo,reference,entity_type,entity_id,provider,idempotency_key)
  values(w.id,p_user_id,p_entry_type,p_amount_kobo,p_withdrawable_kobo,-p_amount_kobo,w.available_kobo,w.withdrawable_kobo,
    w.committed_kobo,p_reference,p_entity_type,p_entity_id,'wallet',p_idempotency_key);
end $$;

create or replace function public.wallet_finalize_commitment(
  p_user_id uuid, p_amount_kobo bigint, p_entry_type text,
  p_idempotency_key text, p_reference text, p_entity_type text, p_entity_id uuid
) returns void language plpgsql security definer set search_path = public as $$
declare w public.wallets;
begin
  if exists(select 1 from wallet_entries where idempotency_key=p_idempotency_key) then return; end if;
  select * into w from wallets where user_id=p_user_id for update;
  if w.committed_kobo < p_amount_kobo then raise exception 'Committed balance is insufficient'; end if;
  update wallets set committed_kobo=committed_kobo-p_amount_kobo,version=version+1,updated_at=now()
    where id=w.id returning * into w;
  insert into wallet_entries(wallet_id,user_id,entry_type,committed_delta_kobo,available_after_kobo,
    withdrawable_after_kobo,committed_after_kobo,reference,entity_type,entity_id,provider,idempotency_key)
  values(w.id,p_user_id,p_entry_type,-p_amount_kobo,w.available_kobo,w.withdrawable_kobo,w.committed_kobo,
    p_reference,p_entity_type,p_entity_id,'wallet',p_idempotency_key);
end $$;

create or replace function public.wallet_hold_withdrawal(
  p_user_id uuid, p_amount_kobo bigint, p_entry_type text, p_idempotency_key text,
  p_reference text, p_entity_id uuid, p_metadata jsonb default '{}'::jsonb
) returns public.wallets language plpgsql security definer set search_path = public as $$
declare w public.wallets;
begin
  if p_amount_kobo <= 0 then raise exception 'Invalid withdrawal amount'; end if;
  if exists(select 1 from wallet_entries where idempotency_key=p_idempotency_key) then
    select * into w from wallets where user_id=p_user_id; return w;
  end if;
  select * into w from wallets where user_id=p_user_id for update;
  if w.status <> 'active' then raise exception 'Wallet is not active'; end if;
  if w.withdrawable_kobo < p_amount_kobo then raise exception 'Insufficient withdrawable balance'; end if;
  update wallets set available_kobo=available_kobo-p_amount_kobo,
    withdrawable_kobo=withdrawable_kobo-p_amount_kobo,committed_kobo=committed_kobo+p_amount_kobo,
    version=version+1,updated_at=now() where id=w.id returning * into w;
  insert into wallet_entries(wallet_id,user_id,entry_type,available_delta_kobo,withdrawable_delta_kobo,
    committed_delta_kobo,available_after_kobo,withdrawable_after_kobo,committed_after_kobo,
    reference,entity_type,entity_id,provider,idempotency_key,metadata)
  values(w.id,p_user_id,p_entry_type,-p_amount_kobo,-p_amount_kobo,p_amount_kobo,w.available_kobo,
    w.withdrawable_kobo,w.committed_kobo,p_reference,'withdrawal',p_entity_id,'wallet',p_idempotency_key,p_metadata);
  return w;
end $$;

revoke all on function public.wallet_credit(uuid,bigint,bigint,text,text,text,text,uuid,text,jsonb) from public;
revoke all on function public.wallet_commit(uuid,bigint,text,text,text,text,uuid,jsonb) from public;
revoke all on function public.wallet_settle_escrow(uuid,uuid,bigint,text,text,text,text,uuid) from public;
revoke all on function public.wallet_refund_commitment(uuid,bigint,bigint,text,text,text,text,uuid) from public;
revoke all on function public.wallet_finalize_commitment(uuid,bigint,text,text,text,text,uuid) from public;
revoke all on function public.wallet_hold_withdrawal(uuid,bigint,text,text,text,uuid,jsonb) from public;
