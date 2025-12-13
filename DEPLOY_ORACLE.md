# ☁️ Deploy na Oracle Cloud (Bot + App)

Este guia descreve o plano para implantar o **Newsletter Bot** e a aplicação **Web** na sua instância Oracle Cloud usando Docker Compose.

> **⚠️ Atenção: Instanciando na AMD (VM.Standard.E2.1.Micro)**
> Se você estiver usando a instância "Always Free" da AMD, ela possui apenas **1GB de RAM**.
> O build do Next.js **vai falhar** por falta de memória se você não criar um arquivo de SWAP (memória virtual).
> **Siga rigorosamente o passo "1.1 Configurar Swap" abaixo.**

## 📋 Pré-requisitos

1.  **Instância Oracle Cloud** ativa (Ubuntu ou Oracle Linux).
2.  **Chave SSH** para acesso à instância.
3.  **Endereço IP** público da instância: `152.67.61.182`
4.  **Docker** e **Docker Compose** instalados na instância.

## 🆕 Passo 0: Criando a VM "Always Free" (Painel Oracle)

Se você ainda não criou a máquina, siga estas configurações exatas para não pagar nada:

1.  **Name**: `finance-tracker-bot` (ou o que preferir)
2.  **Image & Shape**:
    *   Clique em "Edit".
    *   **Image**: `Canonical Ubuntu 22.04` (Recomendado) ou 24.04.
    *   **Shape**: Selecione **AMD Processors** -> `VM.Standard.E2.1.Micro`.
    *   *Nota: Se aparecer "Always Free Eligible" ao lado, está certo.*
3.  **Networking**:
    *   "Create new virtual cloud network" (se não tiver uma).
    *   "Create new public subnet".
    *   **IMPORTANTE**: Certifique-se de que "Assign a public IPv4 address" está marcado.
4.  **SSH Keys**:
    *   "Save Private Key" (Salve isso no seu computador seguro! Você não consegue baixar depois).
5.  **Boot Volume**:
    *   Pode deixar o padrão (geralmente 47GB). O Free Tier permite até 200GB no total.
6.  Clique em **Create**.

---

## 🚀 Plano de Execução

### 1. Preparar a Instância (Oracle VM)

Primeiro, precisamos garantir que o servidor tenha o ambiente necessário.

**Comandos para rodar no servidor (SSH):**

```bash
# Atualizar o sistema
sudo apt-get update && sudo apt-get upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário atual ao grupo docker (para não usar sudo no docker)
sudo usermod -aG docker $USER

# Instalar Docker Compose (se não vier no plugin do docker)
sudo apt-get install -y docker-compose-plugin

# Ativar as mudanças de grupo (ou faça logout/login)
newgrp docker
```

### 1.1. Configurar Swap (CRÍTICO para AMD 1GB RAM)

Sem isso, o comando `npm run build` vai travar o servidor.

```bash
# Criar um arquivo de swap de 4GB
sudo fallocate -l 4G /swapfile

# Definir permissões corretas
sudo chmod 600 /swapfile

# Configurar como área de swap
sudo mkswap /swapfile

# Ativar o swap
sudo swapon /swapfile

# Garantir que o swap persista após reinicialização
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verificar se funcionou (deve mostrar Swap total de ~4G)
free -h
```

### 2. Configurar Firewall (Oracle Network Security)

Certifique-se de liberar as portas necessárias no painel da Oracle Cloud (Security Lists / Ingress Rules):
- **22** (SSH) - Já deve estar aberta.
- **80** (HTTP) - Para acesso web padrão.
- **443** (HTTPS) - Para SSL futuro.
- **3000** (Web App) - Se formos acessar diretamente na porta 3000 inicialmenete.

*Dica: No Ubuntu/Oracle Linux, você também pode precisar liberar no firewall interno (`iptables` ou `ufw`).*

### 3. Transferir o Projeto

Recomendamos usar o **Git** para clonar o projeto no servidor.

```bash
# No servidor:
git clone https://github.com/Riiiiiiik/finance-tracker.git
cd finance-tracker/app
```

*Alternativa: Se o código local tiver alterações não comitadas, podemos usar `scp` ou `rsync` para copiar os arquivos da sua máquina para o servidor.*

### 4. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na pasta do projeto no servidor.

```bash
nano .env
```

Cole o conteúdo (baseado no seu `.env.local`), adicionando as chaves do bot:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Bot Secrets
PERPLEXITY_API_KEY=...

# Comunicação Interna (Web + Bot)
# Como estão na mesma rede docker, o bot acessa o web pelo nome do serviço 'web'
SITE_API_URL=http://web:3000/api/news/ingest

# Segurança & Admin
CRON_SECRET=sua_chave_secreta_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_do_supabase
```

### 5. Subir os Containers

Na pasta `app/` dentro do servidor:

```bash
docker compose up -d --build
```

Isso irá:
1. Construir a imagem do Next.js (`web`).
2. Construir a imagem do Bot (`bot`).
3. Iniciar ambos em background.

### 6. Monitoramento

- **Ver logs do Bot:** `docker compose logs -f bot`
- **Ver logs da Web:** `docker compose logs -f web`
- **Parar:** `docker compose down`

---

## 🤖 Sobre o Bot

O bot está configurado (`Dockerfile.bot`) para rodar o script `scripts/daily_newsletter_bot.py`.
O `docker-compose.yml` garante que ele reinicia automaticamente (`restart: always`) e roda em loop (a cada 6h configurado no `start.sh`).

## ✅ Próximos Passos Imediatos

1. Confirme se você tem o **IP da máquina Oracle** e a **Key SSH**.
2. Vamos rodar os comandos de preparação (Passo 1).
3. Fazer o deploy!
