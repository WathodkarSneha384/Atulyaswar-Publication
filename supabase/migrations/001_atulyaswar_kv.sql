-- Key/value document store (replaces Vercel KV JSON blobs).
-- Run this in the Supabase SQL Editor (or via Supabase CLI).

create table if not exists public.atulyaswar_kv (
  key text primary key,
  value jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.atulyaswar_kv is 'App JSON documents: issues, manuscripts, issue-entry-submissions';

alter table public.atulyaswar_kv enable row level security;

-- No policies: anon/authenticated cannot read/write. Use the service role key from server-side only.

create index if not exists atulyaswar_kv_updated_at_idx on public.atulyaswar_kv (updated_at desc);
