-- Only for projects that already executed the original schema.sql.
begin;
grant update(name,bio,avatar,handle) on public.profiles to authenticated;
create or replace function public.new_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into profiles(id,name,handle) values(new.id,coalesce(nullif(left(trim(coalesce(new.raw_user_meta_data->>'name',new.raw_user_meta_data->>'full_name')),80),''),'Meu estilo'),'estilo.'||replace(new.id::text,'-',''));
 return new;
end $$;
commit;
