-- Fuzzy search on facilities
create index facilities_title_trgm on facilities using gin (title gin_trgm_ops);
create index facilities_city_trgm on facilities using gin (city gin_trgm_ops);

-- Availability accelerators
create index on availability_rules (facility_id);
create index on blackouts (facility_id, starts_at);

-- Updated_at touchers
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger touch_profiles before update on profiles for each row execute procedure touch_updated_at();
create trigger touch_facilities before update on facilities for each row execute procedure touch_updated_at();
create trigger touch_bookings before update on bookings for each row execute procedure touch_updated_at();

-- Audit helper
create or replace function audit(_org uuid, _actor uuid, _action text, _entity text, _entity_id uuid, _details jsonb)
returns void language sql security definer as
$$
  insert into audit_events(org_id, actor_id, action, entity, entity_id, details) values
  (_org, _actor, _action, _entity, _entity_id, _details);
$$;