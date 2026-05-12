# BioForgeBharat Deployment Guide

This repo is ready for a split deployment:

- API: Render Web Service
- Database: Render PostgreSQL
- Frontend: Vercel static build

## 1. Render PostgreSQL

1. Create a Render PostgreSQL database.
2. Copy the internal database URL.
3. Use that value as `DATABASE_URL` for the Render API service.

## 2. Render API Service

Create a Render Web Service from this repository.

Build command:

```bash
corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build
```

Start command:

```bash
node --enable-source-maps artifacts/api-server/dist/index.mjs
```

Environment variables:

```bash
DATABASE_URL=<render-postgres-internal-url>
GEMINI_API_KEY=<your-gemini-api-key>
GROQ_API_KEY=<your-groq-api-key>
NODE_ENV=production
PORT=8080
```

Optional:

```bash
GROQ_MODEL=llama-3.3-70b-versatile
```

The discovery agent (`POST /api/reactions/:id/agent-run`) calls Groq from Node (no Python on the server). `GROQ_MODEL` defaults if omitted.

Health check path:

```text
/api/healthz
```

After the service can reach the database, run once from a machine with the same env vars:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run seed
```

The app still works without `GEMINI_API_KEY`; the backend falls back to deterministic synthetic outputs for the hackathon sandbox.

## 3. Vercel Frontend

Create a Vercel project from the same repo.

Build command:

```bash
corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/catalyst-ai run build
```

Output directory:

```text
artifacts/catalyst-ai/dist/public
```

Environment variables:

```bash
VITE_API_BASE_URL=https://<your-render-api-host>
BASE_PATH=/
```

Do not expose `GEMINI_API_KEY` in Vercel. It belongs only on the Render API service.

## 4. Demo Smoke Test

1. Open the Vercel URL.
2. Confirm dashboard stats load.
3. Open `Reactions Library`.
4. Open `Ethanol-to-Jet Fuel Conversion`.
5. Generate AI candidates.
6. Open a candidate and verify feasibility scores plus simulation evidence.
7. Log an experiment.
8. Analyze discrepancy.
9. Trigger retraining.
10. Export the session JSON and candidate CSV.
