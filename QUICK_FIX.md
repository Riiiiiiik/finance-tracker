# ⚡ Checklist Rápido - Resolver "Failed to fetch"

## 🔴 Erro que você está vendo:
```
Failed to fetch
```

## ✅ Solução em 5 Passos:

### 1️⃣ Executar o SQL no Supabase

**Acesse:** https://supabase.com/dashboard/project/jeeibwoqnonbnpydkpxx/sql

1. Clique em **"New Query"**
2. Abra o arquivo `supabase-schema.sql`
3. Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)
4. Cole no SQL Editor (Ctrl+V)
5. Clique em **"RUN"** ou pressione Ctrl+Enter
6. Aguarde mensagem de sucesso ✅

---

### 2️⃣ Configurar Site URL

**Acesse:** https://supabase.com/dashboard/project/jeeibwoqnonbnpydkpxx/auth/url-configuration

1. Em **"Site URL"**, coloque:
   ```
   http://localhost:3000
   ```

2. Clique em **"Save"**

---

### 3️⃣ Configurar Redirect URLs

**Na mesma página** (URL Configuration):

1. Em **"Redirect URLs"**, clique em **"Add URL"**
2. Adicione:
   ```
   http://localhost:3000/**
   ```
3. Clique em **"Save"**

---

### 4️⃣ Desabilitar Confirmação de Email (Para Testes)

**Acesse:** https://supabase.com/dashboard/project/jeeibwoqnonbnpydkpxx/auth/providers

1. Clique em **"Email"**
2. Role até **"Email confirmation"**
3. **DESMARQUE** a opção "Enable email confirmations"
4. Clique em **"Save"**

⚠️ **Isso é só para testes!** Em produção, deixe ativado.

---

### 5️⃣ Reiniciar o Servidor

No terminal, pressione **Ctrl+C** para parar o servidor, depois:

```bash
npm run dev
```

---

## 🎯 Testar Agora:

1. Acesse: http://localhost:3000
2. Clique em **"Começar Gratuitamente"**
3. Preencha:
   - Nome: Rikelme Santos
   - Email: c4n1future@gmail.com
   - Senha: (mínimo 6 caracteres)
4. Clique em **"Criar Conta"**

**Resultado esperado:**
- ✅ Mensagem: "Conta criada com sucesso!"
- ✅ Redirecionamento para Dashboard
- ✅ Sem erro "Failed to fetch"

---

## 🐛 Se ainda der erro:

### Verifique o Console (F12):

1. Pressione **F12** no navegador
2. Vá na aba **Console**
3. Procure por erros em vermelho
4. Me envie o erro exato

### Verifique as credenciais:

Abra o arquivo `.env.local` e confirme:
```env
NEXT_PUBLIC_SUPABASE_URL=https://jeeibwoqnonbnpydkpxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_GFBjJIQV3G28dcLDElzvyw_-iyeYhDL
```

---

## 📞 Mensagens de Erro Traduzidas:

Agora o sistema mostra erros em português:

| Erro Original | Mensagem em Português |
|---------------|----------------------|
| `Invalid login credentials` | Email ou senha incorretos |
| `Email not confirmed` | Por favor, confirme seu email antes de fazer login |
| `User already registered` | Este email já está cadastrado |
| `Password should be at least 6 characters` | A senha deve ter no mínimo 6 caracteres |
| `Failed to fetch` | Erro de conexão. Verifique: 1) Sua internet 2) Se executou o SQL no Supabase 3) Se configurou as URLs |

---

**Siga esses 5 passos e o erro deve sumir!** 🚀
