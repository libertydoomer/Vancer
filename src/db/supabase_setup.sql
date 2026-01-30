-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create specific Trigger Function for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, image_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.favorite_jobs enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Policies for Favorite Jobs
create policy "Users can view their own favorites"
  on favorite_jobs for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own favorites"
  on favorite_jobs for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own favorites"
  on favorite_jobs for delete
  using ( auth.uid() = user_id );
