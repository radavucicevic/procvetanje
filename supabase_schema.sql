-- PROCVETANJE · Supabase schema
-- Pokreni ovo u Supabase > SQL Editor

create table if not exists ucesnice (
  id uuid primary key default gen_random_uuid(),
  ime text not null,
  created_at timestamptz default now()
);

create table if not exists misli_rade (
  id uuid primary key default gen_random_uuid(),
  dan integer not null unique check (dan between 1 and 40),
  tekst text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists unosi_grupe (
  id uuid primary key default gen_random_uuid(),
  ucesnica_id uuid references ucesnice(id) on delete cascade,
  ucesnica_ime text not null,
  dan integer not null check (dan between 1 and 40),
  misao text not null,
  izazov text,
  created_at timestamptz default now()
);

create table if not exists snimci_prakse (
  id uuid primary key default gen_random_uuid(),
  dan integer not null unique check (dan between 1 and 40),
  url text not null,
  created_at timestamptz default now()
);

create table if not exists tapkanja (
  id uuid primary key default gen_random_uuid(),
  naziv text not null,
  opis text,
  url_video text,
  url_audio text,
  redosled integer default 0,
  created_at timestamptz default now()
);

-- Dozvoli anonimni pristup (RLS off za demo, može se uključiti)
alter table ucesnice enable row level security;
alter table misli_rade enable row level security;
alter table unosi_grupe enable row level security;
alter table snimci_prakse enable row level security;
alter table tapkanja enable row level security;

create policy "public read ucesnice" on ucesnice for select using (true);
create policy "public insert ucesnice" on ucesnice for insert with check (true);

create policy "public read misli" on misli_rade for select using (true);
create policy "public insert misli" on misli_rade for insert with check (true);
create policy "public update misli" on misli_rade for update using (true);

create policy "public read unosi" on unosi_grupe for select using (true);
create policy "public insert unosi" on unosi_grupe for insert with check (true);

create policy "public read snimci" on snimci_prakse for select using (true);
create policy "public insert snimci" on snimci_prakse for insert with check (true);
create policy "public update snimci" on snimci_prakse for update using (true);
create policy "public read tapkanja" on tapkanja for select using (true);
create policy "public insert tapkanja" on tapkanja for insert with check (true);
create policy "public update tapkanja" on tapkanja for update using (true);
create policy "public delete tapkanja" on tapkanja for delete using (true);
