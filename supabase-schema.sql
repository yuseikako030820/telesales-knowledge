-- テレアポ ナレッジ管理アプリ Supabase スキーマ
-- Supabase の SQL Editor で実行してください

create extension if not exists pg_trgm;

-- =====================
-- ナレッジメモ
-- =====================
create table notes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  type             text not null check (type in ('telesales', 'meeting')),
  title            text not null,
  content          text not null default '',
  raw_transcript   text,
  tags             text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index notes_content_trgm on notes using gin (content gin_trgm_ops);
create index notes_title_trgm   on notes using gin (title  gin_trgm_ops);
create index notes_tags         on notes using gin (tags);
create index notes_user_created on notes (user_id, created_at desc);

-- =====================
-- PDCAテーマ
-- =====================
create table pdca_themes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  goal         text not null default '',
  kpi_target   text not null default '',
  do_content   text not null default '',
  check_act    text not null default '',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index pdca_themes_user on pdca_themes (user_id, is_active, created_at desc);

-- =====================
-- 日報
-- =====================
create table daily_reports (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  report_date        date not null,
  call_count         integer not null default 0,
  appointment_count  integer not null default 0,
  notes              text not null default '',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id, report_date)
);
create index daily_reports_user_date on daily_reports (user_id, report_date desc);

-- =====================
-- updated_at 自動更新
-- =====================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger notes_ua         before update on notes         for each row execute procedure update_updated_at();
create trigger pdca_themes_ua   before update on pdca_themes   for each row execute procedure update_updated_at();
create trigger daily_reports_ua before update on daily_reports for each row execute procedure update_updated_at();

-- =====================
-- Row Level Security (自分のデータしか見えない)
-- =====================
alter table notes         enable row level security;
alter table pdca_themes   enable row level security;
alter table daily_reports enable row level security;

create policy "own notes"         on notes         for all using (auth.uid() = user_id);
create policy "own pdca_themes"   on pdca_themes   for all using (auth.uid() = user_id);
create policy "own daily_reports" on daily_reports for all using (auth.uid() = user_id);
