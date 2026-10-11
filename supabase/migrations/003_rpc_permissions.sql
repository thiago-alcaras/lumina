-- Triggers cannot be called through the public Data API.
revoke execute on function public.new_profile(), public.interaction_changed() from public, anon, authenticated;
-- These helpers are used by RLS for signed-in users only.
revoke execute on function public.can_see_person(uuid), public.can_see_post(uuid) from public, anon;
grant execute on function public.can_see_person(uuid), public.can_see_post(uuid) to authenticated;
