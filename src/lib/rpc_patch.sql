-- RPC functions to safely create records with owner_id = auth.uid()

create or replace function public.create_ticket(
  p_title text,
  p_description text,
  p_priority text,
  p_location text,
  p_category text,
  p_date timestamptz,
  p_photo_url text
) returns uuid language plpgsql security definer as $$
declare new_id uuid;
begin
  insert into public.tickets (id,title,description,priority,location,category,date,photo_url,owner_id,status,created_at)
  values (gen_random_uuid(), p_title, p_description, p_priority, p_location, p_category, p_date, p_photo_url, auth.uid(), 'Open', now())
  returning id into new_id;
  return new_id;
end $$;

grant execute on function public.create_ticket(text,text,text,text,text,timestamptz,text) to authenticated;

create or replace function public.create_project(
  p_title text,
  p_description text
) returns uuid language plpgsql security definer as $$
declare new_id uuid;
begin
  insert into public.projects (id,title,description,status,owner_id,created_at)
  values (gen_random_uuid(), p_title, p_description, 'Open', auth.uid(), now())
  returning id into new_id;
  return new_id;
end $$;

grant execute on function public.create_project(text,text) to authenticated;

create or replace function public.create_procedure(
  p_title text,
  p_content text,
  p_public boolean
) returns uuid language plpgsql security definer as $$
declare new_id uuid;
begin
  insert into public.procedures (id,title,content,public,owner_id,created_at)
  values (gen_random_uuid(), p_title, p_content, p_public, auth.uid(), now())
  returning id into new_id;
  return new_id;
end $$;

grant execute on function public.create_procedure(text,text,boolean) to authenticated;
