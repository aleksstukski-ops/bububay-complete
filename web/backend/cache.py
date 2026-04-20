import sqlite3
import json
import time
from pathlib import Path

DB_PATH = Path(__file__).parent / "cache.db"

def init_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute('''CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at REAL NOT NULL
    )''')
    conn.commit()
    conn.close()

def get(key, max_age=60):
    conn = sqlite3.connect(str(DB_PATH))
    row = conn.execute("SELECT data, updated_at FROM cache WHERE key=?", (key,)).fetchone()
    conn.close()
    if row:
        data, ts = json.loads(row[0]), row[1]
        if time.time() - ts < max_age:
            return data
    return None

def set(key, data):
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("INSERT OR REPLACE INTO cache (key, data, updated_at) VALUES (?, ?, ?)",
                  (key, json.dumps(data), time.time()))
    conn.commit()
    conn.close()

def invalidate(key_pattern=None):
    conn = sqlite3.connect(str(DB_PATH))
    if key_pattern:
        conn.execute("DELETE FROM cache WHERE key LIKE ?", (key_pattern,))
    else:
        conn.execute("DELETE FROM cache")
    conn.commit()
    conn.close()
