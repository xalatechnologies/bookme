-- Price calculator (hourly + weekend/peak multipliers)
create or replace function compute_price_cents(p_facility uuid, p_starts timestamptz, p_ends timestamptz)
returns bigint
language plpgsql stable as
$$
declare
  r pricing_rules%rowtype;
  dur_hours numeric;
  is_weekend boolean;
  mult numeric := 1.0;
  cents bigint;
  tz text;
  starts_local time;
  ends_local time;
begin
  select * into r from pricing_rules where facility_id = p_facility order by created_at desc limit 1;
  if r.id is null then
    raise exception 'No pricing rule for facility %', p_facility using errcode = 'P0001';
  end if;

  select timezone from organizations o
  join facilities f on f.org_id = o.id
  where f.id = p_facility into tz;

  dur_hours := extract(epoch from (p_ends - p_starts)) / 3600.0;
  if dur_hours < r.min_hours then
    dur_hours := r.min_hours;
  end if;

  is_weekend := extract(isodow from p_starts at time zone tz) in (6,7);
  if is_weekend then mult := mult * r.weekend_multiplier; end if;

  if r.peak_starts is not null and r.peak_ends is not null then
    starts_local := (p_starts at time zone tz)::time;
    ends_local   := (p_ends   at time zone tz)::time;
    if starts_local >= r.peak_starts and ends_local <= r.peak_ends then
      mult := mult * r.peak_multiplier;
    end if;
  end if;

  cents := ceil(dur_hours * r.price_per_hour_cents * mult);
  return cents;
end
$$;

-- Overlap check for paid or awaiting_payment bookings
create or replace function has_overlap(p_facility uuid, p_starts timestamptz, p_ends timestamptz)
returns boolean language sql stable as
$$
  select exists (
    select 1 from bookings b
    where b.facility_id = p_facility
      and b.status in ('awaiting_payment','paid','completed','refunded')
      and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_starts, p_ends, '[)')
  )
$$;

-- Create booking (SECURITY DEFINER) with advisory lock per facility bucket
create or replace function create_booking(p_facility uuid, p_starts timestamptz, p_ends timestamptz, p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as
$$
declare
  v_org uuid;
  v_user uuid := auth.uid();
  v_total bigint;
  v_id uuid;
  bucket bigint;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select org_id into v_org from facilities where id = p_facility;
  if v_org is null then
    raise exception 'Facility not found';
  end if;

  -- basic policy: published or staff of org
  if not (is_org_member(v_org,'staff') or is_platform_admin() or exists(select 1 from facilities f where f.id = p_facility and f.status='published')) then
    raise exception 'Not allowed to book this facility';
  end if;

  -- advisory lock by facility + start hour bucket to reduce collisions
  bucket := abs(mod((('x' || substr(replace(p_facility::text,'-',''),1,16))::bit(64))::bigint, 9223372036854775807));
  perform pg_advisory_xact_lock(bucket);

  if has_overlap(p_facility, p_starts, p_ends) then
    raise exception 'Requested time overlaps with existing booking';
  end if;

  -- blackout check
  if exists (
    select 1 from blackouts bl
    where bl.facility_id = p_facility
      and tstzrange(bl.starts_at, bl.ends_at, '[)') && tstzrange(p_starts, p_ends, '[)')
  ) then
    raise exception 'Requested window in blackout';
  end if;

  v_total := compute_price_cents(p_facility, p_starts, p_ends);

  insert into bookings (org_id, facility_id, user_id, status, starts_at, ends_at, total_cents, currency, price_breakdown, notes)
  values (v_org, p_facility, v_user, 'awaiting_payment', p_starts, p_ends, v_total, 'NOK',
          jsonb_build_object('hours', extract(epoch from (p_ends - p_starts))/3600.0, 'computed_at', now(), 'rule', (select id from pricing_rules where facility_id = p_facility order by created_at desc limit 1)),
          p_notes)
  returning id into v_id;

  perform audit(v_org, v_user, 'booking.create', 'booking', v_id, jsonb_build_object('status','awaiting_payment'));
  return v_id;
end
$$;

-- Cancel booking
create or replace function cancel_booking(p_booking uuid, p_reason text default null)
returns void language plpgsql security definer set search_path=public as
$$
declare
  b bookings%rowtype;
begin
  select * into b from bookings where id = p_booking;
  if not found then raise exception 'Booking not found'; end if;

  if not (b.user_id = auth.uid() or is_org_staff(b.org_id) or is_platform_admin()) then
    raise exception 'Not allowed';
  end if;

  if b.status in ('paid','completed','refunded') then
    -- external refund to be handled by PSP; we leave record as cancelled or refunded
    update bookings set status = 'cancelled' where id = p_booking;
  else
    update bookings set status = 'cancelled' where id = p_booking;
  end if;

  perform audit(b.org_id, auth.uid(), 'booking.cancel', 'booking', b.id, jsonb_build_object('reason', p_reason));
end
$$;

-- Delete booking (SECURITY DEFINER)
create or replace function delete_booking(p_booking uuid)
returns void language plpgsql security definer set search_path=public as
$$
declare
  b bookings%rowtype;
begin
  select * into b from bookings where id = p_booking;
  if not found then raise exception 'Booking not found'; end if;

  if not (b.user_id = auth.uid() or is_org_staff(b.org_id) or is_platform_admin()) then
    raise exception 'Not allowed';
  end if;

  -- Check if booking can be deleted (only pending or cancelled)
  if b.status not in ('pending', 'cancelled') then
    raise exception 'Booking cannot be deleted';
  end if;

  delete from bookings where id = p_booking;
  
  perform audit(b.org_id, auth.uid(), 'booking.delete', 'booking', b.id, jsonb_build_object());
end
$$;

-- Delete cancelled booking (SECURITY DEFINER) - specific function to avoid trigger issues
create or replace function delete_cancelled_booking(p_booking uuid)
returns void language plpgsql security definer set search_path=public as
$$
declare
  b bookings%rowtype;
begin
  select * into b from bookings where id = p_booking;
  if not found then raise exception 'Booking not found'; end if;

  if not (b.user_id = auth.uid() or is_org_staff(b.org_id) or is_platform_admin()) then
    raise exception 'Not allowed';
  end if;

  -- Check if booking is cancelled
  if b.status != 'cancelled' then
    raise exception 'Booking is not cancelled';
  end if;

  -- Delete the booking directly to avoid trigger issues
  delete from bookings where id = p_booking;
  
  -- Log the deletion manually
  insert into audit_events(org_id, actor_id, action, entity, entity_id, details) 
  values (b.org_id, auth.uid(), 'booking.delete', 'booking', b.id, jsonb_build_object('status', 'cancelled'));
end
$$;

-- Confirm payment (webhook -> RPC)
create or replace function confirm_payment(p_booking uuid, p_provider text, p_intent text, p_amount bigint, p_raw jsonb)
returns void language plpgsql security definer set search_path=public as
$$
declare
  b bookings%rowtype;
begin
  select * into b from bookings where id = p_booking for update;
  if not found then raise exception 'Booking not found'; end if;

  -- Idempotency: if already paid, return
  if b.status = 'paid' then
    insert into payments(booking_id, provider, intent_id, amount_cents, currency, status, raw)
    values (b.id, p_provider, p_intent, p_amount, b.currency, 'succeeded', p_raw)
    on conflict (provider, intent_id) do nothing;
    return;
  end if;

  if b.status not in ('awaiting_payment','pending') then
    raise exception 'Booking not in payable state: %', b.status;
  end if;

  if p_amount <> b.total_cents then
    -- record as failed and bail
    insert into payments(booking_id, provider, intent_id, amount_cents, currency, status, raw)
    values (b.id, p_provider, p_intent, p_amount, b.currency, 'failed', jsonb_build_object('reason','amount_mismatch') || p_raw);
    raise exception 'Amount mismatch';
  end if;

  insert into payments(booking_id, provider, intent_id, amount_cents, currency, status, raw)
  values (b.id, p_provider, p_intent, p_amount, b.currency, 'succeeded', p_raw)
  on conflict (provider, intent_id) do nothing;

  update bookings set status = 'paid', updated_at = now() where id = b.id;
  perform audit(b.org_id, null, 'booking.paid', 'booking', b.id, jsonb_build_object('provider', p_provider, 'intent_id', p_intent));
end
$$;

-- Search availability (MVP on-demand) for a single facility and date; slot_minutes granularity
create or replace function search_availability(p_facility uuid, p_date date, p_slot_minutes int default 60)
returns table(slot_start timestamptz, slot_end timestamptz)
language plpgsql stable as
$$
declare
  tz text;
  dow int := extract(isodow from p_date)::int % 7; -- 0..6 with Sunday=0
  org_id uuid;
  local_start time;
  local_end   time;
  dstart timestamptz;
  dend   timestamptz;
  cur timestamptz;
begin
  select o.timezone, f.org_id into tz, org_id
  from facilities f join organizations o on o.id = f.org_id
  where f.id = p_facility;

  -- collect windows: recurring rules for that DOW + ad-hoc within that date
  for local_start, local_end in
    select r.starts_time, r.ends_time
    from availability_rules r
    where r.facility_id = p_facility and r.recurring = true and r.day_of_week = dow
  loop
    dstart := (p_date::timestamptz at time zone tz) + local_start;
    dend   := (p_date::timestamptz at time zone tz) + local_end;
    cur := dstart;
    while cur + make_interval(mins => p_slot_minutes) <= dend loop
      if not has_overlap(p_facility, cur, cur + make_interval(mins => p_slot_minutes))
         and not exists (select 1 from blackouts bl where bl.facility_id=p_facility
                         and tstzrange(bl.starts_at, bl.ends_at,'[)') && tstzrange(cur, cur + make_interval(mins=>p_slot_minutes),'[)'))
      then
        slot_start := cur; slot_end := cur + make_interval(mins => p_slot_minutes);
        return next;
      end if;
      cur := cur + make_interval(mins => p_slot_minutes);
    end loop;
  end loop;

  -- ad-hoc windows on this date
  for dstart, dend in
    select r.starts_at, r.ends_at
    from availability_rules r
    where r.facility_id = p_facility and r.recurring = false
      and r.starts_at::date <= p_date and r.ends_at::date >= p_date
  loop
    cur := greatest(dstart, p_date::timestamptz);
    while cur + make_interval(mins => p_slot_minutes) <= least(dend, (p_date + 1)::timestamptz) loop
      if not has_overlap(p_facility, cur, cur + make_interval(mins => p_slot_minutes))
         and not exists (select 1 from blackouts bl where bl.facility_id=p_facility
                         and tstzrange(bl.starts_at, bl.ends_at,'[)') && tstzrange(cur, cur + make_interval(mins=>p_slot_minutes),'[)'))
      then
        slot_start := cur; slot_end := cur + make_interval(mins => p_slot_minutes);
        return next;
      end if;
      cur := cur + make_interval(mins => p_slot_minutes);
    end loop;
  end loop;
end
$$;

-- Expire stale holds (to be called by scheduler)
create or replace function expire_stale_holds(p_ttl_minutes int default 30)
returns int language plpgsql security definer as
$$
declare cnt int;
begin
  update bookings
  set status = 'expired'
  where status = 'awaiting_payment'
    and created_at < now() - make_interval(mins => p_ttl_minutes);
  get diagnostics cnt = row_count;
  return cnt;
end
$$;

-- Public search view for facilities (status=published)
create or replace view facilities_public as
select f.*, o.slug as org_slug
from facilities f join organizations o on o.id = f.org_id
where f.status = 'published';