# SAP Order-to-Cash AI Analytics Platform

An interactive, full-stack analytics platform for exploring SAP Order-to-Cash (O2C) process data through a conversational AI interface and an immersive 3D knowledge graph.

---

### 🌐 Live Demo
**[Click here to view the live application on Render](https://ordertocash-frontend.onrender.com/)**

---

---

## ✨ Features

- **3D Interactive Knowledge Graph** — Visualize the entire O2C document chain (Customers → Orders → Deliveries → Invoices → Journal Entries → Payments) in real-time 3D using WebGL.
- **AI-Powered Chat Interface** — Ask natural-language questions about the data (e.g. *"Which invoices are unpaid?"*, *"Trace order 740550"*) and get instant, data-backed answers.
- **Auto-Highlight & Zoom** — Querying a document ID in the chat automatically highlights and flies the camera to the corresponding node(s) in the 3D graph.
- **Node Detail Pop-ups** — Click any node in the graph to inspect its full metadata panel.
- **Live SQL Transparency** — The AI generates and executes SQL on the fly; the executed query is shown alongside the answer.

---

## 🏗️ Architecture

```
OrderToCash/
├── backend/          # FastAPI Python server
│   ├── main.py       # API routes: /graph, /query
│   ├── data.db       # SQLite database (SAP O2C dataset)
│   ├── load_data.py  # CSV → SQLite loader
│   ├── build_csvs.py # Dataset preprocessing
│   └── schema.txt    # Human-readable DB schema reference
│
└── frontend/         # React + Vite web app
    └── src/
        ├── App.jsx   # Main application (graph + chat UI)
        ├── App.css   # Component styles
        └── index.css # Global design system
```

---

## 🛠️ Tech Stack

| Layer     | Technology                                                                 |
|-----------|----------------------------------------------------------------------------|
| Frontend  | React 19, Vite 8, `react-force-graph-3d`, Three.js                        |
| Backend   | FastAPI, Python, SQLite                                                    |
| AI / LLM  | [Groq](https://groq.com) — `llama-3.1-8b-instant`                         |
| Styling   | Vanilla CSS (Corporate Architectural Glass light-mode design system)       |

---

## 🗄️ Database Schema

The SQLite database contains the following O2C document tables:

| Table             | Key Fields                                                      |
|-------------------|-----------------------------------------------------------------|
| `orders`          | `salesorder`, `soldtoparty`, `totalnetamount`, delivery/billing status |
| `order_items`     | `salesorder`, `material`, quantities                            |
| `deliveries`      | `deliverydocument`, `creationdate`, goods movement status       |
| `delivery_items`  | `deliverydocument`, `referencesddocument` (→ orders)            |
| `invoices`        | `billingdocument`, `totalnetamount`, `accountingdocument`       |
| `invoice_items`   | `billingdocument`, `referencesddocument` (→ deliveries), `material` |
| `journal_entries` | `accountingdocument`, `referencedocument` (→ invoices), amounts |
| `payments`        | `accountingdocument`, `invoicereference` (→ invoices)           |
| `customers`       | `businesspartner`, `businesspartnername`, `customer`            |

**Document Flow:** Customer → Sales Order → Delivery → Invoice → Journal Entry → Payment

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Groq API key](https://console.groq.com)

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install fastapi uvicorn groq python-dotenv
```

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Load the dataset into SQLite (only needed once):

```bash
python load_data.py
```

Start the API server:

```bash
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`.

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 API Endpoints

| Method | Endpoint | Description                                               |
|--------|----------|-----------------------------------------------------------|
| GET    | `/`      | Health check — returns `{"status": "running"}`            |
| GET    | `/graph` | Returns all graph nodes and links for the 3D visualization |
| POST   | `/query` | Accepts `{"question": "..."}`, returns AI answer + data + highlighted node IDs |

### Example `/query` Request

```json
POST /query
{
  "question": "Which customer has the most orders?"
}
```

### Example `/query` Response

```json
{
  "answer": "Customer Becker Berlin GmbH has the most orders with 4 total.",
  "sql": "SELECT c.businesspartnername, COUNT(DISTINCT o.salesorder) ...",
  "data": [...],
  "highlight_nodes": ["orders_740550", "customers_10100001"]
}
```

---

## 🧪 Testing

The backend includes several test scripts:

```bash
# Test the /graph endpoint
python test_graph.py

# Test the /query endpoint with sample questions
python test_queries.py

# Test document link integrity
python test_links.py

# Make a raw request to the API
python test_req.py
```

---

## 📁 Data Source

The dataset is based on a synthetic SAP Order-to-Cash process dataset (`sap-order-to-cash-dataset/`), covering a realistic set of business documents across the full procure-to-pay cycle.

---

## 📄 License

This project is for educational and demonstration purposes.
