-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Organizations Table
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

alter table public.organizations enable row level security;
-- RLS: Only accessible via functions or admins (setup later)
create policy "No public read access" on public.organizations for select using (false);

-- 2. Profiles Table
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  organization_id uuid references public.organizations,
  role text check (role in ('admin', 'member')) default 'member',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view profiles in their organization"
  on public.profiles for select
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using ( id = auth.uid() );

-- 3. Prayers Table
create table public.prayers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles not null,
  organization_id uuid references public.organizations not null,
  content text not null,
  is_anonymous boolean default false,
  prayer_count integer default 0,
  created_at timestamptz default now()
);

alter table public.prayers enable row level security;

create policy "View prayers in same organization"
  on public.prayers for select
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

create policy "Insert prayers in same organization"
  on public.prayers for insert
  with check (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
    and user_id = auth.uid()
  );

-- Indexes
create index idx_profiles_org on public.profiles(organization_id);
create index idx_prayers_org on public.prayers(organization_id);

-- 4. Security Functions
-- Function to join an organization
create or replace function join_organization_by_code(code text)
returns void
language plpgsql
security definer
as $$
declare
  org_id uuid;
begin
  -- Find organization
  select id into org_id from public.organizations where invite_code = code;

  if org_id is null then
    raise exception 'Invalid invite code';
  end if;

  -- Update profile
  update public.profiles
  set organization_id = org_id
  where id = auth.uid();

  if not found then
    -- Create profile if not exists (should handle via trigger usually, but here for safety)
    insert into public.profiles (id, organization_id)
    values (auth.uid(), org_id);
  end if;
end;
$$;

grant execute on function join_organization_by_code to authenticated;

-- Function to handle new user signup (Trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
