-- =====================================================================
-- Buse Acar — İçerik Üreticisi Paneli
-- Supabase şeması
--
-- Supabase panelinde: SQL Editor → New query → bu dosyanın tamamını
-- yapıştır → Run. Tekrar çalıştırmak güvenlidir (idempotent).
--
-- ⚠️  GÜVENLİK NOTU
-- Bu şema GİRİŞSİZ (anonim) erişim için yazıldı. Aşağıdaki politikalar
-- `anon` rolüne tüm tablolarda okuma ve yazma izni verir. Yani uygulamanın
-- adresini bilen herkes bu verileri görebilir, değiştirebilir ve silebilir.
-- Bu bilinçli bir tercihti. Sonradan giriş eklemek istersen dosyanın
-- sonundaki "GİRİŞ EKLEMEK İSTERSEN" bölümüne bak.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Tablolar
-- ---------------------------------------------------------------------

-- Takipçi kayıtları. Tarih birincil anahtar: aynı güne ikinci kayıt
-- yeni satır açmaz, mevcut satırı günceller.
create table if not exists public.followers (
  date       date primary key,
  count      integer not null check (count >= 0),
  updated_at timestamptz not null default now()
);

-- Aktif hedef. Tek satırlık tablo — id her zaman 1.
create table if not exists public.goal (
  id          smallint primary key default 1 check (id = 1),
  target      integer not null check (target > 0),
  start_count integer not null check (start_count >= 0),
  start_date  date    not null,
  updated_at  timestamptz not null default now()
);

-- Tamamlanmış hedeflerin arşivi.
create table if not exists public.goal_history (
  id            text primary key,
  target        integer not null,
  start_count   integer not null,
  start_date    date    not null,
  reached_count integer not null,
  reached_date  date    not null,
  created_at    timestamptz not null default now()
);

-- İçerik fikir bankası.
create table if not exists public.ideas (
  id         text primary key,
  title      text not null,
  format     text not null default 'reels'  check (format in ('reels', 'post', 'story', 'karusel')),
  stage      text not null default 'fikir'  check (stage  in ('fikir', 'cekim', 'kurgu', 'paylasildi')),
  category   text not null default '',
  note       text not null default '',
  starred    boolean not null default false,
  created_at date not null default current_date,
  updated_at timestamptz not null default now()
);

-- Paylaşım saati ısı haritasının beslendiği gönderi kayıtları.
create table if not exists public.posts (
  id         text primary key,
  date       date not null,
  hour       smallint not null check (hour between 0 and 23),
  reach      integer  not null check (reach >= 0),
  created_at timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 2. İndeksler
-- ---------------------------------------------------------------------

create index if not exists ideas_stage_idx   on public.ideas (stage);
create index if not exists ideas_created_idx on public.ideas (created_at desc);
create index if not exists posts_date_idx    on public.posts (date desc);


-- ---------------------------------------------------------------------
-- 3. updated_at otomatik güncelleme
-- ---------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists followers_touch on public.followers;
create trigger followers_touch before update on public.followers
  for each row execute function public.touch_updated_at();

drop trigger if exists goal_touch on public.goal;
create trigger goal_touch before update on public.goal
  for each row execute function public.touch_updated_at();

drop trigger if exists ideas_touch on public.ideas;
create trigger ideas_touch before update on public.ideas
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------
-- 4. Row Level Security
--
-- RLS açık ama politikalar anonim erişime tamamen izin veriyor.
-- RLS'i kapatmak yerine açık bırakıp politika yazmak önemli: ileride
-- giriş eklemek istersen sadece bu bölümü değiştirmen yeterli olur.
-- ---------------------------------------------------------------------

alter table public.followers    enable row level security;
alter table public.goal         enable row level security;
alter table public.goal_history enable row level security;
alter table public.ideas        enable row level security;
alter table public.posts        enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['followers', 'goal', 'goal_history', 'ideas', 'posts']
  loop
    execute format('drop policy if exists anon_all on public.%I', t);
    execute format(
      'create policy anon_all on public.%I
         for all
         to anon, authenticated
         using (true)
         with check (true)', t);
  end loop;
end;
$$;


-- ---------------------------------------------------------------------
-- 5. Kontrol
-- ---------------------------------------------------------------------
-- Aşağıdaki sorgu 5 satır döndürmeli ve hepsinde rls_enabled = true olmalı.

select
  c.relname                          as tablo,
  c.relrowsecurity                   as rls_enabled,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname) as politika_sayisi
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('followers', 'goal', 'goal_history', 'ideas', 'posts')
order by c.relname;


-- =====================================================================
-- GİRİŞ EKLEMEK İSTERSEN (şimdilik çalıştırma)
--
-- 1. Her tabloya kullanıcı sütunu ekle:
--      alter table public.followers
--        add column user_id uuid not null default auth.uid()
--        references auth.users(id) on delete cascade;
--    (diğer 4 tablo için de aynısı)
--
-- 2. Yukarıdaki anon_all politikalarını sil, yerine şunu koy:
--      create policy own_rows on public.followers
--        for all to authenticated
--        using (auth.uid() = user_id)
--        with check (auth.uid() = user_id);
--
-- 3. Supabase → Authentication → Users → Add user ile tek kullanıcı aç.
-- 4. Uygulamaya giriş ekranı ekle (bu iş bana söylenirse yapılır).
-- =====================================================================
