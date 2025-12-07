import os
from dotenv import load_dotenv
load_dotenv()

import requests
import json
import random
from datetime import datetime
import pytz
import sqlite3
import feedparser
from newspaper import Article
import google.generativeai as genai

# Weekly Themed Feeds Schedule
WEEKLY_FEEDS = {
    0: {  # Segunda: Estratégia & Modelos Mentais
        "theme": "🧠 Estratégia & Modelos Mentais",
        "emoji": "♟️",
        # Busca textos que ensinam A PENSAR, não notícias.
        "keywords": "(strategy OR \"mental models\" OR \"game theory\" OR \"decision making\" OR stoicism) AND (guide OR essay OR analysis) -news -politics",
        "feeds": [
            "https://fs.blog/feed/",  # Farnam Street (A bíblia dos modelos mentais)
            "https://dailynous.com/feed/",
            "https://jamesclear.com/feed",
            "https://aeon.co/feed.rss" 
        ]
    },
    1: {  # Terça: Capital & Risco (Foco Financeiro/FIDC)
        "theme": "💰 Private Markets & Risco",
        "emoji": "📊",
        # Foco em dinheiro inteligente, não em "Bolsa subiu/desceu"
        "keywords": "(\"private credit\" OR \"hedge fund\" OR \"venture capital\" OR \"risk management\" OR distressed) AND (outlook OR thesis OR report) -crypto -nft",
        "feeds": [
            "https://www.institutionalinvestor.com/rss",
            "https://mergersandinquisitions.com/feed/",
            "https://clarke.substack.com/feed", # Exemplo de substack focado em macro
            "https://www.bridgewater.com/rss" # Ray Dalio Research
        ]
    },
    2: {  # Quarta: Fronteira Tecnológica (AI & Code)
        "theme": "🤖 AI & Hard Tech",
        "emoji": "⚡",
        "keywords": "(\"large language models\" OR \"generative ai\" OR \"agentic workflows\" OR automation OR \"software architecture\") -gadget -review -iphone",
        "feeds": [
            "https://stratechery.com/feed/", # Ben Thompson (Melhor analise tech)
            "https://simonwillison.net/atom/everything/",
            "https://news.ycombinator.com/rss", # Hacker News (precisa filtrar bem)
            "https://bair.berkeley.edu/blog/feed.xml" # Berkeley AI Research
        ]
    },
    3: {  # Quinta: Comportamento & Sociedade
        "theme": "👥 Engenharia Social & Comportamento",
        "emoji": "👁️",
        "keywords": "(\"behavioral economics\" OR \"social psychology\" OR sociology OR influence OR negotiation) AND (research OR study) -celebrity",
        "feeds": [
            "https://www.behavioraleconomics.com/feed/",
            "https://freakonomics.com/feed/",
            "https://conversableeconomist.blogspot.com/feeds/posts/default"
        ]
    },
    4: {  # Sexta: Biohacking & Longevidade (Substituindo Ciência Genérica)
        "theme": "🧬 Biohacking & Performance",
        "emoji": "🧬",
        # Otimização do corpo humano
        "keywords": "(longevity OR \"circadian rhythm\" OR neuroscience OR \"metabolic health\" OR biohacking) AND (research OR protocol) -diet -weightloss",
        "feeds": [
            "https://peterattiamd.com/feed/",
            "https://hubermanlab.com/feed",
            "https://www.nature.com/nature.rss"
        ]
    },
    5: {  # Sábado: Deep Dive & Cultura (Substituindo "Diversos")
        "theme": "🏛️ Cultura & Arquitetura",
        "emoji": "🏛️",
        "keywords": "(architecture OR \"design theory\" OR \"cinema history\" OR aesthetics OR brutalism) -gossip -hollywood",
        "feeds": [
            "https://99percentinvisible.org/feed/",
            "https://www.archdaily.com/feed/rss/",
            "https://thebaffler.com/feed"
        ]
    },
    6: {  # Domingo: O Grande Resumo (Ensaístico)
        "theme": "📜 Ensaios & Reflexões",
        "emoji": "☕",
        # Domingo é dia de ler texto longo e calmo
        "keywords": "(essay OR history OR philosophy OR literature) AND (review OR deep-dive)",
        "feeds": [
            "https://longreads.com/feed/", # Curadoria de textos longos
            "https://aldaily.com/feed", # Arts & Letters Daily
            "https://lithub.com/feed/"
        ]
    }
}

class DailyReporter:
    def __init__(self, gemini_api_key=None, perplexity_api_key=None):
        import sys
        if sys.platform == 'win32':
            try:
                sys.stdout.reconfigure(encoding='utf-8')
            except:
                pass
        
        self.tz_BR = pytz.timezone('America/Sao_Paulo')
        
        # MELHORIA 5: SQLite para histórico
        self.conn = sqlite3.connect('history.db')
        self.cursor = self.conn.cursor()
        self.cursor.execute('CREATE TABLE IF NOT EXISTS sent_articles (link TEXT PRIMARY KEY, date TEXT)')
        self.conn.commit()

        self.perplexity_api_key = perplexity_api_key
        if self.perplexity_api_key:
            print("✅ Perplexity API configurada!")
        else:
            print("⚠️ Perplexity API key não fornecida.")
        
        self.gemini_api_key = gemini_api_key
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            print("✅ Gemini API configurada!")
        else:
            print("⚠️ Gemini API key não fornecida.")

        # CONFIGURAÇÃO DO SITE MONK
        # Mude para a URL real do seu site em produção ou localhost para teste
        self.site_api_url = "https://theordermonk.netlify.app/api/news/ingest" 
        self.site_api_secret = "monk_secret_123"

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

    def generate_prompt(self, article, content):
        return f"""
Atue como o sistema central "The Order".
Analise esta notícia e gere uma saída JSON válida.

ARTIGO:
Título: {article['title']}
Fonte: {article['source']}
Conteúdo: {content[:4000]}

Saída deve ser EXATAMENTE neste formato JSON:
{{
  "summary": "Resumo executivo de alto nível em português (max 300 chars)",
  "content": "Análise detalhada do impacto estratégico, riscos e oportunidades. Use tom profissional e direto. (max 1000 chars)",
  "council_discussion": [
    {{
      "monk": "Monk.Vault",
      "role": "Guardião",
      "message": "Comentário focado em proteção de patrimônio, segurança e visão conservadora."
    }},
    {{
      "monk": "Monk.Sentry",
      "role": "Sentinela",
      "message": "Comentário focado em riscos detectados, ameaças ou oportunidades táticas."
    }},
    {{
      "monk": "Monk.AI",
      "role": "Oráculo",
      "message": "Análise de dados, projeção futura ou tendência lógica."
    }},
    {{
      "monk": "Monk.Pockets",
      "role": "Gerente",
      "message": "Visão pragmática sobre fluxo de caixa, gastos ou alocação de recursos."
    }}
  ]
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

    def generate_summary_perplexity(self, article, content):
        if not self.perplexity_api_key:
            return None
        
        # SEGURANÇA: Se o conteúdo for vazio ou muito curto, a Perplexity retorna erro 400.
        if not content or len(content) < 50:
            print("   ⚠️ Conteúdo muito curto para processar na IA.")
            return None

        prompt = self.generate_prompt(article, content)

        try:
            print(f"   🔮 Tentando Perplexity...")
            url = "https://api.perplexity.ai/chat/completions"
            
            payload = {
                # ATUALIZAÇÃO IMPORTANTE: Modelo novo e mais estável
                "model": "llama-3.1-sonar-large-128k-online", 
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
                # Reduzi um pouco os tokens para evitar estouro de limite
                "max_tokens": 900, 
                "temperature": 0.1,
                "top_p": 0.9,
                "return_citations": False,
                "return_images": False
            }
            
            headers = {
                "Authorization": f"Bearer {self.perplexity_api_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=60)
            
            # ISSO VAI TE SALVAR: Se der erro 400 de novo, ele vai imprimir a mensagem real da Perplexity
            if response.status_code != 200:
                print(f"   ❌ Detalhes do Erro da API: {response.text}")
                
            response.raise_for_status()
            result = response.json()
            
            if 'choices' in result and len(result['choices']) > 0:
                text_content = result['choices'][0]['message']['content']
                print(f"   ✅ Perplexity respondeu.")
                
                # LIMPEZA: Remove os acentos ```json que a IA às vezes coloca e quebra o código
                clean_text = text_content.replace("```json", "").replace("```", "").strip()
                
                return self.parse_ai_json(clean_text)
            return None
        except Exception as e:
            print(f"   ❌ Erro Perplexity: {e}")
            return None

    def generate_summary_gemini(self, article, content):
        if not self.gemini_api_key:
            return None
        
        prompt = self.generate_prompt(article, content) + "\n\nResponda APENAS o JSON."

        try:
            print(f"   🤖 Tentando Gemini...")
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            
            if response and response.text:
                print(f"   ✅ Gemini respondeu.")
                return self.parse_ai_json(response.text)
            return None
        except Exception as e:
            print(f"   ❌ Erro Gemini: {e}")
            return None

    def generate_summary(self, article, content):
        if not content:
            return None

        # Tenta Perplexity primeiro
        data = self.generate_summary_perplexity(article, content)
        if data: return data

        # Tenta Gemini
        data = self.generate_summary_gemini(article, content)
        if data: return data
        
        # Fallback se ambos falharem
        return {
            "summary": article.get('summary', '')[:200],
            "content": article.get('summary', '')[:500],
            "council_discussion": []
        }

    def fetch_from_rss(self, feeds_list):
        """Busca artigos em feeds RSS"""
        print(f"   📡 Buscando em feeds RSS...")
        articles = []
        for feed_url in feeds_list:
            try:
                print(f"      - {feed_url[:50]}...")
                feed = feedparser.parse(feed_url)
                for entry in feed.entries[:3]:  # 3 mais recentes de cada feed
                    articles.append({
                        "title": entry.title,
                        "link": entry.link,
                        "source": feed.feed.get('title', 'RSS'),
                        "summary": getattr(entry, 'summary', '')
                    })
            except Exception as e:
                print(f"      ⚠️ Erro no feed: {e}")
                continue
        return articles

    def collect_data(self):
        """Busca artigos apenas dos feeds RSS configurados"""
        today = datetime.now(self.tz_BR).weekday()
        cfg = WEEKLY_FEEDS[today]
        
        print(f"📅 Tema: {cfg['theme']}")
        
        # Busca apenas em RSS
        articles = self.fetch_from_rss(cfg["feeds"])
        
        # Filtra já enviados usando SQLite
        new = [a for a in articles if not self.url_already_sent(a["link"])]
        
        print(f"📊 Total: {len(articles)} | Novos: {len(new)}")
        
        if not new:
            return None, cfg
        
        return random.sample(new, min(2, len(new))), cfg
    
    def send_to_site(self, article, ai_data, theme):
        """Envia o artigo processado para o database do site"""
        try:
            print(f"   🌐 Enviando para o site Monk...")
            
            if not ai_data: return False

            payload = {
                "title": article['title'],
                "summary": ai_data.get('summary'),
                "content": ai_data.get('content'), 
                "council_discussion": ai_data.get('council_discussion', []),
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
        
        print(f"� Processando {len(articles)} artigos...")
        
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
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    perplexity_api_key = os.environ.get("PERPLEXITY_API_KEY")
    
    reporter = DailyReporter(gemini_api_key, perplexity_api_key)
    reporter.process_and_send()
