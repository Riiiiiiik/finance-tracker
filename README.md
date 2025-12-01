# 💰 Finance Tracker - Controle Financeiro Pessoal

Um aplicativo web moderno e elegante para controle de finanças pessoais, construído com Next.js 14, TypeScript, Tailwind CSS e Supabase.

## ✨ Funcionalidades

### 🎨 Interface
- **Landing Page Premium** - Hero section moderna com apresentação do serviço
- **Design Responsivo** - Mobile-first, funciona perfeitamente em todos os dispositivos
- **PWA Ready** - Instalável como app no celular
- **Animações Fluidas** - Micro-interações e transições suaves
- **Dark Mode** - Interface escura moderna e elegante
- **Efeitos Glass** - Glassmorphism e gradientes modernos

### 🔐 Autenticação
- **Cadastro de Usuários** - Criação de conta com email e senha
- **Login Seguro** - Autenticação via Supabase
- **Proteção de Rotas** - Dashboard acessível apenas para usuários logados
- **Logout** - Encerramento seguro de sessão

### 💸 Gestão Financeira
- **Adicionar Transações** - Receitas e despesas com categorias
- **Visualizar Saldo** - Acompanhamento em tempo real
- **Histórico Completo** - Lista de todas as transações
- **Excluir Transações** - Gerenciamento completo dos dados
- **Categorização** - Categorias pré-definidas para organização

### 📊 Relatórios
- **Saldo Total** - Visualização do saldo atual
- **Total de Receitas** - Soma de todas as entradas
- **Total de Despesas** - Soma de todas as saídas
- **Últimas Transações** - Histórico ordenado por data

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: Shadcn/UI
- **Ícones**: Lucide React
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Deploy**: Vercel

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase
- Git (opcional)

### Passo a Passo

1. **Clone o repositório** (ou use o projeto existente)
```bash
cd c:\Users\Rik\Editores Albertis\finance-tracker\app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Já existe um arquivo `.env.local` com suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=https://jeeibwoqnonbnpydkpxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_GFBjJIQV3G28dcLDElzvyw_-iyeYhDL
```

4. **Configure o banco de dados**

Siga as instruções em `DATABASE_SETUP.md`:
- Acesse o Supabase Dashboard
- Execute o SQL do arquivo `supabase-schema.sql`
- Configure as URLs de autenticação

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

6. **Acesse o aplicativo**
```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
app/
├── app/
│   ├── layout.tsx          # Layout raiz com metadata PWA
│   ├── page.tsx            # Roteamento Landing/Dashboard
│   └── globals.css         # Estilos globais e animações
├── components/
│   ├── ui/                 # Componentes Shadcn/UI
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── table.tsx
│   ├── landing-page.tsx    # Landing page
│   ├── dashboard.tsx       # Dashboard principal
│   ├── auth-modal.tsx      # Modal de login/cadastro
│   └── add-transaction-modal.tsx  # Modal de transações
├── lib/
│   ├── supabase.ts         # Cliente Supabase
│   └── utils.ts            # Utilitários (cn)
├── public/
│   ├── manifest.json       # Manifest PWA
│   ├── icon-192x192.svg    # Ícone PWA 192x192
│   └── icon-512x512.svg    # Ícone PWA 512x512
├── supabase-schema.sql     # Schema do banco de dados
├── DATABASE_SETUP.md       # Guia de configuração
└── package.json            # Dependências
```

## 🎯 Como Usar

### Primeiro Acesso

1. Acesse `http://localhost:3000`
2. Clique em **"Começar Gratuitamente"**
3. Preencha seus dados (Nome, Email, Senha)
4. Verifique seu email e confirme a conta
5. Faça login com suas credenciais

### Adicionar Transação

1. No Dashboard, clique no botão **+** (flutuante)
2. Selecione o tipo: **Receita** ou **Despesa**
3. Preencha os campos:
   - Descrição (ex: "Salário", "Café")
   - Valor (ex: 5000.00)
   - Categoria (selecione da lista)
   - Data
4. Clique em **"Adicionar"**

### Excluir Transação

1. Passe o mouse sobre uma transação na lista
2. Clique no ícone de **lixeira** que aparece
3. Confirme a exclusão

## 🚢 Deploy na Vercel

1. **Instale a CLI da Vercel**
```bash
npm i -g vercel
```

2. **Faça o deploy**
```bash
vercel
```

3. **Configure as variáveis de ambiente**
- No dashboard da Vercel, adicione as mesmas variáveis do `.env.local`
- Atualize a **Site URL** no Supabase para a URL da Vercel

4. **Pronto!** Seu app está online 🎉

## 🎨 Customização

### Cores

Edite as variáveis CSS em `app/globals.css`:
```css
:root {
  --primary: 142 76% 36%;  /* Verde principal */
  --background: 0 0% 0%;   /* Fundo preto */
  /* ... outras cores */
}
```

### Categorias

Edite as categorias em `components/add-transaction-modal.tsx`:
```typescript
const expenseCategories = [
  "Alimentação",
  "Transporte",
  // Adicione suas categorias
];
```

## 🐛 Troubleshooting

### Erro ao compilar
```bash
# Limpe o cache e reinstale
rm -rf .next node_modules
npm install
npm run dev
```

### Erro de autenticação
- Verifique se o SQL foi executado no Supabase
- Confirme que as variáveis de ambiente estão corretas
- Verifique o email de confirmação

### Transações não aparecem
- Abra o Console (F12) e verifique erros
- Confirme que está logado
- Verifique as políticas RLS no Supabase

## 📝 Licença

Este projeto é de código aberto e está disponível para uso pessoal e comercial.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📧 Suporte

Para dúvidas ou problemas, consulte o arquivo `DATABASE_SETUP.md` ou abra uma issue.

---

Feito com ❤️ usando Next.js e Supabase
