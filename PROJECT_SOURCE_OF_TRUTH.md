# 🧬 BioForgeBharat — Project Source of Truth

> **Built by:** NammaNexus | **Hackathon:** AI for Bharat  
> **Domains Covered:** Chemical Catalysis (Direction 1), Synthetic Biology (Direction 2), Closed-loop Feedback Workflow  
> **License:** MIT | **Repo:** `github.com/Mish-atul/BioForgeBharat-`

---

## 1. Executive Summary

BioForgeBharat is an **agentic AI-powered molecular discovery platform** that accelerates catalyst and enzyme discovery for sustainable chemical processes. It integrates a multi-tier AI pipeline (ML Virtual Screening → Gemini LLM → Curated Expert Pool) with cheminformatics lookups (PubChem, ChEMBL), an experimental feedback loop, and active learning retraining — all wrapped in a modern dark-mode React dashboard.

**Primary use case seeded in the demo:** GPS Renewables' ethanol-to-jet fuel scenario.

---

## 2. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Package Manager** | pnpm workspaces | 10.24.0 |
| **Node.js** | Node.js | 24 |
| **Language** | TypeScript | ~5.9.2 |
| **Backend Framework** | Express | ^5 |
| **Database** | PostgreSQL + Drizzle ORM | drizzle-orm ^0.45.2 |
| **Validation** | Zod (`zod/v4`) + drizzle-zod | ^3.25.76 |
| **API Codegen** | Orval (from OpenAPI spec) | — |
| **Build Tool (API)** | esbuild | 0.27.3 |
| **Frontend Framework** | React + Vite | React 19.1.0, Vite ^7.3.2 |
| **Styling** | Tailwind CSS v4 + Shadcn UI | ^4.1.14 |
| **Charts** | Recharts | ^2.15.2 |
| **Animation** | Framer Motion | ^12.23.24 |
| **Routing (FE)** | Wouter | ^3.3.5 |
| **Data Fetching** | TanStack React Query | ^5.90.21 |
| **AI / LLM** | Google Gemini REST API | gemini-2.5-flash (primary) |
| **ML** | Scikit-learn Ridge Regression (Python) | — |
| **Logging** | Pino + pino-http | ^9 / ^10 |
| **HTTP Client (BE)** | Native `fetch` with AbortController | — |

---

## 3. Monorepo Architecture

```
BioForgeBharat-/
├── artifacts/
│   ├── api-server/          # @workspace/api-server  — Express 5 backend (port 8080)
│   ├── catalyst-ai/         # @workspace/catalyst-ai — React/Vite frontend (port 22573)
│   ├── mockup-sandbox/      # UI prototype / sandbox
│   └── pitch-deck/          # Hackathon pitch deck app
├── lib/
│   ├── db/                  # @workspace/db           — Drizzle ORM schema + pg client
│   ├── api-spec/            # @workspace/api-spec     — OpenAPI spec + Orval config
│   ├── api-zod/             # @workspace/api-zod      — Generated Zod schemas
│   ├── api-client-react/    # @workspace/api-client-react — Generated React Query hooks
│   └── integrations/
│       └── anthropic_ai_integrations/
├── ml_pipeline/
│   └── catalyst_dataset.csv # 2,000-record synthetic training dataset
├── scripts/                 # Utility scripts
├── train_ml.py              # Python: generates dataset + trains + exports weights to JSON
├── pnpm-workspace.yaml      # Workspace + catalog + security config
├── render.yaml              # Render IaC deployment config
├── vercel.json              # Vercel routing config (frontend)
├── tsconfig.base.json       # Shared TS base config
└── package.json             # Root: typecheck + build scripts
```

### Workspace Packages

| Package Name | Path | Role |
|---|---|---|
| `@workspace/api-server` | `artifacts/api-server` | Express 5 REST API |
| `@workspace/catalyst-ai` | `artifacts/catalyst-ai` | React/Vite SPA |
| `@workspace/db` | `lib/db` | Drizzle schema + PostgreSQL client |
| `@workspace/api-spec` | `lib/api-spec` | OpenAPI spec + Orval codegen |
| `@workspace/api-zod` | `lib/api-zod` | Generated Zod validators |
| `@workspace/api-client-react` | `lib/api-client-react` | Generated React Query hooks |

---

## 4. Database Schema

All tables use **PostgreSQL** managed via **Drizzle ORM** with timezone-aware timestamps.

### 4.1 `reactions`

| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | Auto-increment |
| `name` | `text` NOT NULL | e.g. "Ethanol-to-Jet Fuel Conversion" |
| `type` | `text` NOT NULL | Reaction type string |
| `equation` | `text` NOT NULL | Chemical/biological equation |
| `target_product` | `text` NOT NULL | e.g. "Jet Fuel" |
| `conditions` | `text` NOT NULL | Temperature, pressure, solvent |
| `description` | `text` NOT NULL | Long-form description |
| `domain` | `text` NOT NULL | `"chemical-catalysis"` or `"synthetic-biology"` |
| `created_at` / `updated_at` | `timestamptz` | Auto-managed |

### 4.2 `candidates`

| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | — |
| `reaction_id` | `integer` FK → `reactions.id` | CASCADE delete |
| `name` | `text` NOT NULL | Catalyst/enzyme name |
| `formula` | `text` NOT NULL | Chemical formula |
| `source` | `text` NOT NULL | `"ai"`, `"literature"`, `"ml"` |
| `source_db` | `text` | `"PubChem"`, `"ChEMBL"`, or null |
| `candidate_type` | `text` | `"heterogeneous-catalyst"`, `"microbial-pathway"`, etc. |
| `route_type` | `text` | `"chemical-catalysis"` or `"synthetic-biology"` |
| `predicted_activity` | `real` NOT NULL | 0–1 score |
| `predicted_selectivity` | `real` NOT NULL | 0–1 score |
| `predicted_stability` | `real` NOT NULL | 0–1 score |
| `confidence_score` | `real` NOT NULL | 0–1 overall confidence |
| `feedstock_fit_score` | `real` | 0–1 |
| `cost_score` | `real` | 0–1 |
| `sustainability_score` | `real` | 0–1 |
| `scalability_score` | `real` | 0–1 |
| `uncertainty_score` | `real` | 0–1 (lower = more certain) |
| `mechanism_text` | `text` NOT NULL | Mechanistic explanation |
| `structure_data` | `text` NOT NULL | JSON: graph nodes/edges |
| `evidence_text` | `text` | Supporting evidence |
| `energy_profile_data` | `text` | JSON: reaction energy steps (catalysis) |
| `pathway_data` | `text` | JSON: metabolic pathway nodes/edits (bio) |
| `rank` | `integer` | Ranking within reaction |
| `pubchem_cid` | `integer` | From PubChem lookup |
| `chembl_id` | `text` | From ChEMBL lookup |
| `molecular_weight` | `real` | g/mol |
| `log_p` | `real` | Lipophilicity |
| `tpsa` | `real` | Topological polar surface area |
| `canonical_smiles` | `text` | Canonical SMILES string |
| `iupac_name` | `text` | IUPAC name |
| `created_at` / `updated_at` | `timestamptz` | Auto-managed |

### 4.3 `experiments`

| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | — |
| `candidate_id` | `integer` FK → `candidates.id` | CASCADE delete |
| `measured_activity` | `real` NOT NULL | 0–1 |
| `measured_selectivity` | `real` NOT NULL | 0–1 |
| `measured_yield` | `real` NOT NULL | 0–1 |
| `researcher_name` | `text` NOT NULL | — |
| `notes` | `text` | Optional lab notes |
| `status` | `text` NOT NULL | Default: `"completed"` |
| `discrepancy_hypothesis` | `text` | AI-generated hypothesis |
| `created_at` / `updated_at` | `timestamptz` | Auto-managed |

### 4.4 `annotations`

| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | — |
| `experiment_id` | `integer` FK → `experiments.id` | CASCADE delete |
| `author` | `text` NOT NULL | — |
| `content` | `text` NOT NULL | Markdown note content |
| `created_at` | `timestamptz` | Auto-managed |

### 4.5 `retraining_runs`

| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | — |
| `triggered_by` | `text` NOT NULL | Researcher name |
| `status` | `text` NOT NULL | Default: `"pending"` |
| `accuracy_before` | `real` | Pre-retrain accuracy |
| `accuracy_after` | `real` | Post-retrain accuracy |
| `data_points_used` | `integer` | # experiments used |
| `notes` | `text` | Optional notes |
| `completed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Auto-managed |

---

## 5. API Reference

**Base prefix:** `/api`  
**Port:** `8080`  
**Health check:** `GET /api/healthz`

### 5.1 Dashboard

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Overview metrics, top candidates, recent activity |

### 5.2 Reactions

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/reactions` | List all reactions |
| `POST` | `/api/reactions` | Create a new reaction |
| `GET` | `/api/reactions/:id` | Get reaction detail |
| `DELETE` | `/api/reactions/:id` | Delete reaction (cascades to candidates + experiments) |
| `GET` | `/api/reactions/:id/candidates` | List all candidates for a reaction |
| `POST` | `/api/reactions/:id/generate-candidates` | AI-generate candidates (ML → Gemini → Expert pool) |
| `POST` | `/api/reactions/:id/search-candidates?query=...` | Search PubChem + ChEMBL, persist as `source="literature"` |

### 5.3 Candidates

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/candidates/:id` | Get candidate with its experiments |

### 5.4 Experiments

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/experiments` | List all experiments (joined with candidate + reaction data) |
| `POST` | `/api/experiments` | Log a new experiment |
| `GET` | `/api/experiments/:id` | Get experiment detail |
| `POST` | `/api/experiments/:id/analyze-discrepancy` | AI discrepancy analysis via Gemini |

### 5.5 Annotations

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/annotations` | List all annotations (searchable) |
| `POST` | `/api/annotations` | Create annotation |

### 5.6 Retraining

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/retraining-runs` | List all retraining runs |
| `POST` | `/api/retraining-runs` | Trigger a new retraining run |

### 5.7 Export

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/export/session` | Export full session as JSON |
| `GET` | `/api/export/candidates` | Export candidates as CSV |

---

## 6. AI & ML Pipeline

### 6.1 Candidate Generation — Three-Tier Fallback

When `POST /api/reactions/:id/generate-candidates` is called, the backend uses this priority chain:

```
Tier 1 (Primary):   Ridge Regression ML Virtual Screening
        ↓ (fails or empty)
Tier 2 (Secondary): Google Gemini LLM (gemini-2.5-flash)
        ↓ (API unavailable or key missing)
Tier 3 (Fallback):  Curated Expert Candidate Pool (25 catalysts + 25 bio-routes)
```

**Tier 1 — ML Virtual Screening (`ml_model.ts`)**

- Performs virtual high-throughput screening across **all** metal × support × reaction type × condition combinations
- Feature vector: one-hot encoded `Reaction` (5 types) + `Metal` (12) + `Support` (9) + `Temperature` + `Pressure` = 28 features
- Predicts `activity` and `selectivity` scores using embedded Ridge Regression weights
- Sorts by combined `(activity + selectivity)` score, enforces metal diversity, selects top-N
- Adds time-based jitter for uniqueness across calls
- Metals covered: Ag, Au, Co, Cu, Fe, In, Ni, Pd, Pt, Rh, Ru, Sn
- Supports covered: Al₂O₃, BEA, C, CeO₂, HZSM-5, MgO, SAPO-34, SiO₂, TiO₂

**Tier 2 — Gemini LLM (`ai.ts`)**

- Uses a waterfall of Gemini model aliases (stops at first success):
  1. `gemini-flash-latest`
  2. `gemini-2.5-flash`
  3. `gemini-2.0-flash`
  4. `gemini-flash-lite-latest`
- 60-second request timeout with `AbortController`
- Returns `null` if `GEMINI_API_KEY` is not set (graceful degradation)
- Temperature: 0.7, topP: 0.95, maxOutputTokens: 4096

**Tier 3 — Expert Pool (`discovery-ai.ts`)**

- 25 curated chemical catalysts (e.g., "Ni-La/HZSM-5", "Cu₃Sn Intermetallic CO₂RR")
- 25 curated synthetic biology routes (e.g., "S. cerevisiae PDC1↑ ADH2Δ", "C. ljungdahlii Syngas-Ethanol")
- Seeded random shuffle based on `Date.now() ^ (reaction.id * 7919)` — deterministic for same inputs
- All candidates normalized through `normalizeCandidate()` with domain-aware fallback data

### 6.2 Discrepancy Analysis (`discovery-ai.ts` — `generateDiscrepancyHypothesis`)

- Triggered by `POST /api/experiments/:id/analyze-discrepancy`
- Sends predicted vs. measured metrics to Gemini with a structured critique prompt
- Gemini returns: probable cause + underweighted feature + recommended next experiment (3 sentences)
- Falls back to a deterministic template if Gemini is unavailable

### 6.3 ML Training Pipeline (`train_ml.py`)

```
Input:  Synthetic dataset (2,000 records) — ml_pipeline/catalyst_dataset.csv
Model:  Ridge Regression (alpha=1.0), sklearn
        → Activity model
        → Selectivity model
Output: artifacts/api-server/src/lib/ml_weights.json
        (intercepts + coefficients for both models, feature names, category lists)
```

The JSON weights are embedded directly in `ml_model.ts` as TypeScript constants (no JSON import needed) for bundler compatibility.

**Training features:**
- Categorical (one-hot): `Reaction`, `Metal`, `Support`
- Numerical: `Temperature` (150–800°C), `Pressure` (1–100 bar)

**Heuristics baked into training data:**
- Ni/Co + HZSM-5/BEA → higher activity for ethanol-to-jet
- Cu/In/Ag → higher activity for CO₂ reduction
- Optimal temperature window: 300–500°C (+0.1 activity bonus)
- High temperature >700°C → activity penalty

### 6.4 Cheminformatics (`cheminformatics.ts`)

Triggered when `search-candidates` is called or on AI-generated candidate enrichment.

**Lookup priority:**
1. **PubChem by name** → `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{name}/property/.../JSON`
2. **PubChem by formula** → `fastformula` endpoint if name lookup fails
3. **ChEMBL by name** → `https://www.ebi.ac.uk/chembl/api/data/molecule/search.json?q={name}`

**Fields populated:** `pubchemCid`, `molecularWeight`, `logP` (XLogP), `tpsa`, `canonicalSmiles`, `iupacName`, `chemblId`, `sourceDb`

All lookups are non-throwing — errors are logged with Pino and `null` is returned.  
Request timeout: **15 seconds** with `AbortController`.

---

## 7. Frontend Application

### 7.1 Routing (Wouter)

| Route | Page Component | Description |
|---|---|---|
| `/` | `landing.tsx` | Landing/home page |
| `/dashboard` | `dashboard.tsx` | Stats, top candidates, recent activity |
| `/reactions` | `reactions.tsx` | Reactions library |
| `/reactions/:id` | `reaction-detail.tsx` | Reaction detail + AI candidate generation + literature search |
| `/candidates/:id` | `candidate-detail.tsx` | Candidate detail: molecular SVG, radar chart, scores |
| `/experiments` | `experiments.tsx` | Experiments log |
| `/experiments/new` | `experiment-form.tsx` | Log new experiment form |
| `/experiments/:id` | `experiment-detail.tsx` | Experiment detail + AI discrepancy analysis |
| `/annotations` | `annotations.tsx` | Searchable research annotations |
| `/retraining` | `retraining.tsx` | Model retraining history + trigger new run |
| `/pathway` | `pathway.tsx` | Reaction path mapping + energy profile visualization |

### 7.2 Architecture Decisions

- **Dark mode by default** — `.dark` class applied to root layout element
- **All API calls** go through `@workspace/api-client-react` generated React Query hooks — never raw `fetch`
- **Base URL**: `VITE_API_BASE_URL` env var (defaults to `http://localhost:8080`)
- **React Query** provides caching, loading/error states, and auto-refetching
- **Wouter** used instead of React Router for smaller bundle size
- **Shadcn UI** + Radix UI primitives for accessible, unstyled component base
- `BASE_PATH` env var controls Vite `base` for subdirectory deployments

### 7.3 Key Frontend Dependencies

| Library | Purpose |
|---|---|
| `recharts` | Dashboard charts, radar charts |
| `framer-motion` | Page + card animations |
| `react-hook-form` + `@hookform/resolvers` | Form validation with Zod |
| `lucide-react` | Icon system |
| `wouter` | Client-side routing |
| `next-themes` | Theme toggling |
| `react-icons` | Additional icon sets |
| `date-fns` | Date formatting |
| `cmdk` | Command palette |

---

## 8. Seed Data

Pre-seeded via `pnpm --filter @workspace/api-server run seed` (`artifacts/api-server/src/seed.ts`):

| Entity | Count | Details |
|---|---|---|
| **Reactions** | 3 | Ethanol-to-Jet Fuel, CO₂ Hydrogenation, Biomass Fermentation |
| **Candidates** | 6 | HZSM-5, Ni/HZSM-5, Cu-ZnO/SAPO-34, WO₃/Al₂O₃, Cu/ZnO, S. cerevisiae |
| **Experiments** | 6 | Measured results for all 6 candidates |
| **Annotations** | 5 | Researcher notes linked to experiments |
| **Retraining Runs** | 1 | Historical retrain record |

---

## 9. Environment Variables

| Variable | Service | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | API Server | ✅ Yes | PostgreSQL connection string |
| `GEMINI_API_KEY` | API Server | ⚠️ Optional | Falls back to deterministic outputs if absent |
| `PORT` | API Server | ⚠️ Optional | Default: `8080` |
| `NODE_ENV` | API Server | ⚠️ Optional | `production` enables optimizations |
| `VITE_API_BASE_URL` | Frontend | ✅ Yes (prod) | Backend API URL for frontend |
| `BASE_PATH` | Frontend | ⚠️ Optional | Vite base path, default `/` |
| `GEMINI_MODEL` | API Server | ⚠️ Optional | Override default model chain |

> ⚠️ **Never expose `GEMINI_API_KEY` in Vercel/frontend env vars.** It belongs only on the backend service.

---

## 10. Local Development Setup

### Prerequisites

- Node.js v20+ (v24 recommended)
- pnpm v10+
- PostgreSQL (local or cloud)
- Python 3.8+ with scikit-learn, pandas, numpy (optional — only to retrain ML model)

### Steps

```bash
# 1. Clone
git clone https://github.com/Mish-atul/BioForgeBharat-.git
cd BioForgeBharat-

# 2. Install dependencies
pnpm install

# 3. Set environment variables
export DATABASE_URL=postgres://user:password@localhost:5432/bioforgebharat
export GEMINI_API_KEY=your_key_here   # optional
export VITE_API_BASE_URL=http://localhost:8080

# 4. Push DB schema
pnpm --filter @workspace/db run push

# 5. Seed the database
pnpm --filter @workspace/api-server run seed

# 6a. Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# 6b. Start frontend (port 22573) — new terminal
pnpm --filter @workspace/catalyst-ai run dev
```

### Key Development Commands

| Command | Description |
|---|---|
| `pnpm run typecheck` | Full typecheck across all workspace packages |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks + Zod schemas from OpenAPI |
| `pnpm --filter @workspace/db run push` | Push schema changes to DB (dev only) |
| `pnpm --filter @workspace/api-server run seed` | Seed the database |
| `python train_ml.py` | Retrain ML model + export weights JSON |

---

## 11. Production Deployment

### Architecture

```
[Vercel]              [Render Web Service]     [Render PostgreSQL]
catalyst-ai (SPA)  →  api-server (Express)  →  bioforgebharat-db
```

### 11.1 Render API Service (`render.yaml`)

- **Service name:** `bioforgebharat-api`
- **Build command:** `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build`
- **Start command:** `node --enable-source-maps artifacts/api-server/dist/index.mjs`
- **Health check path:** `/api/healthz`
- **Environment:** `NODE_ENV=production`, `PORT=8080`
- `DATABASE_URL` auto-injected from linked `bioforgebharat-db` Render PostgreSQL

**Post-deploy DB init (run once):**
```bash
corepack enable && pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run seed
```

### 11.2 Vercel Frontend

- **Build command:** `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/catalyst-ai run build`
- **Output directory:** `artifacts/catalyst-ai/dist/public`
- **Env vars:** `VITE_API_BASE_URL=https://<your-render-api-host>`, `BASE_PATH=/`

### 11.3 Smoke Test Checklist

1. Open Vercel URL → dashboard stats load
2. Reactions Library → open "Ethanol-to-Jet Fuel Conversion"
3. Generate AI candidates → verify scores + mechanism text
4. Open a candidate → verify feasibility scores + radar chart
5. Log an experiment
6. Analyze discrepancy
7. Trigger retraining run
8. Export session JSON + candidate CSV

---

## 12. Security & Supply Chain

- **`minimumReleaseAge: 1440`** in `pnpm-workspace.yaml` — all npm packages must be ≥1 day old before install (supply-chain attack defense)
- `@replit/*` and `stripe-replit-sync` are explicitly excluded from this restriction
- `pnpm` is enforced — `preinstall` script removes `package-lock.json` / `yarn.lock` and exits if not using pnpm
- esbuild pinned to `0.27.3` via workspace override
- `@esbuild-kit/esm-loader` overridden to `tsx@^4.21.0` (vulnerability fix)

---

## 13. Codegen Workflow (OpenAPI → TypeScript)

```
lib/api-spec/openapi.yaml
        ↓  (pnpm --filter @workspace/api-spec run codegen via Orval)
lib/api-zod/src/generated/api.ts       → Zod request/response schemas
lib/api-client-react/src/generated/    → React Query hooks
```

**Important:** Orval uses `mode: "single"` — `lib/api-zod/src/index.ts` only re-exports from `./generated/api`.  
All frontend API calls must use the generated hooks from `@workspace/api-client-react`, never raw `fetch`.

---

## 14. Key Source Files Index

| File | Package | Purpose |
|---|---|---|
| `artifacts/api-server/src/app.ts` | api-server | Express app factory |
| `artifacts/api-server/src/index.ts` | api-server | Server entry point (binds to `$PORT`) |
| `artifacts/api-server/src/seed.ts` | api-server | Database seed script |
| `artifacts/api-server/src/lib/ai.ts` | api-server | Gemini REST client + model chain fallback |
| `artifacts/api-server/src/lib/discovery-ai.ts` | api-server | 3-tier candidate generation + discrepancy analysis |
| `artifacts/api-server/src/lib/ml_model.ts` | api-server | Embedded Ridge Regression inference engine |
| `artifacts/api-server/src/lib/cheminformatics.ts` | api-server | PubChem + ChEMBL lookup utilities |
| `artifacts/api-server/src/lib/ml_weights.json` | api-server | Exported ML model weights (from `train_ml.py`) |
| `artifacts/api-server/src/routes/reactions.ts` | api-server | Reactions + candidate generation routes |
| `artifacts/api-server/src/routes/experiments.ts` | api-server | Experiments + discrepancy routes |
| `artifacts/api-server/src/routes/dashboard.ts` | api-server | Dashboard stats route |
| `artifacts/api-server/src/routes/export.ts` | api-server | JSON + CSV export routes |
| `artifacts/catalyst-ai/src/App.tsx` | catalyst-ai | Root app + all route definitions |
| `artifacts/catalyst-ai/src/pages/reaction-detail.tsx` | catalyst-ai | Largest page (28KB) — generation + literature search UI |
| `artifacts/catalyst-ai/src/pages/candidate-detail.tsx` | catalyst-ai | Candidate scores, radar chart, structure viz |
| `artifacts/catalyst-ai/src/pages/pathway.tsx` | catalyst-ai | Reaction path mapping + energy profiles |
| `artifacts/catalyst-ai/src/components/layout.tsx` | catalyst-ai | App shell, navigation, dark mode |
| `lib/db/src/schema/candidates.ts` | db | Candidates table definition |
| `lib/db/src/schema/reactions.ts` | db | Reactions table definition |
| `lib/db/src/schema/experiments.ts` | db | Experiments table definition |
| `train_ml.py` | root | Python ML training + weight export script |
| `ml_pipeline/catalyst_dataset.csv` | root | 2,000-record synthetic training dataset |

---

## 15. Domain Coverage

### Direction 1 — Chemical Catalysis
- Heterogeneous catalyst design (metal/support combinations)
- Reactions: Ethanol-to-Jet, CO₂ Hydrogenation, Methanol Synthesis
- Energy profile visualization (reaction coordinate diagrams)
- India-relevant feedstock focus (ethanol from sugarcane → SAF)

### Direction 2 — Synthetic Biology
- Microbial pathway engineering (metabolic flux, gene edits)
- Organisms: S. cerevisiae, Z. mobilis, C. ljungdahlii, E. coli, and 20+ others
- Pathway data: nodes, metabolic edits, bottlenecks
- Biomass Fermentation reaction domain

### Closed-Loop Feedback Workflow
1. Generate candidates (AI/ML)
2. Log experimental results
3. AI analyzes predicted vs. measured discrepancy
4. Researcher annotates findings
5. Trigger active learning retraining run
6. Export session data for reproducibility

---

*Last updated: 2026-05-12 | Generated from full codebase analysis*
