-- A risk freeze blocks spending and withdrawals, but must not strand a verified
-- incoming Monnify top-up. Closed wallets still reject credits.
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

revoke all on function public.wallet_credit(uuid,bigint,bigint,text,text,text,text,uuid,text,jsonb) from public;
