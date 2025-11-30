# Finance Tracker - Setup Guide

## 📦 Instalação de Dependências

Execute o comando abaixo para instalar todas as dependências necessárias:

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs clsx tailwind-merge lucide-react
```

Ou se preferir yarn:

```bash
yarn add @supabase/supabase-js @supabase/auth-helpers-nextjs clsx tailwind-merge lucide-react
```

## 🔧 Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a **URL** e a **anon key** do projeto

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 3. Criar Tabela de Transações

Execute o SQL abaixo no editor SQL do Supabase:

```sql
-- Enable Row Level Security
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own transactions
CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
```

## 🚀 Executar o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O app estará disponível em `http://localhost:3000`

### Build de Produção

```bash
npm run build
npm start
```

## 📱 PWA - Progressive Web App

O app já está configurado como PWA. Para instalar no celular:

1. Acesse o app no navegador mobile
2. No menu do navegador, selecione "Adicionar à tela inicial"
3. O app será instalado como um aplicativo nativo

## 🎨 Estrutura do Projeto

```
finance-tracker/
├── app/
│   ├── lib/
│   │   ├── supabase.ts       # Cliente e helpers do Supabase
│   │   ├── auth-context.tsx  # Context de autenticação
│   │   └── utils.ts          # Funções utilitárias
│   ├── login/                # Página de login
│   ├── register/             # Página de registro
│   ├── dashboard/            # Dashboard principal
│   ├── analytics/            # Página de análises
│   ├── settings/             # Configurações
│   ├── layout.tsx            # Layout raiz com AuthProvider
│   ├── page.tsx              # Landing page
│   └── globals.css           # Estilos globais
├── components/               # Componentes reutilizáveis
└── public/                   # Arquivos estáticos
```

## ✨ Funcionalidades Implementadas

### ✅ Autenticação
- Login com email/senha
- Registro de novos usuários
- Logout
- Proteção de rotas
- Persistência de sessão

### ✅ Gestão de Transações
- Adicionar transações (receitas/despesas)
- Listar transações
- Persistência no Supabase
- Cálculo automático de saldo

### ✅ Interface
- Landing page atraente
- Design responsivo
- Modo escuro
- Animações suaves
- PWA ready

### ✅ Acessibilidade
- Labels apropriados
- ARIA attributes
- Navegação por teclado
- Estados de foco visíveis

## 🔐 Segurança

- Row Level Security (RLS) habilitado
- Políticas de acesso por usuário
- Autenticação via Supabase Auth
- Variáveis de ambiente para credenciais

## 📝 Próximos Passos Sugeridos

1. **Analytics Funcional**: Implementar gráficos com Chart.js ou Recharts
2. **Importação CSV/OFX**: Completar funcionalidade de importação
3. **Categorias Personalizadas**: Permitir usuário criar categorias
4. **Filtros e Busca**: Adicionar filtros por data, categoria, tipo
5. **Exportação de Dados**: Permitir exportar transações
6. **Notificações**: Alertas de gastos e metas
7. **Testes**: Adicionar testes unitários e E2E

## 🐛 Troubleshooting

### Erro: "Cannot find module"
Execute `npm install` para instalar todas as dependências

### Erro de autenticação
Verifique se as variáveis de ambiente estão corretas no `.env.local`

### Tabela não encontrada
Execute o SQL de criação da tabela no Supabase

## 📞 Suporte

Para dúvidas ou problemas, verifique:
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
