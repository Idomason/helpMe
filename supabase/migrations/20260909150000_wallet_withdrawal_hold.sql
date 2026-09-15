-- Added after the initial wallet rollout: withdrawals must reserve withdrawable
-- funds specifically, rather than spending the ordinary top-up bucket first.
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

revoke all on function public.wallet_hold_withdrawal(uuid,bigint,text,text,text,uuid,jsonb) from public;
