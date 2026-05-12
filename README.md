# BioForgeBharat

AI-powered reaction engineering and sustainable catalyst discovery platform.

BioForgeBharat helps researchers discover, compare, and validate catalysts, enzymes, and bioprocess routes for sustainable chemical production. It combines a React dashboard, an Express API, PostgreSQL persistence, ML virtual screening, PubChem/ChEMBL lookup, Gemini-assisted generation, and a Groq-powered discovery recommender.

## What It Does

BioForgeBharat is built around a practical R&D workflow:

1. Create or open a reaction.
2. Search known chemistry/biology references from PubChem and ChEMBL.
3. Generate candidate catalysts or bioprocess designs.
4. Score candidates for activity, selectivity, stability, cost, sustainability, toxicity, scale-up, and uncertainty.
5. Run the Discovery Agent.
6. Let Groq classify the process and recommend the best mechanism-compatible catalyst.
7. Save candidate data, discovery events, experiments, and recommendation history in PostgreSQL.

## Key Features

### Reaction Workspace

- Create and manage reaction records.
- Track equation, target product, operating conditions, domain, feedstock context, and process notes.
- View generated and literature-sourced candidates for each reaction.

### Candidate Discovery

- Uses local ML virtual screening as the first candidate-generation layer.
- Falls back to Gemini-assisted generation when needed.
- Falls back again to a curated expert pool if external AI is unavailable.
- Stores every generated candidate in PostgreSQL with scores and metadata.

### Groq Discovery Agent

The Discovery Agent is the main agentic workflow in the app.

When you click Run Discovery Agent, the backend streams progress events to the UI:

```text
start -> context -> literature -> design -> screening -> groq -> recommendation -> complete
```

The Groq recommender now uses a two-stage architecture:

**Stage 1: Reaction Understanding**

Groq first determines:

- reaction class
- process type: biological, thermochemical, electrochemical, photocatalytic, or hybrid
- realistic operating regime
- main conversion mechanism
- compatible candidate classes
- rejection rules for incompatible candidates

**Stage 2: Mechanism-Compatible Recommendation**

Groq then ranks candidates only within compatible mechanism classes. A candidate is penalized or rejected if:

- its active temperature window is incompatible
- its mechanism does not participate in the governing reaction pathway
- it conflicts with microbial viability
- it is industrially unrealistic for the stated process

If the generated shortlist is poor, Groq can propose a new mechanism-compatible catalyst or biocatalyst. The backend saves that proposed candidate with:

```text
source = groq-recommended
sourceDb = groq
```

So the system does not just stop at "no compatible catalyst." It can produce a better recommendation.

### Literature Retrieval

- PubChem lookup for compound identity and chemical metadata.
- ChEMBL search for known bioactivity/reference candidates.
- Retrieved evidence is passed into the Discovery Agent so the final recommendation has external context.

### Sustainability and Readiness Scoring

Each candidate can include:

- CO2 avoided per tonne
- SDG tags
- climate narrative
- toxicity score and toxicity notes
- recycling retention curve
- reactor sizing estimate
- cost tier and cost rationale
- ZLD compatibility
- composite readiness score
- uncertainty estimates

### Experiment Feedback Loop

- Log measured experimental outcomes.
- Compare predicted vs measured activity, selectivity, and yield.
- Generate discrepancy hypotheses.
- Mark records for retraining and future model improvement.

### Comparison View

- Compare shortlisted candidates side by side.
- Useful for design reviews and pitch/demo workflows.
- Helps explain why one catalyst is more viable than another.

### Persistent Discovery Runs

Discovery Agent runs are saved in PostgreSQL:

- run status
- step-by-step streamed events
- top candidate / proposed candidate
- summary
- timestamps

When you revisit a reaction, the latest discovery run can be reloaded instead of disappearing after the page refreshes.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| AI generation | Gemini API |
| AI recommendation | Groq API |
| ML | Local virtual screening model plus Python training/export scripts |
| External data | PubChem, ChEMBL |
| Package manager | pnpm workspaces |

## Project Structure

```text
BioForgeBharat-/
  artifacts/
    api-server/          Express API server
    catalyst-ai/         React/Vite frontend
  lib/
    db/                  Drizzle schema and database package
    api-zod/             Shared API validation schemas
    api-spec/            API specification files
  scripts/
    discovery_crew.py    Groq recommendation runtime
  ml_pipeline/           ML training assets
  docker-compose.yml     Local PostgreSQL service
  .env.example           Example environment variables
  package.json           pnpm workspace root
```

## Environment Variables

Create a `.env` file from `.env.example` or set these values directly in your terminal:

```env
PORT=8080
DATABASE_URL=postgres://bioforge:bioforge@localhost:5432/bioforgebharat
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=groq/llama-3.3-70b-versatile
VITE_API_BASE_URL=http://localhost:8080
```

Notes:

- `GROQ_API_KEY` is required for the final Discovery Agent recommendation.
- `GEMINI_API_KEY` improves AI generation and narratives, but the app has fallbacks.
- If you change environment variables, restart the backend terminal.

## Local Setup

### Prerequisites

- Node.js 20+
- Corepack enabled
- pnpm 10+
- Python 3.12 through `uv` for the Groq recommender runtime
- Docker Desktop for easiest PostgreSQL setup, or your own PostgreSQL instance

### Install Node Dependencies

```cmd
cd C:\Users\janan\BioForgeBharat-
corepack pnpm install
```

### Start PostgreSQL

If Docker Desktop is running:

```cmd
corepack pnpm run db:up
```

Then push the schema and seed data:

```cmd
set DATABASE_URL=postgres://bioforge:bioforge@localhost:5432/bioforgebharat
corepack pnpm --filter @workspace/db run push
corepack pnpm --filter @workspace/api-server run seed
```

If Docker is not available, create a PostgreSQL database yourself and set `DATABASE_URL` to that connection string.

### Build Groq Python Runtime

The repo uses a local Python environment named `.venv-crewai` for historical reasons, but the current recommendation path calls Groq directly.

```cmd
uv python install 3.12
uv venv --python 3.12 .venv-crewai
uv pip install --python .\.venv-crewai\Scripts\python.exe groq json-repair
```

## Run The App

Use two terminals.

### Terminal 1: API

```cmd
cd C:\Users\janan\BioForgeBharat-
set PORT=8081
set DATABASE_URL=postgres://bioforge:bioforge@localhost:5432/bioforgebharat
set GEMINI_API_KEY=your_gemini_key_here
set GROQ_API_KEY=your_groq_key_here
set GROQ_MODEL=groq/llama-3.3-70b-versatile
corepack pnpm --filter @workspace/api-server run build
corepack pnpm --filter @workspace/api-server run start
```

### Terminal 2: Frontend

```cmd
cd C:\Users\janan\BioForgeBharat-
set VITE_API_BASE_URL=http://localhost:8081
corepack pnpm --filter @workspace/catalyst-ai run dev
```

Open the Vite URL shown in the frontend terminal.

## Discovery Agent User Flow

1. Open the frontend.
2. Go to a reaction detail page.
3. Click Run Discovery Agent.
4. Watch the streamed log:

```text
contextLoaded
literatureRetrieved
designGenerating
screening
groq
recommendation
complete
```

5. Review the recommended catalyst or Groq-proposed catalyst.
6. Open candidate detail pages for mechanism, sustainability, toxicity, reactor, and uncertainty panels.
7. Use the compare page to evaluate candidates side by side.

## Important Runtime Notes

If you see `EADDRINUSE`, the backend port is already in use. Change `PORT` to another value, for example:

```cmd
set PORT=8082
```

and set the frontend to match:

```cmd
set VITE_API_BASE_URL=http://localhost:8082
```

If Groq returns `429`, your Groq account has hit a temporary rate limit. Wait and rerun.

If the Discovery Agent says Groq proposed a catalyst, that means the generated shortlist was not mechanism-compatible enough, so Groq created a better candidate and the backend saved it.

## Useful Commands

```cmd
corepack pnpm run db:up
corepack pnpm run db:down
corepack pnpm --filter @workspace/db run push
corepack pnpm --filter @workspace/api-server run seed
corepack pnpm --filter @workspace/api-server run typecheck
corepack pnpm --filter @workspace/catalyst-ai run typecheck
```

## Deployment

The project is designed for split deployment:

- API: Render or another Node hosting service
- Database: PostgreSQL
- Frontend: Vercel, Netlify, or another static hosting service

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment notes.

## License

MIT
