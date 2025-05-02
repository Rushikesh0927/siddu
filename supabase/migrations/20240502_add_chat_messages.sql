create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  sender text not null,
  message text not null,
  timestamp timestamptz default timezone('utc'::text, now())
); 