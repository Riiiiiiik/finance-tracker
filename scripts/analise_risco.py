import os
import json
import sqlite3
import google.generativeai as genai
from datetime import datetime


# ==============================================================================
# SEGURANÇA CRÍTICA - ARQUITETURA DE MEDIAÇÃO (AIR GAP LÓGICO)
# ==============================================================================
# 1. A IA (Gemini/DeepSeek) NUNCA deve conectar diretamente ao banco de dados.
# 2. Este script Python age como o "Mediador Seguro".
# 3. Fluxo de Dados: [Banco de Dados] -> (SQL Seguro) -> [Python Script] -> (JSON Anônimo) -> [IA]
# 4. A IA recebe apenas dados anonimizados sem PII (Nome, CPF, Email).
# ==============================================================================

# 1. Configuração da API do Google (Antigravity/Gemini)
# Ele vai buscar a chave nas variáveis de ambiente (mais seguro)
api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    # Fallback ou erro explícito. 
    # Em produção, raise ValueError. Para test local sem chave, pode comentar.
    # raise ValueError("A chave API do Google não foi encontrada!")
    print("AVISO: GOOGLE_API_KEY não encontrada. Verifique as variáveis de ambiente.")

if api_key:
    genai.configure(api_key=api_key)
    # Configuração do Modelo (Gemini 1.5 Flash é rápido e barato/grátis)
    model = genai.GenerativeModel('gemini-2.0-flash-exp',
                                  generation_config={"response_mime_type": "application/json"})

# ---------------------------------------------------------
# 2. Simulação de Banco de Dados (Substitua pelo seu real)
# ---------------------------------------------------------
def buscar_transacoes_usuario(user_id):
    """
    Aqui você conectaria no seu PostgreSQL/MySQL.
    Estou simulando um retorno de dados para o exemplo funcionar.
    """
    # Exemplo: Usuário gastando muito e sem reserva
    return {
        "user_id": user_id,
        "historico_30_dias": [
            {"data": "2023-10-01", "categoria": "Salario", "valor": 3000.00, "tipo": "entrada"},
            {"data": "2023-10-05", "categoria": "Aluguel", "valor": -1200.00, "tipo": "saida"},
            {"data": "2023-10-10", "categoria": "Cartao Credito", "valor": -1800.00, "tipo": "saida"},
            {"data": "2023-10-15", "categoria": "Emprestimo", "valor": -200.00, "tipo": "saida"},
        ],
        "saldo_atual": -200.00,
        "reserva_emergencia_estimada": 0.00
    }

import requests

# ---------------------------------------------------------
# 2. Envio para a API do Site (Via HTTP Seguro)
# ---------------------------------------------------------
def salvar_risco_no_banco(user_id, resultado_json):
    """
    Envia o JSON gerado para a API do Next.js via HTTP POST.
    """
    print(f"--- PROCESSANDO DADOS PARA USER {user_id} ---")
    
    api_url = os.environ.get("SITE_API_URL", "http://localhost:3000/api/risk/ingest")
    # Para produção, o usuário deve definir SITE_API_URL no .env do Oracle
    # Ex: https://finance-tracker-chi.vercel.app/api/risk/ingest
    
    api_secret = os.environ.get("CRON_SECRET", "monk_secret_123")
    
    payload = {
        "user_id": None, # API vai atribuir ao primeiro usuário se nulo
        "report": resultado_json
    }
    
    try:
        print(f"📡 Enviando para: {api_url}...")
        response = requests.post(
            api_url, 
            json=payload,
            headers={"x-api-key": api_secret},
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Sucesso! Relatório salvo no banco de dados.")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Erro na API: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Falha de Conexão: {e}")

    print("------------------------------------------")

# ---------------------------------------------------------
# 3. Lógica Principal
# ---------------------------------------------------------
def analisar_perfil(user_id):
    if not api_key:
        print("Pulei a análise pois não tem API Key.")
        return

    dados = buscar_transacoes_usuario(user_id)
    
    # O Prompt Estruturado
    prompt = f"""
    Atue como um analista de risco financeiro algorítmico.
    Analise os dados financeiros brutos deste usuário e gere duas matrizes de risco.
    
    DADOS DO USUÁRIO:
    {json.dumps(dados)}
    
    REGRAS DE SAÍDA:
    Retorne APENAS um JSON com esta estrutura exata:
    {{
      "matriz_liquidez": {{
        "nivel_risco": "Baixo|Médio|Alto",
        "probabilidade_insolvencia": 1-10,
        "impacto_orcamento": 1-10,
        "analise_curta": "string"
      }},
      "matriz_estrutural": {{
        "nivel_risco": "Baixo|Médio|Alto",
        "tendencia_patrimonial": "Crescente|Estavel|Decrescente",
        "resiliencia_meses": "int",
        "analise_curta": "string"
      }}
    }}
    """

    try:
        response = model.generate_content(prompt)
        resultado = json.loads(response.text)
        salvar_risco_no_banco(user_id, resultado)
    except Exception as e:
        print(f"Erro ao processar usuário {user_id}: {e}")

# Executa para um usuário de teste
if __name__ == "__main__":
    analisar_perfil(user_id=123)
