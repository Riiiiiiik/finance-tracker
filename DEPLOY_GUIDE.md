# 🚀 Checklist de Deploy - Finance Tracker

## ✅ Passo a Passo para Colocar o App no Ar

### 📋 **Pré-requisitos**
- [ ] Conta no Supabase criada
- [ ] Conta na Vercel criada
- [ ] Projeto rodando localmente (npm run dev)

---

## 1️⃣ **CONFIGURAR SUPABASE** (15 minutos)

### 1.1 - Executar SQL
1. Acesse: https://supabase.com/dashboard/project/jeeibwoqnonbnpydkpxx
2. Menu lateral: **SQL Editor**
3. Clique em **"New Query"**
4. Abra o arquivo `supabase-schema.sql` no seu projeto
5. Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)
6. Cole no SQL Editor (Ctrl+V)
7. Clique em **"RUN"** (botão verde)
8. Aguarde mensagem de sucesso ✅

### 1.2 - Verificar Tabelas Criadas
1. Menu lateral: **Table Editor**
2. Deve aparecer:
   - ✅ `profiles`
   - ✅ `transactions`

### 1.3 - Configurar URLs de Autenticação
1. Menu lateral: **Authentication** > **URL Configuration**
2. Em **"Site URL"**, coloque:
   ```
   http://localhost:3000
   ```
3. Em **"Redirect URLs"**, adicione:
   ```
   http://localhost:3000/**
   ```
4. Clique em **"Save"**

### 1.4 - Desabilitar Confirmação de Email (Para Testes)
1. Menu lateral: **Authentication** > **Providers**
2. Clique em **"Email"**
3. Role até **"Email confirmation"**
4. **DESMARQUE** a opção "Enable email confirmations"
5. Clique em **"Save"**

### 1.5 - Pegar Credenciais
1. Menu lateral: **Settings** > **API**
2. Copie:
   - **Project URL** (ex: https://xxx.supabase.co)
   - **anon public** key (chave longa)

---

## 2️⃣ **CONFIGURAR PROJETO LOCAL** (5 minutos)

### 2.1 - Atualizar .env.local
1. Abra o arquivo `.env.local` na raiz do projeto
2. Cole as credenciais:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://jeeibwoqnonbnpydkpxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```
3. Salve o arquivo

### 2.2 - Reiniciar Servidor
```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

### 2.3 - Testar Localmente
1. Acesse: http://localhost:3000
2. Clique em **"Começar Gratuitamente"**
3. Crie uma conta de teste
4. Adicione uma transação
5. Verifique se aparece na lista ✅

---

## 3️⃣ **FAZER DEPLOY NA VERCEL** (10 minutos)

### 3.1 - Instalar Vercel CLI (se não tiver)
```bash
npm install -g vercel
```

### 3.2 - Fazer Login
```bash
vercel login
```

### 3.3 - Deploy
```bash
vercel
```

Responda as perguntas:
- Set up and deploy? **Y**
- Which scope? (sua conta)
- Link to existing project? **N**
- Project name? **finance-tracker** (ou outro nome)
- Directory? **./** (deixe em branco, Enter)
- Override settings? **N**

### 3.4 - Aguardar Deploy
- Vercel vai fazer build e deploy
- No final, mostra a URL: `https://seu-app.vercel.app`

---

## 4️⃣ **CONFIGURAR VARIÁVEIS DE AMBIENTE NA VERCEL** (5 minutos)

### 4.1 - Acessar Dashboard da Vercel
1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto

### 4.2 - Adicionar Variáveis
1. Vá em **Settings** > **Environment Variables**
2. Adicione:
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://jeeibwoqnonbnpydkpxx.supabase.co
   ```
3. Adicione:
   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: sua-chave-anon-aqui
   ```
4. Clique em **"Save"**

### 4.3 - Redeploy
1. Vá em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **"Redeploy"**
4. Aguarde finalizar

---

## 5️⃣ **ATUALIZAR URLs NO SUPABASE** (3 minutos)

### 5.1 - Configurar URL de Produção
1. Volte no Supabase: **Authentication** > **URL Configuration**
2. Em **"Site URL"**, coloque:
   ```
   https://seu-app.vercel.app
   ```
3. Em **"Redirect URLs"**, adicione:
   ```
   https://seu-app.vercel.app/**
   ```
4. Clique em **"Save"**

---

## 6️⃣ **TESTAR APP EM PRODUÇÃO** (5 minutos)

### 6.1 - Acessar URL
1. Acesse: `https://seu-app.vercel.app`
2. Landing page deve carregar ✅

### 6.2 - Criar Conta
1. Clique em **"Começar Gratuitamente"**
2. Preencha: Nome, Email, Senha
3. Clique em **"Criar Conta"**
4. Deve redirecionar para Dashboard ✅

### 6.3 - Adicionar Transação
1. Clique no botão **+**
2. Adicione uma transação de teste
3. Deve aparecer na lista ✅

---

## 7️⃣ **CONVIDAR 10 PESSOAS PARA TESTAR** (Opcional)

### 7.1 - Compartilhar Link
Envie para seus testadores:
```
🎉 Teste o Finance Tracker!

Link: https://seu-app.vercel.app

Como usar:
1. Clique em "Começar Gratuitamente"
2. Crie sua conta (nome, email, senha)
3. Adicione suas transações
4. Explore o app!

Me envie feedback! 🚀
```

### 7.2 - Monitorar Uso
1. **Supabase**: Dashboard > Settings > Usage
2. **Vercel**: Dashboard > Analytics

---

## 🐛 **TROUBLESHOOTING**

### Erro: "Failed to fetch"
**Causa:** URLs não configuradas no Supabase
**Solução:** Siga o passo 1.3 e 5.1

### Erro: "Invalid login credentials"
**Causa:** Email não confirmado
**Solução:** Desabilite confirmação de email (passo 1.4)

### Erro: "Build failed" na Vercel
**Causa:** Erro no código
**Solução:** 
```bash
npm run build
```
Veja o erro localmente e corrija

### App não carrega em produção
**Causa:** Variáveis de ambiente não configuradas
**Solução:** Siga o passo 4.2

---

## 📊 **MONITORAMENTO**

### Supabase
- **Usage**: Settings > Usage
- **Logs**: Logs > Auth Logs / Database Logs

### Vercel
- **Analytics**: Dashboard > Analytics
- **Logs**: Deployments > View Function Logs

---

## ✅ **CHECKLIST FINAL**

Antes de compartilhar com usuários:

- [ ] SQL executado no Supabase
- [ ] Tabelas `profiles` e `transactions` criadas
- [ ] URLs configuradas no Supabase (local e produção)
- [ ] Confirmação de email desabilitada
- [ ] Deploy feito na Vercel
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] App testado em produção
- [ ] Consegue criar conta
- [ ] Consegue adicionar transação
- [ ] Consegue ver transações

---

## 💰 **CUSTOS**

Para 10 usuários em testes:
- Supabase Free: R$ 0,00
- Vercel Hobby: R$ 0,00
- **Total: R$ 0,00/mês** ✅

---

## 📞 **SUPORTE**

Se tiver problemas:
1. Veja `QUICK_FIX.md`
2. Veja `DATABASE_SETUP.md`
3. Abra o Console (F12) e veja erros
4. Verifique logs no Supabase e Vercel

---

**Última atualização:** 30/11/2024
**Tempo estimado total:** 40 minutos
