import urllib.request
import json

url = "http://127.0.0.1:8000/graph"
try:
    print("Fetching graph data from the backend...")
    response = urllib.request.urlopen(url)
    data = json.loads(response.read().decode('utf-8'))
    
    nodes = data.get("nodes", [])
    journal_nodes = [n for n in nodes if n.get("type", "").lower() == "journal"]
    
    if journal_nodes:
        print(f"Found {len(journal_nodes)} Journal nodes!")
        print("\nHere is the metadata for the first Journal Entry node:")
        print(json.dumps(journal_nodes[0].get("data"), indent=2))
    else:
        print("No journal nodes were returned in the graph.")
        
except Exception as e:
    print(f"Error fetching data: {e}")
