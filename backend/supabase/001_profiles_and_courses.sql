-- Profiles: 1:1 extension of auth.users with app-facing fields.
-- auth.users stays login-only (email, password); this table is what the
-- app reads/writes for self-view, public view, and admin management.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  handle text unique,
  year text,
  major text,
  role text not null default 'User' check (role in ('User', 'Staff', 'Admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'Admin'
    )
  );

-- Auto-create a blank profile row whenever someone signs up via Supabase Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Courses: content managed by the Learning admin panel.
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  instructor text,
  thumbnail_url text,
  duration text,
  level text check (level in ('Beginner', 'Intermediate', 'Advanced')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Courses are viewable by everyone"
  on public.courses for select
  using (true);

create policy "Admins and staff can insert courses"
  on public.courses for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('Admin', 'Staff')
    )
  );

create policy "Admins and staff can update courses"
  on public.courses for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('Admin', 'Staff')
    )
  );

create policy "Admins and staff can delete courses"
  on public.courses for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('Admin', 'Staff')
    )
  );
