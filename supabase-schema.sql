-- ============================================
-- TABELA DE PERFIS DE USUÁRIOS
-- ============================================

-- Criar tabela de perfis
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS na tabela profiles
alter table public.profiles enable row level security;

-- Políticas de segurança para profiles
create policy "Usuários podem ver seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Função para criar perfil automaticamente quando usuário se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger que executa a função quando um novo usuário é criado
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- TABELA DE TRANSAÇÕES
-- ============================================

-- Criar tabela de transações
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  description text not null,
  amount decimal(10, 2) not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar índices para melhor performance
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_date_idx on public.transactions(date desc);

-- Habilitar RLS (Row Level Security)
alter table public.transactions enable row level security;

-- Políticas de segurança para transactions
create policy "Usuários podem ver suas próprias transações"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias transações"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias transações"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias transações"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ============================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para atualizar updated_at automaticamente
drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at_transactions on public.transactions;
create trigger set_updated_at_transactions
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();
