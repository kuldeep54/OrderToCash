import json
import sqlite3
import os
import glob

conn = sqlite3.connect("data.db")

BASE = "sap-order-to-cash-dataset/sap-o2c-data"

TABLES = {
    "sales_order_headers":                    "orders",
    "sales_order_items":                      "order_items",
    "outbound_delivery_headers":              "deliveries",
    "outbound_delivery_items":                "delivery_items",
    "billing_document_headers":               "invoices",
    "billing_document_items":                 "invoice_items",
    "journal_entry_items_accounts_receivable":"journal_entries",
    "payments_accounts_receivable":           "payments",
    "business_partners":                      "customers",
    "products":                               "products",
    "plants":                                 "plants",
    "billing_document_cancellations":         "invoice_cancellations",
    "business_partner_addresses":             "customer_addresses",
    "sales_order_schedule_lines":             "schedule_lines",
}

for folder, table_name in TABLES.items():
    folder_path = os.path.join(BASE, folder)
    if not os.path.exists(folder_path):
        print(f"SKIP: {folder} not found")
        continue

    files = glob.glob(os.path.join(folder_path, "*.jsonl"))
    if not files:
        print(f"SKIP: no files in {folder}")
        continue

    all_rows = []
    for file in files:
        with open(file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        all_rows.append(json.loads(line))
                    except:
                        pass

    if not all_rows:
        print(f"SKIP: no data in {folder}")
        continue

    all_keys = set()
    for row in all_rows:
        all_keys.update(row.keys())
    columns = list(all_keys)
    clean_cols = [c.lower().strip().replace(" ", "_").replace("-", "_")
                  for c in columns]

    col_defs = ", ".join([f'"{c}" TEXT' for c in clean_cols])
    conn.execute(f'DROP TABLE IF EXISTS "{table_name}"')
    conn.execute(f'CREATE TABLE "{table_name}" ({col_defs})')

    for row in all_rows:
        values = [str(row.get(k, "")) for k in columns]
        placeholders = ", ".join(["?" for _ in columns])
        col_str = ", ".join([f'"{c}"' for c in clean_cols])
        conn.execute(
            f'INSERT INTO "{table_name}" ({col_str}) VALUES ({placeholders})',
            values
        )

    conn.commit()
    print(f"Loaded {len(all_rows)} rows into '{table_name}'")

conn.close()

print("\nDone! Tables:")
c = sqlite3.connect("data.db")
for row in c.execute("SELECT name FROM sqlite_master WHERE type='table'"):
    count = c.execute(f'SELECT COUNT(*) FROM "{row[0]}"').fetchone()[0]
    print(f"  - {row[0]}: {count} rows")
c.close()
