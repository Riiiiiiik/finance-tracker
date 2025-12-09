import os
import requests
import json
import random
from datetime import datetime
import pytz
import sqlite3
import feedparser
from newspaper import Article

# Weekly Themed Search Schedule
WEEKLY_THEMES = {
    0: {  # Segunda
        "theme": "🧠 Estratégia & Modelos Mentais",
        "emoji": "♟️",
        "search_query": "best new guides, essays or analysis about 'mental models', 'strategy', 'game theory' or 'stoicism' published in the last week. Exclude politics and generic news."
    },
    1: {  # Terça
        "theme": "💰 Private Markets & Risco",
        "emoji": "📊",
        "search_query": "deep analysis reports or thesis on 'private credit', 'hedge funds', 'venture capital' or 'distressed assets' published in the last week. Focus on financial risk manageent."
    },
    2: {  # Quarta
        "theme": "🤖 AI & Hard Tech",
        "emoji": "⚡",
        "search_query": "impactful technical articles or essays about 'large language models', 'agentic workflows', 'software architecture' or 'automation' published in the last 2 days."
    },
    3: {  # Quinta
        "theme": "👥 Engenharia Social & Comportamento",
        "emoji": "👁️",
        "search_query": "new research, studies or essays about 'behavioral economics', 'social psychology', 'influence' or 'negotiation' published recently."
    },
    4: {  # Sexta
        "theme": "🧬 Biohacking & Performance",
        "emoji": "🧬",
        "search_query": "scientific articles, protocols or deep dives about 'longevity', 'circadian rhythm', 'neuroscience' or 'metabolic health' published recently. Exclude generic diet/weightloss."
    },
    5: {  # Sábado
        "theme": "🏛️ Cultura & Arquitetura",
        "emoji": "🏛️",
        "search_query": "essays and theory articles about 'architecture', 'design theory', 'cinema history' or 'brutalism' published recently. Exclude gossip."
    },
    6: {  # Domingo
        "theme": "📜 Ensaios & Reflexões",
        "emoji": "☕",
        "search_query": "best long-form essays, reviews or deep-dives about 'history', 'philosophy' or 'literature' published this week."
    }
}

class DailyReporter:
    def __init__(self, perplexity_api_key=None):
        import sys
        if sys.platform == 'win32':
            try:
                sys.stdout.reconfigure(encoding='utf-8')
            except:
                pass
        
        self.tz_BR = pytz.timezone('America/Sao_Paulo')
        
        # MELHORIA 5: SQLite para histórico (PERSISTENTE NO VOLUME)
        # Salva no mesmo diretório do script para persistir no volume ./scripts
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'history.db')
        print(f"   💾 Database: {db_path}")
        
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self.cursor.execute('CREATE TABLE IF NOT EXISTS sent_articles (link TEXT PRIMARY KEY, date TEXT)')
        self.conn.commit()

        self.perplexity_api_key = perplexity_api_key
        if self.perplexity_api_key:
            print("✅ Perplexity API configurada!")
        else:
            print("⚠️ Perplexity API key não fornecida.")

        # CONFIGURAÇÃO DO SITE MONK
        # Mude para a URL real do seu site em produção ou localhost para teste
        self.site_api_url = os.environ.get("SITE_API_URL", "https://theordermonk.netlify.app/api/news/ingest")
        self.site_api_secret = os.environ.get("SITE_API_SECRET", "monk_secret_123")

    def url_already_sent(self, url):
        """MELHORIA 5: Verifica se URL já foi enviada usando SQLite"""
        self.cursor.execute('SELECT 1 FROM sent_articles WHERE link = ?', (url,))
        return self.cursor.fetchone() is not None

    def mark_as_sent(self, url):
        """MELHORIA 5: Marca URL como enviada no SQLite"""
        self.cursor.execute('INSERT OR IGNORE INTO sent_articles VALUES (?, ?)', (url, datetime.now().isoformat()))
        self.conn.commit()

    def get_current_time(self):
        return datetime.now(self.tz_BR).strftime('%d/%m/%Y %H:%M:%S')

    def fetch_article_data(self, url):
        """MELHORIA 2: Usa newspaper3k para extrair texto limpo e imagem"""
        try:
            article = Article(url)
            article.download()
            article.parse()
            return {
                "text": article.text[:3000],
                "image": article.top_image
            }
        except Exception as e:
            print(f"   ⚠️ Erro ao ler {url}: {e}")
            return None

    def get_random_monk(self):
        monks = [
            {"name": "Monk.Vault", "role": "Guardião", "persona": "Focado em proteção de patrimônio, segurança máxima, aversão a risco e visão conservadora. Cético."},
            {"name": "Monk.Sentry", "role": "Sentinela", "persona": "Focado em riscos sistêmicos, geopolítica, ameaças futuras e oportunidades táticas de curto prazo. Alerta."},
            {"name": "Monk.AI", "role": "Oráculo", "persona": "Analítico, baseado em dados, projeção de tendências tecnológicas, futurismo e lógica pura. Objetivo."},
            {"name": "Monk.Pockets", "role": "Gerente", "persona": "Pragmático, focado em fluxo de caixa, rentabilidade real, gastos e alocação eficiente de recursos. Capitalista."}
        ]
        return random.choice(monks)

    def generate_prompt(self, article, content, monk):
        return f"""
Atue como o sistema central "The Order".
Você deve analisar esta notícia e gerar uma entrada para a Newsletter da Ordem.

ARTIGO:
URL: {article['link']}
Título: {article['title']}
Fonte: {article['source']}
Contexto: {content[:3000]}

PERSONAGEM PARA DISCUSSÃO:
Nome: {monk['name']}
Função: {monk['role']}
Personalidade: {monk['persona']}

INSTRUÇÃO DE FORMATAÇÃO:
Gere um JSON com os seguintes campos. O texto deve ser RICO em Markdown.
IDIOMA: PORTUGUÊS (PT-BR). TUDO DEVE SER TRADUZIDO.

{{
  "summary": "3 itens curtos usando '• ' e QUEBRA DE LINHA entre eles. Exemplo: '\\n• Ponto 1\\n• Ponto 2'.",
  "content": "Análise aprofundada em Português (2 parágrafos). Ao final, INCLUA: '🔗 [Ler artigo completo]({article['link']})' no markdown.",
  "monk_commentary": {{
      "monk": "{monk['name']}",
      "role": "{monk['role']}",
      "message": "Comentário em Português, primeira pessoa (max 2 frases) reagindo aos dados com a personalidade descrita."
  }}
}}
"""

    def parse_ai_json(self, text):
        import re
        try:
            # Tenta encontrar bloco JSON
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                clean_text = match.group(0)
                return json.loads(clean_text)
            return json.loads(text)
        except Exception:
            print(f"   ⚠️ Falha ao parsear JSON da IA. Usando fallback.")
            return None

    def generate_summary_perplexity(self, article, content, monk):
        if not self.perplexity_api_key:
            return None
        
        # SEGURANÇA: Se o conteúdo for vazio, tentaremos via URL (Online Search)
        if not content or len(content) < 50:
            print("   ⚠️ Conteúdo curto. IA usará navegação online para ler o link.")
            # Não retornamos None aqui, deixamos prosseguir para o modelo Online ler a URL

        prompt = self.generate_prompt(article, content, monk)

        try:
            print(f"   🔮 Tentando Perplexity ({monk['name']})...")
            url = "https://api.perplexity.ai/chat/completions"
            
            payload = {
                # ATUALIZAÇÃO FINAL: Usando o modelo validado da lista oficial (2025)
                "model": "sonar-pro", 
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a specialized financial analyst bot. You output ONLY valid JSON. No markdown, no preambles."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 1200, 
                "temperature": 0.2,
                "top_p": 0.9,
                "return_citations": False,
                "return_images": False
            }
            
            headers = {
                "Authorization": f"Bearer {self.perplexity_api_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=60)
            
            if response.status_code != 200:
                print(f"   ❌ Detalhes do Erro da API: {response.text}")
                
            response.raise_for_status()
            result = response.json()
            
            if 'choices' in result and len(result['choices']) > 0:
                text_content = result['choices'][0]['message']['content']
                print(f"   ✅ Perplexity respondeu.")
                
                clean_text = text_content.replace("```json", "").replace("```", "").strip()
                
                return self.parse_ai_json(clean_text)
            return None
        except Exception as e:
            print(f"   ❌ Erro Perplexity: {e}")
            return None

    def generate_summary(self, article, content):
        if not content:
            return None

        # Escolhe um Monk aleatório para este artigo
        monk = self.get_random_monk()

        # Tenta Perplexity (Única IA)
        data = self.generate_summary_perplexity(article, content, monk)
        if data: return data
        
        # Fallback se ambos falharem
        return {
            "summary": article.get('summary', '')[:200],
            "content": article.get('summary', '')[:500],
            "council_discussion": []
        }

    def search_stories_with_perplexity(self, query):
        """Usa Perplexity para encontrar URLs relevantes"""
        if not self.perplexity_api_key:
            print("   ⚠️ Sem chave Perplexity para busca.")
            return []

        print(f"   🔍 Perplexity buscando: {query}")
        
        url = "https://api.perplexity.ai/chat/completions"
        
        prompt = f"""
        You are a research assistant. 
        Search for: "{query}"
        
        Return a valid JSON object with a list of the 4 most relevant and high-quality articles found.
        Format:
        {{
            "articles": [
                {{ "title": "Article Title", "url": "https://example.com/article" }},
                ...
            ]
        }}
        Do not include general homepages, only specific article URLs.
        Output ONLY the JSON.
        """

        payload = {
            "model": "sonar-pro", 
            "messages": [
                {"role": "system", "content": "You are a helpful research assistant. Output strictly JSON."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 500,
            "temperature": 0.1,
            "return_citations": True
        }
        
        headers = {
            "Authorization": f"Bearer {self.perplexity_api_key}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=60)
            
            if response.status_code != 200:
                 print(f"   ❌ Erro API Search: {response.status_code} - {response.text}")

            response.raise_for_status()
            result = response.json()
            
            if 'choices' in result and len(result['choices']) > 0:
                content = result['choices'][0]['message']['content']
                data = self.parse_ai_json(content.replace("```json", "").replace("```", ""))
                return data.get("articles", [])
        except Exception as e:
            print(f"   ❌ Erro na Busca Perplexity: {e}")
            return []
        
        return []

    def collect_data(self):
        """Coordena a busca de dados via Perplexity"""
        today = datetime.now(self.tz_BR).weekday()
        cfg = WEEKLY_THEMES[today]
        
        print(f"📅 Tema do Dia: {cfg['theme']}")
        
        # Busca URLs via IA
        found_articles = self.search_stories_with_perplexity(cfg["search_query"])
        
        # Filtra já enviados
        new_articles = []
        for a in found_articles:
            # Padroniza chaves para o formato esperado pelo resto do bot
            article_struct = {
                "title": a.get("title", "Sem titulo"),
                "link": a.get("url", ""),
                "source": "Perplexity Discovery",
                "summary": ""
            }
            if article_struct["link"] and not self.url_already_sent(article_struct["link"]):
                new_articles.append(article_struct)
        
        print(f"📊 Encontrados: {len(found_articles)} | Novos: {len(new_articles)}")
        
        if not new_articles:
            return None, cfg
            
        return new_articles[:3], cfg
    
    def send_to_site(self, article, ai_data, theme):
        """Envia o artigo processado para o database do site"""
        try:
            print(f"   🌐 Enviando para o site Monk...")
            
            if not ai_data: return False

            # Adaptação para o formato do site:
            # O site espera 'council_discussion' como lista. Vamos criar uma lista com 1 item.
            council_data = []
            if 'monk_commentary' in ai_data:
                council_data.append(ai_data['monk_commentary'])
            
            payload = {
                "title": article['title'],
                "summary": ai_data.get('summary'),
                "content": ai_data.get('content'), 
                "council_discussion": council_data,
                "theme": theme,
                "monk_author": "Monk.AI",
                "image_url": article.get('image_url')
            }
            
            response = requests.post(
                self.site_api_url, 
                json=payload, 
                headers={"x-api-key": self.site_api_secret},
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"   ✅ Site OK!")
                return True
            else:
                print(f"   ❌ Erro ao enviar para o site: {response.status_code} {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Exceção ao enviar para site: {e}")
            return False

    def process_and_send(self):
        print("🔄 Coletando dados...")
        result = self.collect_data()
        
        if not result or not result[0]:
            print("📭 Nenhum artigo novo.")
            return
        
        articles, cfg = result
        
        print(f"--- Processando {len(articles)} artigos...")
        
        for article in articles:
            print(f"\n--- Processando: {article['title']} ---")
            
            # 1. Fetch Data
            data = self.fetch_article_data(article["link"])
            content = data["text"] if data else article.get("summary", "")
            image_url = data["image"] if data else None
            article['image_url'] = image_url

            # 2. Generate with AI
            ai_data = self.generate_summary(article, content)
            
            # 3. Send to Site
            success = self.send_to_site(article, ai_data, cfg['theme'])
            
            # 4. Mark as Sent
            if success:
                self.mark_as_sent(article["link"])

if __name__ == "__main__":
    perplexity_api_key = os.environ.get("PERPLEXITY_API_KEY")
    # Tenta remover espaços em branco invisíveis se houver
    if perplexity_api_key: perplexity_api_key = perplexity_api_key.strip()
    
    reporter = DailyReporter(perplexity_api_key)
    reporter.process_and_send()
