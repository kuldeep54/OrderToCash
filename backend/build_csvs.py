import pandas as pd
import glob
import os

source_base = r"C:\Users\KULDEEP\Downloads\sap-order-to-cash-dataset\sap-o2c-data"
dest_dir = r"D:\FED\backend\data"
os.makedirs(dest_dir, exist_ok=True)

def convert(folder, dest_name, rename_map):
    files = glob.glob(os.path.join(source_base, folder, "*.jsonl"))
    if not files:
        print(f"Skipping {dest_name}, no files found in {folder}")
        return
    dfs = []
    for f in files:
        dfs.append(pd.read_json(f, lines=True))
    if dfs:
        df = pd.concat(dfs, ignore_index=True)
        df.rename(columns=rename_map, inplace=True)
        
        # Ensure 'id' exists
        if 'id' in df.columns:
            df.drop_duplicates(subset=['id'], keep='first', inplace=True)
            
        df.to_csv(os.path.join(dest_dir, dest_name), index=False)
        print(f"Created {dest_name} with {len(df)} rows")

print("Extracting and mapping SAP data...")
convert("sales_order_headers", "orders.csv", {"salesOrder": "id"})
convert("outbound_delivery_items", "deliveries.csv", {"deliveryDocument": "id", "referenceSdDocument": "order_id"})
convert("billing_document_items", "invoices.csv", {"billingDocument": "id", "referenceSdDocument": "order_id"})
convert("payments_accounts_receivable", "payments.csv", {"accountingDocument": "id", "invoiceReference": "invoice_id"})
convert("business_partners", "customers.csv", {"businessPartner": "id"})
