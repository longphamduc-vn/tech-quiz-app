import sqlite3

conn = sqlite3.connect('data/app.db')
cursor = conn.cursor()

cursor.execute("SELECT id, content FROM questions LIMIT 20")
rows = cursor.fetchall()
for q_id, content in rows:
    print(f"Q#{q_id}: {content[:100]}...")
