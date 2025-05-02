-- Ratings/Feedback Table
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  from_user_id uuid references profiles(id) on delete cascade,
  to_user_id uuid references profiles(id) on delete cascade,
  role text check (role in ('student', 'employer')),
  rating integer check (rating >= 1 and rating <= 5),
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add file_url to tasks table (if not present)
alter table public.tasks add column if not exists file_url text;

-- Add is_admin to profiles (if not present)
alter table public.profiles add column if not exists is_admin boolean default false; 