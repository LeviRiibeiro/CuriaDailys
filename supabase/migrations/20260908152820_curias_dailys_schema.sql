create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text,
  activity_type text not null default 'routine' check (activity_type in ('routine', 'one_time')),
  frequency text not null default 'daily' check (frequency in ('daily', 'weekdays', 'weekly', 'monthly', 'once')),
  scheduled_time time not null,
  scheduled_date date,
  category text not null default 'Bem-estar' check (char_length(category) between 1 and 60),
  reminder_minutes integer not null default 10 check (reminder_minutes between 0 and 1440),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((activity_type = 'routine' and scheduled_date is null) or (activity_type = 'one_time' and scheduled_date is not null))
);

create table public.activity_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  occurrence_date date not null default current_date,
  completed_at timestamptz not null default now(),
  unique (activity_id, occurrence_date)
);

create index activities_user_schedule_idx on public.activities (user_id, scheduled_time) where is_archived = false;
create index activity_completions_user_date_idx on public.activity_completions (user_id, occurrence_date);

alter table public.activities enable row level security;
alter table public.activity_completions enable row level security;

revoke all on table public.activities from anon;
revoke all on table public.activity_completions from anon;
grant select, insert, update, delete on table public.activities to authenticated;
grant select, insert, delete on table public.activity_completions to authenticated;

create policy "Users manage their own activities"
on public.activities for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users read their own completions"
on public.activity_completions for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users add completions to their activities"
on public.activity_completions for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.activities
    where activities.id = activity_id
      and activities.user_id = (select auth.uid())
  )
);

create policy "Users remove their own completions"
on public.activity_completions for delete to authenticated
using ((select auth.uid()) = user_id);
