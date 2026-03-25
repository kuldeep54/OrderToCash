import sqlite3
import json

conn = sqlite3.connect('data.db')
print("COLUMNS:")
print([c[1] for c in conn.execute('PRAGMA table_info(journal_entries)').fetchall()])
print("\nFIRST ROW:")
r = conn.execute('SELECT * FROM journal_entries LIMIT 1').fetchone()
if r:
    print(list(r))
else:
    print("Table is empty.")
