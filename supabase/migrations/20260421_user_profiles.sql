create table if not exists public.user_profiles (
  user_id text primary key,
  username text unique,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  bio text,
  display_name text,
  profile_image text,
  banner_image text,
  updated_at timestamptz not null default now()
);

alter table public.user_profiles add column if not exists username text;
alter table public.user_profiles add column if not exists banner_image text;
alter table public.user_profiles drop column if exists timezone;

create index if not exists idx_user_profiles_email on public.user_profiles(email);
create unique index if not exists idx_user_profiles_username on public.user_profiles(username);
