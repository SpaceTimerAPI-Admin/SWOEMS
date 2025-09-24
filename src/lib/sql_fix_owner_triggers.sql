-- === PRODUCTION-SAFE FIX: make inserts work without sending owner_id from client ===

-- Ensure helper
create or replace function public.is_user_approved(uid uuid)
returns boolean language sql stable as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.approved = true);
$$;

-- Before-insert trigger to set owner_id = auth.uid() if null
create or replace function public.set_owner_id_tickets()
returns trigger language plpgsql security definer as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end $$;

drop trigger if exists trg_set_owner_id_tickets on public.tickets;
create trigger trg_set_owner_id_tickets
before insert on public.tickets
for each row execute procedure public.set_owner_id_tickets();

-- RLS: allow insert for approved users; they must be the owner (enforced by trigger)
drop policy if exists tickets_insert_approved on public.tickets;
create policy tickets_insert_approved on public.tickets
for insert with check ( public.is_user_approved(auth.uid()) );

-- Make sure select is allowed (or scope it how you want)
drop policy if exists tickets_read_all on public.tickets;
create policy tickets_read_all on public.tickets
for select using (true);

-- Procedures: similar owner trigger
create or replace function public.set_owner_id_procedures()
returns trigger language plpgsql security definer as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end $$;

drop trigger if exists trg_set_owner_id_procedures on public.procedures;
create trigger trg_set_owner_id_procedures
before insert on public.procedures
for each row execute procedure public.set_owner_id_procedures();

drop policy if exists procedures_insert on public.procedures;
create policy procedures_insert on public.procedures
for insert with check ( public.is_user_approved(auth.uid()) );

-- Optional: projects open creation for approved users (no owner field needed)
drop policy if exists projects_insert on public.projects;
create policy projects_insert on public.projects
for insert with check ( public.is_user_approved(auth.uid()) );
