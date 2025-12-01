# 🚀 Guia Completo de Configuração - Finance Tracker

## 📋 Índice
1. [Configuração do Supabase](#1-configuração-do-supabase)
2. [Executar SQL](#2-executar-sql)
3. [Configurar Autenticação](#3-configurar-autenticação)
4. [Testar o Sistema](#4-testar-o-sistema)
5. [Solução de Problemas](#5-solução-de-problemas)

---

## 1. Configuração do Supabase

### Passo 1.1: Acessar o Projeto

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **jeeibwoqnonbnpydkpxx**

---

## 2. Executar SQL

### Passo 2.1: Abrir SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query** (botão verde no canto superior direito)

### Passo 2.2: Executar o Schema

1. Abra o arquivo `supabase-schema.sql` no seu projeto
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole** no SQL Editor do Supabase (Ctrl+V)
4. Clique em **RUN** (ou pressione Ctrl+Enter)
5. Aguarde a mensagem de sucesso ✅

### Passo 2.3: Verificar Tabelas Criadas

1. No menu lateral, clique em **Table Editor**
2. Você deve ver 2 tabelas:
   - ✅ `profiles`
   - ✅ `transactions`

---

## 3. Configurar Autenticação

### Passo 3.1: Configurar URLs

1. No menu lateral, clique em **Authentication** > **URL Configuration**
2. Configure os seguintes campos:

   **Site URL:**
   ```
   http://localhost:3000
   ```

   **Redirect URLs:** (clique em "Add URL" para cada uma)
   ```
   http://localhost:3000
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   ```

3. Clique em **Save**

### Passo 3.2: Configurar Email Templates (Opcional)

1. Vá em **Authentication** > **Email Templates**
2. Você pode personalizar os templates se quiser
3. **Importante**: Verifique se o email está configurado para enviar

### Passo 3.3: Desabilitar Confirmação de Email (Para Testes)

⚠️ **Apenas para desenvolvimento/testes:**

1. Vá em **Authentication** > **Providers** > **Email**
2. Role até **Email confirmation**
3. **Desmarque** a opção "Enable email confirmations"
4. Clique em **Save**

Isso permite que você teste sem precisar confirmar o email toda vez.

### Passo 3.4: Verificar CORS

1. Vá em **Settings** > **API**
2. Role até **CORS Allowed Origins**
3. Adicione:
   ```
   http://localhost:3000
   ```
4. Clique em **Save**

---

## 4. Testar o Sistema

### Teste 1: Criar Conta

1. Acesse: http://localhost:3000
2. Clique em **"Começar Gratuitamente"**
3. Preencha:
   - Nome: Seu Nome
   - Email: seu@email.com
   - Senha: mínimo 6 caracteres
4. Clique em **"Criar Conta"**

**Resultado Esperado:**
- ✅ Mensagem de sucesso
- ✅ Redirecionamento para Dashboard (se desabilitou confirmação de email)
- ✅ OU mensagem para verificar email (se manteve confirmação ativa)

### Teste 2: Verificar Perfil Criado

1. No Supabase, vá em **Table Editor** > **profiles**
2. Você deve ver seu perfil criado automaticamente
3. Campos preenchidos: `id`, `email`, `full_name`

### Teste 3: Adicionar Transação

1. No Dashboard, clique no botão **+** (canto inferior direito)
2. Selecione tipo: **Despesa** ou **Receita**
3. Preencha os campos
4. Clique em **"Adicionar"**

**Resultado Esperado:**
- ✅ Transação aparece na lista
- ✅ Saldo é atualizado

### Teste 4: Ver Perfil

1. No Dashboard, clique no ícone de **usuário** (👤) no header
2. Modal abre com seus dados
3. Tente editar o nome
4. Clique em **"Salvar"**

**Resultado Esperado:**
- ✅ Nome atualizado
- ✅ Mensagem de sucesso

---

## 5. Solução de Problemas

### ❌ Erro: "Failed to fetch"

**Causas possíveis:**

1. **CORS não configurado**
   - Solução: Adicione `http://localhost:3000` em CORS (Passo 3.4)

2. **URLs não configuradas**
   - Solução: Configure Site URL e Redirect URLs (Passo 3.1)

3. **Credenciais do Supabase incorretas**
   - Verifique o arquivo `.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://jeeibwoqnonbnpydkpxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_GFBjJIQV3G28dcLDElzvyw_-iyeYhDL
     ```

4. **Servidor não está rodando**
   - Execute: `npm run dev`
   - Verifique se está rodando em http://localhost:3000

### ❌ Erro: "Email not confirmed"

**Solução 1 (Recomendada para testes):**
- Desabilite confirmação de email (Passo 3.3)

**Solução 2 (Para produção):**
- Verifique seu email e clique no link de confirmação
- OU no Supabase: **Authentication** > **Users** > Clique no usuário > **Confirm email**

### ❌ Erro: "Invalid login credentials"

**Causas:**
1. Email ou senha incorretos
2. Email não confirmado (se confirmação estiver ativa)

**Solução:**
- Verifique as credenciais
- Confirme o email
- Ou crie uma nova conta

### ❌ Transações não aparecem

**Causas:**
1. SQL não foi executado
2. RLS está bloqueando

**Solução:**
1. Verifique se executou o SQL (Passo 2)
2. No Supabase, vá em **Table Editor** > **transactions**
3. Clique em **RLS** (Row Level Security)
4. Verifique se as políticas estão ativas

### ❌ Perfil não é criado automaticamente

**Causa:**
- Trigger não foi criado

**Solução:**
1. Execute o SQL novamente (Passo 2)
2. Verifique se a função `handle_new_user()` existe:
   - Vá em **Database** > **Functions**
   - Procure por `handle_new_user`

### 🔍 Como Debugar

**1. Abra o Console do Navegador:**
- Pressione F12
- Vá na aba **Console**
- Procure por erros em vermelho

**2. Verifique o Network:**
- Na aba **Network** (F12)
- Tente criar conta novamente
- Procure por requisições com status 400, 401, 403, 500

**3. Verifique os Logs do Supabase:**
- No Supabase Dashboard
- Vá em **Logs** > **Auth Logs**
- Veja se há erros de autenticação

---

## 📊 Estrutura de Dados

### Tabelas Criadas:

```
public.profiles
├── id (uuid) - FK → auth.users.id
├── email (text)
├── full_name (text)
├── avatar_url (text)
├── created_at (timestamp)
└── updated_at (timestamp)

public.transactions
├── id (uuid)
├── user_id (uuid) - FK → auth.users.id
├── description (text)
├── amount (decimal)
├── type (text) - 'income' ou 'expense'
├── category (text)
├── date (date)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Triggers Criados:

1. **on_auth_user_created** - Cria perfil automaticamente
2. **set_updated_at_profiles** - Atualiza `updated_at` em profiles
3. **set_updated_at_transactions** - Atualiza `updated_at` em transactions

### Políticas RLS:

- ✅ Usuários só veem seus próprios dados
- ✅ Usuários só podem criar/editar/deletar seus próprios dados
- ✅ Proteção automática contra acesso não autorizado

---

## ✅ Checklist Final

Antes de usar o app, verifique:

- [ ] SQL executado com sucesso
- [ ] Tabelas `profiles` e `transactions` criadas
- [ ] Site URL configurada: `http://localhost:3000`
- [ ] Redirect URLs configuradas
- [ ] CORS configurado
- [ ] Confirmação de email desabilitada (para testes)
- [ ] Servidor rodando: `npm run dev`
- [ ] Arquivo `.env.local` com credenciais corretas

---

## 🎯 Comandos Úteis

### Reiniciar o servidor:
```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

### Limpar cache do Next.js:
```bash
rm -rf .next
npm run dev
```

### Ver logs do Supabase:
- Dashboard > Logs > Auth Logs
- Dashboard > Logs > Database Logs

### Deletar todos os dados de teste:
```sql
-- No SQL Editor do Supabase
DELETE FROM public.transactions;
DELETE FROM public.profiles;
-- Depois vá em Authentication > Users e delete os usuários
```

---

## 📞 Suporte

Se ainda tiver problemas:

1. Verifique o arquivo `DATA_STRUCTURE.md` para entender a estrutura
2. Veja o `README.md` para documentação completa
3. Abra o Console (F12) e procure por erros
4. Verifique os logs do Supabase

---

**Última atualização:** 30/11/2024
**Versão:** 2.0
