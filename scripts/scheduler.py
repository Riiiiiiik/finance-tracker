import time
import os
import sys
from datetime import datetime, timedelta
import pytz

# File to track the last successful run date
LAST_RUN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'last_run.txt')

def get_now_br():
    try:
        return datetime.now(pytz.timezone("America/Sao_Paulo"))
    except:
        print("Timezone error, using UTC", flush=True)
        return datetime.now(pytz.utc)

def load_last_run_date():
    if os.path.exists(LAST_RUN_FILE):
        try:
            with open(LAST_RUN_FILE, 'r') as f:
                return f.read().strip()
        except:
            return None
    return None

def save_last_run_date(date_str):
    try:
        with open(LAST_RUN_FILE, 'w') as f:
            f.write(date_str)
        print(f"   [Scheduler] Last run date saved: {date_str}", flush=True)
    except Exception as e:
        print(f"   [Scheduler] Error saving last run date: {e}", flush=True)

def run_bot():
    print("\n--- [Scheduler] Triggering Daily Bot ---", flush=True)
    
    # 1. Run Newsletter Bot
    exit_code_news = os.system("python3 scripts/daily_newsletter_bot.py")
    
    # 2. Run Risk Analysis (Sequential to save RAM)
    print("\n--- [Scheduler] Triggering Risk Analysis ---", flush=True)
    exit_code_risk = os.system("python3 scripts/analise_risco.py")

    if exit_code_news == 0:
        print("--- [Scheduler] Bot finished successfully ---", flush=True)
        # Only save date if successful
        now_str = get_now_br().strftime('%Y-%m-%d')
        save_last_run_date(now_str)
    else:
        print(f"--- [Scheduler] Bot failed with code {exit_code_news} ---", flush=True)

def main():
    print("Starting Smart Scheduler (Python)...", flush=True)
    print(f"Persistence file: {LAST_RUN_FILE}", flush=True)
    
    # 1. Startup Check: Did we run today?
    now = get_now_br()
    today_str = now.strftime('%Y-%m-%d')
    last_run = load_last_run_date()

    print(f"Today: {today_str} | Last Run: {last_run}", flush=True)

    if last_run != today_str:
        print(">>> Missed today's run (or first run). Running IMMEDIATELY...", flush=True)
        run_bot()
    else:
        print(">>> Already ran today. Waiting for tomorrow.", flush=True)

    # 2. Daily Loop
    while True:
        now = get_now_br()
        
        # Schedule for 07:30 AM
        target = now.replace(hour=7, minute=30, second=0, microsecond=0)
        
        # If target passed today, move to tomorrow
        if target <= now:
            target += timedelta(days=1)
            
        wait_seconds = int((target - now).total_seconds())
        
        # Safety for tiny waits
        if wait_seconds < 60:
             target += timedelta(days=1)
             wait_seconds = int((target - now).total_seconds())

        print(f"\n[Scheduler] Sleeping. Next execution in {wait_seconds} seconds ({wait_seconds/3600:.1f}h) at {target}", flush=True)
        time.sleep(wait_seconds)
        
        # Wake up!
        print("[Scheduler] Waking up for scheduled run...", flush=True)
        
        # Verify again just to be safe (redundant but good)
        now_check = get_now_br().strftime('%Y-%m-%d')
        last_run_check = load_last_run_date()
        
        if last_run_check != now_check:
            run_bot()
        else:
            print("[Scheduler] Weird, woke up but already marked as done. Skipping.", flush=True)
        
        # Sleep a bit to avoid double tapping if logic fails slightly
        time.sleep(60)

if __name__ == "__main__":
    main()
