# 🧬 BioForgeBharat

**AI-Powered Reaction Engineering & Sustainable Catalyst Discovery**

BioForgeBharat is a next-generation platform designed to accelerate the discovery of catalysts and enzymes for sustainable chemical processes. By integrating Large Language Models (LLMs) with traditional Machine Learning and Cheminformatics, BioForgeBharat provides researchers with a powerful suite of tools to design, simulate, and optimize novel chemical reactions.

---

## 🚀 Key Features

### 1. **AI-Driven Candidate Generation**
*   **Novel Designs**: Leverage Google Gemini to generate completely new catalyst and enzyme candidates for specific reactions like Ethanol-to-Jet fuel or CO₂ reduction.
*   **Evidence-Based**: AI provides mechanism text and evidence-based reasoning for each generated candidate.

### 2. **Automated Literature Search**
*   **External Integration**: Seamlessly search **PubChem** and **ChEMBL** to import known literature candidates directly into your project.
*   **Metadata Extraction**: Automatically extracts chemical formulas, SMILES, molecular weight, and physicochemical properties.

### 3. **Real-Time ML Forecasting**
*   **Predictive Analytics**: Uses a Ridge Regression model to forecast activity, selectivity, and stability for any catalyst configuration.
*   **Edge Inference**: ML weights are exported from Python and run directly in the Node.js backend for ultra-fast predictions.

### 4. **Experimental Feedback Loop**
*   **Result Logging**: Log actual experimental outcomes and compare them against AI predictions.
*   **Discrepancy Analysis**: AI-generated hypotheses explain why an experiment differed from the model's prediction.
*   **Active Learning**: Trigger model retraining based on new experimental data to improve future accuracy.

### 5. **Cheminformatics & Visualization**
*   **Reaction Path Mapping**: Visualize energy profiles and reaction pathways.
*   **Interactive Dashboards**: Real-time stats on reaction counts, candidate distribution, and prediction accuracy.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL, Drizzle ORM |
| **AI/LLM** | Google Gemini API |
| **Machine Learning** | Scikit-learn (Ridge Regression), Pandas, Numpy |
| **Package Management** | pnpm workspaces |

---

## 📂 Project Structure

```text
BioForgeBharat/
├── artifacts/
│   ├── api-server/        # Express backend
│   ├── catalyst-ai/       # Vite/React frontend
│   └── ...                # Mockups and pitch decks
├── lib/
│   ├── db/                # Drizzle schema and migrations
│   ├── api-spec/          # OpenAPI/Swagger definition
│   └── api-zod/           # Auto-generated Zod schemas
├── ml_pipeline/           # Python training scripts and datasets
├── train_ml.py            # Main ML training and weight export script
└── package.json           # Root workspace configuration
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js (v20+)
- pnpm (v10+)
- PostgreSQL (running locally or on a cloud provider)

### 1. Clone the Repository
```bash
git clone https://github.com/Mish-atul/BioForgeBharat-.git
cd BioForgeBharat-
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Database Setup
Create a PostgreSQL database and set the connection string:
```bash
# Set your DATABASE_URL environment variable
export DATABASE_URL=postgres://user:password@localhost:5432/bioforgebharat

# Push the schema and seed the database
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run seed
```

### 4. Environment Variables
Create a `.env` file in the root or set these in your terminal:
```bash
PORT=8080
DATABASE_URL=postgres://localhost/bioforgebharat
GEMINI_API_KEY=your_gemini_api_key_here  # Optional: falls back to synthetic data
VITE_API_BASE_URL=http://localhost:8080
```

### 5. Run the Application
Start both the API and Frontend:
```bash
# Start API (Port 8080)
pnpm --filter @workspace/api-server run dev

# Start Frontend (in a new terminal)
pnpm --filter @workspace/catalyst-ai run dev
```

---

## 🚢 Deployment

The project is optimized for split deployment:
- **API**: Render Web Service
- **Database**: Render PostgreSQL
- **Frontend**: Vercel or Netlify (Static build)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production instructions.

---

## 📜 License
This project is licensed under the MIT License.
