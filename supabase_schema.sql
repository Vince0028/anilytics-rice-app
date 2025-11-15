
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  first_name text,
  last_name text,
  email text unique,
  password_hash text
);

alter table public.profiles alter column id set default uuid_generate_v4();
alter table public.profiles add column if not exists password_hash text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;

create table if not exists public.sales (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  timestamp timestamptz not null default now(),
  week_date text not null,
  data_level text not null check (data_level in ('daily','weekly','monthly','yearly')),
  year int,
  month int,
  week int,
  day int,
  rice_sold numeric,
  rice_unsold numeric,
  price_per_kg numeric,
  population int,
  avg_consumption numeric,
  purchasing_power numeric,
  competitors int,
  customer_demand text,
  predicted_demand numeric,
  waste_percentage numeric,
  total_revenue numeric
);


do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'sales_user_id_fkey'
      and table_name = 'sales'
  ) then
    alter table public.sales drop constraint sales_user_id_fkey;
  end if;
exception when undefined_table then null;
end $$;

alter table public.sales
  add constraint sales_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;


create index if not exists idx_sales_user_id on public.sales(user_id);
create index if not exists idx_sales_year_month on public.sales(year, month);
create index if not exists idx_profiles_email on public.profiles(lower(email));

alter table public.profiles add column if not exists role text;
update public.profiles set role = coalesce(role, 'consumer');
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'profiles' and constraint_name = 'profiles_role_check'
  ) then
    alter table public.profiles add constraint profiles_role_check check (role in ('consumer','retailer'));
  end if;
end $$;
alter table public.profiles add column if not exists retailer_company text;
alter table public.profiles add column if not exists retailer_area text;
alter table public.profiles add column if not exists retailer_location text;
create index if not exists idx_profiles_role on public.profiles(role);

create table if not exists public.retailer_inventory (
  id uuid primary key default uuid_generate_v4(),
  retailer_id uuid not null references public.profiles(id) on delete cascade,
  date_posted date not null default current_date,
  rice_variety text,
  stock_kg numeric not null,
  price_per_kg numeric not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_ri_date on public.retailer_inventory(date_posted);
create index if not exists idx_ri_retailer on public.retailer_inventory(retailer_id);
