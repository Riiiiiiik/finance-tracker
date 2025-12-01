# 📊 Estrutura de Dados - Finance Tracker

## 🗄️ Banco de Dados (PostgreSQL via Supabase)

### Tabela: `auth.users` (Gerenciada pelo Supabase)

Esta tabela é **criada automaticamente** pelo Supabase e armazena os dados de autenticação.

```sql
auth.users
├── id (uuid) - ID único do usuário
├── email (text) - Email do usuário
├── encrypted_password (text) - Senha criptografada
├── email_confirmed_at (timestamp) - Data de confirmação do email
├── created_at (timestamp) - Data de criação
└── user_metadata (jsonb) - Dados extras (nome, etc)
```

**Você NÃO precisa criar essa tabela!** Ela já existe.

---

### Tabela: `public.profiles` (Criada por você)

Armazena informações adicionais do perfil do usuário.

```sql
public.profiles
├── id (uuid) - FK → auth.users.id
├── email (text) - Email (copiado de auth.users)
├── full_name (text) - Nome completo
├── avatar_url (text) - URL da foto de perfil (futuro)
├── created_at (timestamp) - Data de criação
└── updated_at (timestamp) - Data de atualização
```

**Criação Automática:**
- Quando um usuário se cadastra, um **trigger** cria automaticamente o perfil
- O nome é copiado de `user_metadata` para `profiles.full_name`

---

### Tabela: `public.transactions` (Criada por você)

Armazena todas as transações financeiras.

```sql
public.transactions
├── id (uuid) - ID único da transação
├── user_id (uuid) - FK → auth.users.id
├── description (text) - Descrição (ex: "Café")
├── amount (decimal) - Valor (negativo para despesas)
├── type (text) - 'income' ou 'expense'
├── category (text) - Categoria (ex: "Alimentação")
├── date (date) - Data da transação
├── created_at (timestamp) - Data de criação
└── updated_at (timestamp) - Data de atualização
```

---

## 🔐 Segurança (Row Level Security - RLS)

### Como funciona:

```
Usuário A (id: abc-123)
├── Pode ver: transactions onde user_id = abc-123
├── Pode criar: transactions com user_id = abc-123
├── Pode editar: transactions onde user_id = abc-123
└── Pode deletar: transactions onde user_id = abc-123

Usuário B (id: xyz-789)
├── Pode ver: transactions onde user_id = xyz-789
└── NÃO pode ver transações do Usuário A ❌
```

### Políticas RLS:

```sql
-- Usuários só veem suas próprias transações
create policy "Usuários podem ver suas próprias transações"
  on public.transactions for select
  using (auth.uid() = user_id);

-- Usuários só criam transações para si mesmos
create policy "Usuários podem inserir suas próprias transações"
  on public.transactions for insert
  with check (auth.uid() = user_id);
```

---

## 🔄 Fluxo de Dados

### 1. Cadastro de Usuário

```
1. Usuário preenche formulário (Nome, Email, Senha)
   ↓
2. Supabase cria registro em auth.users
   ↓
3. Trigger automático cria registro em public.profiles
   ↓
4. Email de confirmação é enviado
   ↓
5. Usuário confirma email
   ↓
6. Usuário pode fazer login
```

### 2. Login

```
1. Usuário digita Email e Senha
   ↓
2. Supabase valida credenciais
   ↓
3. Token de sessão é criado
   ↓
4. Usuário é redirecionado para Dashboard
```

### 3. Adicionar Transação

```
1. Usuário clica no botão +
   ↓
2. Preenche formulário (Descrição, Valor, etc)
   ↓
3. Dados são enviados para Supabase
   ↓
4. Supabase valida RLS (user_id correto?)
   ↓
5. Transação é salva em public.transactions
   ↓
6. Lista de transações é atualizada
```

### 4. Ver Perfil

```
1. Usuário clica no ícone de perfil (👤)
   ↓
2. Modal abre e busca dados em public.profiles
   ↓
3. Exibe: Nome, Email, ID
   ↓
4. Usuário pode editar o nome
   ↓
5. Dados são salvos em public.profiles
```

---

## 📝 Exemplo Prático

### Cenário: João cria uma conta

```
1. João preenche:
   - Nome: "João Silva"
   - Email: "joao@email.com"
   - Senha: "senha123"

2. Supabase cria em auth.users:
   {
     id: "abc-123-def-456",
     email: "joao@email.com",
     encrypted_password: "hash_da_senha",
     user_metadata: { full_name: "João Silva" }
   }

3. Trigger cria em public.profiles:
   {
     id: "abc-123-def-456",
     email: "joao@email.com",
     full_name: "João Silva",
     created_at: "2024-01-15 10:00:00"
   }

4. João confirma email e faz login

5. João adiciona uma transação:
   {
     id: "trans-001",
     user_id: "abc-123-def-456",
     description: "Café Starbucks",
     amount: -15.50,
     type: "expense",
     category: "Alimentação",
     date: "2024-01-15"
   }

6. João só vê suas próprias transações
   - Busca: SELECT * FROM transactions WHERE user_id = 'abc-123-def-456'
   - Resultado: Apenas transações do João ✅
```

---

## 🎯 Resumo Visual

```
┌─────────────────────────────────────────────┐
│         SUPABASE (PostgreSQL)               │
├─────────────────────────────────────────────┤
│                                             │
│  auth.users (Automática)                    │
│  ├── João (abc-123)                         │
│  └── Maria (xyz-789)                        │
│                                             │
│  public.profiles (Criada por você)          │
│  ├── João (abc-123) → "João Silva"          │
│  └── Maria (xyz-789) → "Maria Santos"       │
│                                             │
│  public.transactions (Criada por você)      │
│  ├── Café (user_id: abc-123) ← João         │
│  ├── Salário (user_id: abc-123) ← João      │
│  ├── Uber (user_id: xyz-789) ← Maria        │
│  └── Netflix (user_id: xyz-789) ← Maria     │
│                                             │
└─────────────────────────────────────────────┘

RLS garante que:
- João só vê: Café, Salário
- Maria só vê: Uber, Netflix
```

---

## ✅ Checklist de Configuração

- [ ] Executar `supabase-schema.sql` no Supabase
- [ ] Verificar se tabela `profiles` foi criada
- [ ] Verificar se tabela `transactions` foi criada
- [ ] Verificar se triggers estão ativos
- [ ] Verificar se políticas RLS estão ativas
- [ ] Testar cadastro de usuário
- [ ] Verificar se perfil é criado automaticamente
- [ ] Testar adicionar transação
- [ ] Verificar se RLS está funcionando

---

## 🔧 Comandos Úteis (SQL)

### Ver todos os usuários:
```sql
SELECT id, email, created_at FROM auth.users;
```

### Ver todos os perfis:
```sql
SELECT * FROM public.profiles;
```

### Ver todas as transações:
```sql
SELECT * FROM public.transactions ORDER BY date DESC;
```

### Ver transações de um usuário específico:
```sql
SELECT * FROM public.transactions 
WHERE user_id = 'abc-123-def-456';
```

### Deletar todas as transações de teste:
```sql
DELETE FROM public.transactions;
```

---

Agora você tem uma visão completa de como os dados são estruturados e protegidos! 🚀
