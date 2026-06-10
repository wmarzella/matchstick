-- Matchstick — Supabase schema & RLS.
-- Run in the Supabase SQL editor (or `supabase db push`). Safe to re-run.
--
-- Model:
--   profiles            one portable person (identity = phone), demographics
--   answers             portable answer store: (profile, question) -> 1..7
--   events              event configuration
--   event_participants  who joined which event, and whether they finished
--   matches             computed results for an event
--
-- Portability: a guest's answers live on `answers`, keyed by profile — so the
-- next event they're invited to pre-fills everything they've already answered
-- and only asks the new questions.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────── profiles
create table if not exists profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users (id) on delete set null,
  phone        text unique not null,
  first_name   text not null default '',
  last_name    text not null default '',
  age          int,
  gender       text check (gender in ('woman','man','nonbinary')),
  interested_in text[] default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────── answers (portable)
create table if not exists answers (
  profile_id   uuid not null references profiles (id) on delete cascade,
  question_id  text not null,
  value        int  not null check (value between 1 and 7),
  updated_at   timestamptz not null default now(),
  primary key (profile_id, question_id)
);

-- ─────────────────────────────────────────────────────────── events
create table if not exists events (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  host_name       text not null,
  host_profile_id uuid references profiles (id) on delete set null,
  date            date,
  mode            text not null default 'platonic'
                    check (mode in ('platonic','romantic','professional')),
  age_constrained boolean not null default false,
  max_guests      int not null default 50,
  accent          text not null default 'blue',
  themes          text[] not null default '{}',
  question_ids    text[] not null default '{}',
  revealed_at     timestamptz,
  results         jsonb, -- denormalized MatchResult for fast reads (matches table is the normalized form)
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────── event_participants
create table if not exists event_participants (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events (id) on delete cascade,
  profile_id   uuid not null references profiles (id) on delete cascade,
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  unique (event_id, profile_id)
);

-- ─────────────────────────────────────────────────────────── matches
create table if not exists matches (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events (id) on delete cascade,
  a_profile_id  uuid not null references profiles (id) on delete cascade,
  b_profile_id  uuid not null references profiles (id) on delete cascade,
  c_profile_id  uuid references profiles (id) on delete set null,
  score         int not null,
  quality       int not null,
  payload       jsonb not null default '{}', -- compat breakdown, radar, reasons
  created_at    timestamptz not null default now()
);

create index if not exists idx_participants_event on event_participants (event_id);
create index if not exists idx_answers_profile on answers (profile_id);
create index if not exists idx_matches_event on matches (event_id);

-- realtime
alter publication supabase_realtime add table event_participants;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table matches;

-- ─────────────────────────────────────────────────────────── RLS
alter table profiles            enable row level security;
alter table answers             enable row level security;
alter table events              enable row level security;
alter table event_participants  enable row level security;
alter table matches             enable row level security;

-- A guest manages their own profile + answers.
create policy "own profile"  on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "read profiles" on profiles for select using (true);

create policy "own answers" on answers for all
  using (exists (select 1 from profiles p where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from profiles p where p.id = profile_id and p.user_id = auth.uid()));

-- Events & participation are readable by anyone with the link; writes are
-- limited to authenticated users (tighten to host_profile_id in production).
create policy "read events"  on events for select using (true);
create policy "write events" on events for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "read participants"  on event_participants for select using (true);
create policy "join events"        on event_participants for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "read matches"  on matches for select using (true);
create policy "write matches" on matches for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
