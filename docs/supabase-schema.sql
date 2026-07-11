-- NOTE: These tables now live in the `portfolio` schema, not `public` (the project's
-- public schema is reserved for olim-app). For a fresh setup, run `create schema
-- portfolio;` and `set search_path = portfolio;` first, expose `portfolio` in the
-- Data API, and grant it to the API roles. See docs/DB_MIGRATION.md.

create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text not null,
  avatar_url text,
  location text,
  social_links jsonb not null default '{}'::jsonb,
  github_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  slug text primary key,
  repo text not null,
  name text not null,
  description text,
  stack text[] not null default '{}',
  languages text[] not null default '{}',
  stars integer not null default 0,
  forks integer not null default 0,
  watchers integer not null default 0,
  open_issues integer not null default 0,
  live_demo_url text,
  source_url text not null,
  ai_summary text,
  updated_at timestamptz
);

create table if not exists commits (
  sha text primary key,
  project_slug text not null references projects(slug) on delete cascade,
  message text not null,
  summary text,
  committed_at timestamptz not null,
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists releases (
  tag_name text not null,
  project_slug text not null references projects(slug) on delete cascade,
  name text not null,
  published_at timestamptz not null,
  url text not null,
  created_at timestamptz not null default now(),
  primary key (project_slug, tag_name)
);

create table if not exists activity_items (
  id text primary key,
  project_slug text references projects(slug) on delete cascade,
  title text not null,
  summary text not null,
  happened_at timestamptz not null,
  href text not null,
  type text not null check (type in ('commit', 'release', 'project', 'changelog')),
  tags text[] not null default '{}',
  -- BCP-47 locale of AI-generated text (e.g. 'en', 'ru'); null = locale-agnostic (releases/commits).
  locale text,
  created_at timestamptz not null default now()
);

create index if not exists activity_items_locale_idx on activity_items (locale);

create table if not exists ai_summaries (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('project', 'commit', 'release', 'weekly_changelog')),
  entity_id text not null,
  provider text not null,
  model text not null,
  prompt_hash text,
  summary text not null,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, provider, model)
);

-- Single-row marker (id = 'singleton') recording when the last snapshot was
-- written. The site reads this to decide whether the cached snapshot is still
-- fresh (see integrations.supabase.maxAgeMinutes in portfolio.config.ts).
create table if not exists sync_state (
  id text primary key default 'singleton',
  generated_at timestamptz not null default now(),
  source text not null
);

create table if not exists chat_logs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  mode text not null check (mode in ('ai', 'fallback')),
  created_at timestamptz not null default now()
);

create index if not exists commits_project_date_idx on commits (project_slug, committed_at desc);
create index if not exists activity_items_date_idx on activity_items (happened_at desc);
create index if not exists ai_summaries_entity_idx on ai_summaries (entity_type, entity_id);
