-- Execute once in a NEW Supabase project's SQL editor.
begin;
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 name text not null check(length(name) between 1 and 80),
 handle text unique not null, avatar text, bio text not null default '' check(length(bio)<=250),
 created_at timestamptz not null default now()
);
create function public.new_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into profiles(id,name,handle) values(new.id,coalesce(nullif(left(trim(coalesce(new.raw_user_meta_data->>'name',new.raw_user_meta_data->>'full_name')),80),''),'Meu estilo'),'estilo.'||replace(new.id::text,'-',''));
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.new_profile();
create table public.posts (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references profiles on delete cascade,
 title text not null check(length(title) between 1 and 100),
 description text not null default '' check(length(description)<=1500), image text not null,
 mood text not null check(mood in ('Cozy','Romântico','Minimalista','Criativo','Ousado')),
 pieces jsonb not null default '[]' check(jsonb_typeof(pieces)='array' and jsonb_array_length(pieces)<=20),
 like_count integer not null default 0 check(like_count>=0), created_at timestamptz not null default now()
);
create table public.wardrobe (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references profiles on delete cascade,
 name text not null check(length(name) between 1 and 100), category text not null, color text not null default '',
 brand text not null default '', link text not null default '' check(link='' or link ~ '^https?://'),
 image_path text not null, fingerprint text not null check(fingerprint ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(), unique(owner_id,fingerprint)
);
create table public.follows (
 follower_id uuid references profiles on delete cascade, following_id uuid references profiles on delete cascade,
 primary key(follower_id,following_id),check(follower_id<>following_id)
);
create table public.blocks (
 user_id uuid references profiles on delete cascade, blocked_id uuid references profiles on delete cascade,
 primary key(user_id,blocked_id),check(user_id<>blocked_id)
);
create table public.likes(user_id uuid references profiles on delete cascade,post_id uuid references posts on delete cascade,primary key(user_id,post_id));
create table public.saved(user_id uuid references profiles on delete cascade,post_id uuid references posts on delete cascade,primary key(user_id,post_id));
create table public.comments (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references profiles on delete cascade,
 post_id uuid not null references posts on delete cascade,text text not null check(length(text) between 1 and 500),created_at timestamptz not null default now()
);
create table public.stories (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references profiles on delete cascade,image text not null,
 title text not null check(length(title) between 1 and 100),created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '24 hours',check(expires_at<=created_at+interval '24 hours 1 minute')
);
create table public.calendar (
 owner_id uuid references profiles on delete cascade,date date not null,post_id uuid not null references posts on delete cascade,
 mood text not null,note text not null default '' check(length(note)<=500),primary key(owner_id,date)
);
create table public.interests (
 user_id uuid references profiles on delete cascade,mood text not null,score integer not null default 0,primary key(user_id,mood)
);
create table public.reports (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references profiles on delete cascade,
 post_id uuid not null references posts on delete cascade,reason text not null check(length(reason) between 1 and 500),
 created_at timestamptz not null default now(), status text not null default 'pending'
);
create table public.subscriptions (
 user_id uuid primary key references profiles on delete cascade,customer_id text unique not null,subscription_id text unique,
 status text not null default 'none', updated_at timestamptz not null default now()
);
create table public.billing_events(id text primary key,created_at timestamptz not null default now());
create table public.vision_usage(user_id uuid references profiles on delete cascade,month date not null,count integer not null default 0,primary key(user_id,month));
create index posts_feed on posts(created_at desc,id);
create index posts_owner on posts(owner_id,created_at desc);
create index wardrobe_owner on wardrobe(owner_id);
create index comments_post on comments(post_id,created_at);
create index stories_expiration on stories(expires_at);

create function public.can_see_person(target uuid) returns boolean language sql stable security definer set search_path=public as $$
 select auth.uid() is not null and not exists(select 1 from blocks where (user_id=auth.uid() and blocked_id=target) or (user_id=target and blocked_id=auth.uid()));
$$;
create function public.can_see_post(target uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from posts where id=target and can_see_person(owner_id));
$$;
alter table profiles enable row level security;
alter table posts enable row level security;
alter table wardrobe enable row level security;
alter table follows enable row level security;
alter table blocks enable row level security;
alter table likes enable row level security;
alter table saved enable row level security;
alter table comments enable row level security;
alter table stories enable row level security;
alter table calendar enable row level security;
alter table interests enable row level security;
alter table reports enable row level security;
alter table subscriptions enable row level security;
alter table billing_events enable row level security;
alter table vision_usage enable row level security;

create policy profiles_read on profiles for select to authenticated using(can_see_person(id));
create policy profiles_update on profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy posts_read on posts for select to authenticated using(can_see_person(owner_id));
create policy posts_insert on posts for insert to authenticated with check(owner_id=auth.uid() and like_count=0);
create policy posts_delete on posts for delete to authenticated using(owner_id=auth.uid());
create policy wardrobe_owner on wardrobe for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid() and split_part(image_path,'/',1)=auth.uid()::text);
create policy follows_read on follows for select to authenticated using(follower_id=auth.uid());
create policy follows_add on follows for insert to authenticated with check(follower_id=auth.uid() and can_see_person(following_id));
create policy follows_delete on follows for delete to authenticated using(follower_id=auth.uid());
create policy blocks_owner on blocks for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy likes_read on likes for select to authenticated using(user_id=auth.uid());
create policy likes_add on likes for insert to authenticated with check(user_id=auth.uid() and can_see_post(post_id));
create policy likes_delete on likes for delete to authenticated using(user_id=auth.uid());
create policy saved_read on saved for select to authenticated using(user_id=auth.uid());
create policy saved_add on saved for insert to authenticated with check(user_id=auth.uid() and can_see_post(post_id));
create policy saved_delete on saved for delete to authenticated using(user_id=auth.uid());
create policy comments_read on comments for select to authenticated using(can_see_post(post_id) and can_see_person(user_id));
create policy comments_add on comments for insert to authenticated with check(user_id=auth.uid() and can_see_post(post_id));
create policy comments_delete on comments for delete to authenticated using(user_id=auth.uid());
create policy stories_read on stories for select to authenticated using(expires_at>now() and can_see_person(owner_id));
create policy stories_add on stories for insert to authenticated with check(owner_id=auth.uid() and expires_at>now() and expires_at<=now()+interval '24 hours 1 minute');
create policy stories_delete on stories for delete to authenticated using(owner_id=auth.uid());
create policy calendar_owner on calendar for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid() and exists(select 1 from posts where id=post_id and posts.owner_id=auth.uid()));
create policy interests_read on interests for select to authenticated using(user_id=auth.uid());
create policy reports_add on reports for insert to authenticated with check(user_id=auth.uid() and can_see_post(post_id));
create policy reports_read on reports for select to authenticated using(user_id=auth.uid());
create policy subscriptions_read on subscriptions for select to authenticated using(user_id=auth.uid());
create policy vision_usage_read on vision_usage for select to authenticated using(user_id=auth.uid());
revoke update on profiles from authenticated;
grant update(name,bio,avatar,handle) on profiles to authenticated;
revoke insert,update,delete on subscriptions,interests,vision_usage,billing_events from authenticated,anon;
revoke update on posts,reports from authenticated;

create function public.interaction_changed() returns trigger language plpgsql security definer set search_path=public as $$
declare item record; style text; weight integer;
begin
 if TG_OP='INSERT' then item:=new;weight:=1;else item:=old;weight:=-1;end if;
 select mood into style from posts where id=item.post_id;
 if TG_TABLE_NAME='likes' then update posts set like_count=greatest(0,like_count+weight) where id=item.post_id;else weight:=weight*2;end if;
 if style is not null then insert into interests(user_id,mood,score) values(item.user_id,style,greatest(0,weight))
 on conflict(user_id,mood) do update set score=greatest(0,interests.score+weight);end if;
 return coalesce(new,old);
end $$;
create trigger likes_changed after insert or delete on likes for each row execute function interaction_changed();
create trigger saved_changed after insert or delete on saved for each row execute function interaction_changed();

create function public.feed_page(page_offset integer default 0,following_only boolean default false,mood_filter text default '',search_text text default '')
returns jsonb language sql stable security invoker set search_path=public as $$
 select coalesce(jsonb_agg(result.item order by result.position),'[]'::jsonb) from (
 select jsonb_build_object('id',p.id,'title',p.title,'description',p.description,'image',p.image,'mood',p.mood,'pieces',p.pieces,'like_count',p.like_count,'created_at',p.created_at,'author',to_jsonb(pr)) item,
 row_number() over(order by
 case when following_only then extract(epoch from p.created_at) else coalesce(i.score,0)*4+ln(p.like_count+1)+((hashtext(p.id::text||current_date::text)::bigint+2147483648)%1000)/333.0+greatest(0,7-extract(epoch from(now()-p.created_at))/86400)*0.1 end desc,p.created_at desc,p.id) position
 from posts p join profiles pr on pr.id=p.owner_id left join interests i on i.user_id=auth.uid() and i.mood=p.mood
 where (not following_only or exists(select 1 from follows f where f.follower_id=auth.uid() and f.following_id=p.owner_id))
 and (mood_filter='' or p.mood=mood_filter)
 and (search_text='' or p.title||' '||p.description||' '||pr.name||' '||p.mood ilike '%'||left(search_text,100)||'%')
 order by position limit 20 offset greatest(0,least(page_offset,100000))
 ) result;
$$;
revoke execute on function feed_page(integer,boolean,text,text) from public;
grant execute on function feed_page(integer,boolean,text,text) to authenticated;

-- Service-only, atomic monthly quota; concurrent requests cannot exceed the cap.
create function public.reserve_vision(target uuid) returns boolean language plpgsql security definer set search_path=public as $$
declare limit_count integer; used integer;
begin
 select case when exists(select 1 from subscriptions where user_id=target and status in ('active','trialing')) then 100 else 10 end into limit_count;
 insert into vision_usage(user_id,month,count) values(target,date_trunc('month',now())::date,0) on conflict do nothing;
 update vision_usage set count=count+1 where user_id=target and month=date_trunc('month',now())::date and count<limit_count returning count into used;
 return used is not null;
end $$;
create function public.apply_billing_event(event_id text,target uuid,customer text,subscription text,new_status text)
returns void language plpgsql security definer set search_path=public as $$
begin
 insert into billing_events(id) values(event_id) on conflict do nothing;
 if not found then return;end if;
 insert into subscriptions(user_id,customer_id,subscription_id,status) values(target,customer,subscription,new_status)
 on conflict(user_id) do update set customer_id=excluded.customer_id,subscription_id=excluded.subscription_id,status=excluded.status,updated_at=now();
end $$;
revoke execute on function reserve_vision(uuid),apply_billing_event(text,uuid,text,text,text) from public,anon,authenticated;
grant execute on function reserve_vision(uuid),apply_billing_event(text,uuid,text,text,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('looks','looks',true,12582912,array['image/jpeg','image/png','image/webp']),
 ('wardrobe','wardrobe',false,12582912,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy lumina_upload on storage.objects for insert to authenticated with check(bucket_id in ('looks','wardrobe') and (storage.foldername(name))[1]=auth.uid()::text);
create policy lumina_private_read on storage.objects for select to authenticated using(bucket_id='wardrobe' and (storage.foldername(name))[1]=auth.uid()::text);
create policy lumina_media_delete on storage.objects for delete to authenticated using(bucket_id in ('looks','wardrobe') and (storage.foldername(name))[1]=auth.uid()::text);
commit;
