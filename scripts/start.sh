#!/bin/bash
echo "Starting Scheduler..."

while true; do
  # Calcula quantos segundos faltam para as próximas 07:30 (Horário de SP)
  SECONDS_TO_WAIT=$(python3 -c "
from datetime import datetime, timedelta
import pytz
tz = pytz.timezone('America/Sao_Paulo')
now = datetime.now(tz)
target = now.replace(hour=7, minute=30, second=0, microsecond=0)
if target <= now:
    target += timedelta(days=1)
print(int((target - now).total_seconds()))
")

  echo "🕒 Próxima execução em ${SECONDS_TO_WAIT} segundos (aprox $(($SECONDS_TO_WAIT / 3600)) horas)..."
  
  # Dorme até o horário
  sleep $SECONDS_TO_WAIT
  
  echo "🚀 Iniciando Daily Newsletter Bot agora!"
  python3 scripts/daily_newsletter_bot.py
  
  echo "✅ Bot finalizado. Aguardando próximo ciclo..."
  # Pequena pausa de segurança para evitar loop imediato em caso de erro de cálculo
  sleep 60
done
