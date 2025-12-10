import os
import json
import sqlite3
import google.generativeai as genai
from datetime import datetime

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
    model = genai.GenerativeModel('gemini-1.5-flash',
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

def salvar_risco_no_banco(user_id, resultado_json):
    """
    Aqui você faria o UPDATE ou INSERT no seu banco real.
    """
    print(f"--- SALVANDO NO DB PARA USER {user_id} ---")
    print(f"Matriz Liquidez: {resultado_json.get('matriz_liquidez', {}).get('nivel_risco')}")
    print(f"Matriz Estrutural: {resultado_json.get('matriz_estrutural', {}).get('nivel_risco')}")
    print("JSON Completo:", json.dumps(resultado_json, indent=2))
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
