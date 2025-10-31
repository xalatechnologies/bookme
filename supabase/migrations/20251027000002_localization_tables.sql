-- Migration: Add Localization Tables
-- Description: Database tables for storing translations and localized database values
-- This supports dynamic content management for multilingual applications

-- Translation namespace enum
do $$ begin
  create type translation_namespace as enum (
    'common',
    'facilities',
    'bookings',
    'calendar',
    'admin',
    'user',
    'auth',
    'navigation',
    'errors',
    'support',
    'roles'
  );
exception when duplicate_object then null; end $$;

-- Translation keys table - stores all translation keys with metadata
create table translation_keys (
  id uuid primary key default gen_random_uuid(),
  namespace translation_namespace not null,
  key_path text not null, -- e.g., 'filters.clear', 'actions.save'
  description text, -- Human-readable description of what this translation is for
  category text, -- Optional category grouping (e.g., 'form', 'button', 'message')
  context jsonb default '{}', -- Additional context about usage, variables, etc.
  is_system boolean not null default false, -- System keys cannot be deleted
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (namespace, key_path)
);

create index idx_translation_keys_namespace on translation_keys(namespace);
create index idx_translation_keys_category on translation_keys(category) where category is not null;

-- Translations table - stores actual translations for each language
create table translations (
  id uuid primary key default gen_random_uuid(),
  translation_key_id uuid not null references translation_keys(id) on delete cascade,
  language_code text not null default 'no', -- ISO 639-1 codes: 'en', 'no', etc.
  translation text not null,
  is_approved boolean not null default false, -- For review workflow
  translated_by uuid references auth.users(id),
  source text, -- Where translation came from (AI, human, import, etc.)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (translation_key_id, language_code)
);

create index idx_translations_language on translations(language_code);
create index idx_translations_approved on translations(is_approved) where is_approved = true;
create index idx_translations_key_lang on translations(translation_key_id, language_code);

-- Localized database values - for storing translated content from database
-- This is for values that come from the database but need translation (e.g., facility types, statuses)
create table localized_db_values (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null, -- e.g., 'facility_type', 'booking_status', 'location'
  entity_key text not null, -- e.g., 'idrettshall', 'pending', 'drammen_sentrum'
  language_code text not null default 'no',
  label text not null, -- The translated label
  description text, -- Optional longer description
  sort_order int, -- For ordered lists
  is_active boolean not null default true,
  metadata jsonb default '{}', -- Additional metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_key, language_code)
);

create index idx_localized_db_values_type on localized_db_values(entity_type);
create index idx_localized_db_values_key on localized_db_values(entity_key);
create index idx_localized_db_values_lang on localized_db_values(language_code);
create index idx_localized_db_values_active on localized_db_values(is_active) where is_active = true;

-- Translation history - track changes to translations
create table translation_history (
  id uuid primary key default gen_random_uuid(),
  translation_id uuid not null references translations(id) on delete cascade,
  old_value text,
  new_value text not null,
  changed_by uuid references auth.users(id),
  change_reason text,
  created_at timestamptz not null default now()
);

create index idx_translation_history_translation on translation_history(translation_id);
create index idx_translation_history_user on translation_history(changed_by);

-- RLS Policies for translations
alter table translation_keys enable row level security;
alter table translations enable row level security;
alter table localized_db_values enable row level security;
alter table translation_history enable row level security;

-- Anyone can read approved translations
create policy "Anyone can read approved translations" on translations
  for select using (is_approved = true);

-- Admins can manage all translations
create policy "Admins can manage translations" on translations
  for all using (
    exists (
      select 1 from memberships m
      join organizations o on o.id = m.org_id
      where m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
    )
  );

-- Anyone can read active localized values
create policy "Anyone can read active localized db values" on localized_db_values
  for select using (is_active = true);

-- Admins can manage localized values
create policy "Admins can manage localized db values" on localized_db_values
  for all using (
    exists (
      select 1 from memberships m
      join organizations o on o.id = m.org_id
      where m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
    )
  );

-- Functions to help with translation management

-- Function to get translation by namespace and key
create or replace function get_translation(
  p_namespace text,
  p_key_path text,
  p_language_code text default 'no'
)
returns text as $$
  select t.translation
  from translations t
  join translation_keys tk on tk.id = t.translation_key_id
  where tk.namespace = p_namespace::translation_namespace
    and tk.key_path = p_key_path
    and t.language_code = p_language_code
    and t.is_approved = true
  limit 1;
$$ language sql stable;

-- Function to get all translations for a namespace and language
create or replace function get_translations_by_namespace(
  p_namespace text,
  p_language_code text default 'no'
)
returns table(key_path text, translation text) as $$
  select tk.key_path, t.translation
  from translations t
  join translation_keys tk on tk.id = t.translation_key_id
  where tk.namespace = p_namespace::translation_namespace
    and t.language_code = p_language_code
    and t.is_approved = true
  order by tk.key_path;
$$ language sql stable;

-- Function to get localized database value
create or replace function get_localized_db_value(
  p_entity_type text,
  p_entity_key text,
  p_language_code text default 'no'
)
returns text as $$
  select label
  from localized_db_values
  where entity_type = p_entity_type
    and entity_key = p_entity_key
    and language_code = p_language_code
    and is_active = true
  limit 1;
$$ language sql stable;

-- Trigger to update updated_at timestamp
create or replace function update_translation_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_translation_keys_timestamp
  before update on translation_keys
  for each row
  execute function update_translation_timestamp();

create trigger update_translations_timestamp
  before update on translations
  for each row
  execute function update_translation_timestamp();

create trigger update_localized_db_values_timestamp
  before update on localized_db_values
  for each row
  execute function update_translation_timestamp();

-- Trigger to log translation changes
create or replace function log_translation_change()
returns trigger as $$
begin
  if old.translation is distinct from new.translation then
    insert into translation_history (
      translation_id,
      old_value,
      new_value,
      changed_by
    ) values (
      new.id,
      old.translation,
      new.translation,
      auth.uid()
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger log_translation_changes
  after update on translations
  for each row
  when (old.translation is distinct from new.translation)
  execute function log_translation_change();

-- Comments for documentation
comment on table translation_keys is 'Master list of all translation keys in the system';
comment on table translations is 'Stores actual translations for each language';
comment on table localized_db_values is 'Stores translated labels for database values (enums, statuses, types)';
comment on table translation_history is 'Audit trail for translation changes';
comment on function get_translation is 'Retrieves a single translation by namespace and key path';
comment on function get_translations_by_namespace is 'Retrieves all translations for a namespace and language';
comment on function get_localized_db_value is 'Retrieves a localized label for a database value';

