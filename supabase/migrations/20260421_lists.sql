create extension if not exists pgcrypto;

create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lists_user_id on public.lists(user_id);
create index if not exists idx_lists_updated_at on public.lists(updated_at desc);

create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  title text not null,
  artist text not null,
  image text,
  added_at timestamptz not null default now()
);

create index if not exists idx_list_items_list_id on public.list_items(list_id);
create index if not exists idx_list_items_added_at on public.list_items(added_at desc);

create table if not exists public.saved_tracks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  spotify_track_id text not null,
  track_name text not null,
  artists jsonb not null default '[]'::jsonb,
  album_name text,
  image_url text,
  saved_at timestamptz not null default now(),
  unique (user_id, spotify_track_id)
);

create index if not exists idx_saved_tracks_user_id on public.saved_tracks(user_id);
create index if not exists idx_saved_tracks_saved_at on public.saved_tracks(saved_at desc);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  type text not null check (type in ('saved', 'listed', 'rated')),
  title text not null,
  subtitle text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_events_user_id on public.activity_events(user_id);
create index if not exists idx_activity_events_created_at on public.activity_events(created_at desc);
