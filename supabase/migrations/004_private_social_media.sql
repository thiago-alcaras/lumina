begin;
update storage.buckets set public=false where id='looks';
create policy lumina_social_read on storage.objects for select to authenticated
using(bucket_id='looks' and public.can_see_person(((storage.foldername(name))[1])::uuid));
commit;
