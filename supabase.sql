-- JAN IBARRA PORTFOLIO — SUPABASE SETUP
-- Run this entire file in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.portfolio_admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client text,
  year text,
  category text not null default 'campaign' check (category in ('campaign','template','motion','branding','web')),
  size text not null default 'normal' check (size in ('normal','large','wide','tall')),
  description text,
  tags text[] not null default '{}',
  cover_url text,
  cover_file_id text,
  featured boolean not null default true,
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  media_type text not null default 'image' check (media_type in ('image','video')),
  source_url text not null,
  drive_file_id text,
  poster_url text,
  poster_file_id text,
  caption text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_projects_order_idx on public.portfolio_projects(display_order);
create index if not exists portfolio_media_project_idx on public.portfolio_media(project_id, display_order);

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portfolio_admin_users a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email',''))
  );
$$;

grant execute on function public.is_portfolio_admin() to anon, authenticated;

alter table public.portfolio_admin_users enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_media enable row level security;

-- Public visitors can only see published projects.
drop policy if exists "public read published projects" on public.portfolio_projects;
create policy "public read published projects" on public.portfolio_projects
for select using (published = true or public.is_portfolio_admin());

-- Public can read media only when its parent project is published.
drop policy if exists "public read published media" on public.portfolio_media;
create policy "public read published media" on public.portfolio_media
for select using (
  exists (
    select 1 from public.portfolio_projects p
    where p.id = project_id and (p.published = true or public.is_portfolio_admin())
  )
);

-- Only allowlisted admins can create, edit, or delete projects/media.
drop policy if exists "admins manage projects" on public.portfolio_projects;
create policy "admins manage projects" on public.portfolio_projects
for all to authenticated
using (public.is_portfolio_admin())
with check (public.is_portfolio_admin());

drop policy if exists "admins manage media" on public.portfolio_media;
create policy "admins manage media" on public.portfolio_media
for all to authenticated
using (public.is_portfolio_admin())
with check (public.is_portfolio_admin());

-- Update timestamp helper.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolio_projects_updated_at on public.portfolio_projects;
create trigger portfolio_projects_updated_at
before update on public.portfolio_projects
for each row execute function public.set_updated_at();

-- IMPORTANT: replace with your actual admin email before or after running.
-- insert into public.portfolio_admin_users(email) values ('YOUR_EMAIL@example.com') on conflict do nothing;
