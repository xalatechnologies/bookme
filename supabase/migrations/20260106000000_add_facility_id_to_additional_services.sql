-- Add facility_id to additional_services and index it
alter table public.additional_services
add column if not exists facility_id uuid references public.facilities(id) on delete cascade;

create index if not exists additional_services_facility_id_idx
  on public.additional_services (facility_id);

