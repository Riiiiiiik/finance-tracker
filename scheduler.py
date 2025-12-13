import time
import os
import sys
from datetime import datetime, timedelta
import pytz

def run_bot():
    print("Running Bot...", flush=True)
    os.system("python3 daily_newsletter_bot.py")

def main():
    print("Starting Scheduler (Python)...", flush=True)
    try:
        tz = pytz.timezone("America/Sao_Paulo")
    except:
        print("Timezone error, using UTC", flush=True)
        tz = pytz.utc
        
    while True:
        now = datetime.now(tz)
        target = now.replace(hour=7, minute=30, second=0, microsecond=0)
        
        if target <= now:
            target += timedelta(days=1)
            
        wait_seconds = int((target - now).total_seconds())
        
        if wait_seconds < 60:
             target += timedelta(days=1)
             wait_seconds = int((target - now).total_seconds())

        print(f"Next execution in {wait_seconds} seconds ({wait_seconds/3600:.1f}h).", flush=True)
        time.sleep(wait_seconds)
        
        run_bot()
        time.sleep(60)

if __name__ == "__main__":
    main()
