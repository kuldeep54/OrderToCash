import pandas as pd
import glob
import sys
with open('schema.txt', 'w') as f:
    f.write('ORDERS:\n' + str(pd.read_json(glob.glob(r'C:\Users\KULDEEP\Downloads\sap-order-to-cash-dataset\sap-o2c-data\sales_order_headers\*.jsonl')[0], lines=True).columns.tolist()) + '\n')
    f.write('DELIVERIES_ITEMS:\n' + str(pd.read_json(glob.glob(r'C:\Users\KULDEEP\Downloads\sap-order-to-cash-dataset\sap-o2c-data\outbound_delivery_items\*.jsonl')[0], lines=True).columns.tolist()) + '\n')
    f.write('INVOICES_ITEMS:\n' + str(pd.read_json(glob.glob(r'C:\Users\KULDEEP\Downloads\sap-order-to-cash-dataset\sap-o2c-data\billing_document_items\*.jsonl')[0], lines=True).columns.tolist()) + '\n')
    f.write('PAYMENTS:\n' + str(pd.read_json(glob.glob(r'C:\Users\KULDEEP\Downloads\sap-order-to-cash-dataset\sap-o2c-data\payments_accounts_receivable\*.jsonl')[0], lines=True).columns.tolist()) + '\n')
    f.write('CUSTOMERS:\n' + str(pd.read_json(glob.glob(r'C:\Users\KULDEEP\Downloads\sap-order-to-cash-dataset\sap-o2c-data\business_partners\*.jsonl')[0], lines=True).columns.tolist()) + '\n')
