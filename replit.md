# BioForgeBharat — Agentic Molecular Discovery Platform

## Overview

Agentic AI-powered platform for molecular discovery in chemical catalysis and synthetic biology. Built by NammaNexus for the "AI for Bharat" hackathon. Covers Direction 1 (Chemical Catalysis), Direction 2 (Synthetic Biology), and the required closed-loop feedback workflow.

## Architecture

pnpm workspace monorepo using TypeScript.

### Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild
- **Frontend**: React + Vite, Tailwind CSS, Shadcn UI, Recharts, Framer Motion, Wouter
- **AI**: Gemini via `GEMINI_API_KEY`, with deterministic fallback outputs for sandbox demos

### Packages

- `artifacts/api-server` — Express 5 backend, port via `$PORT` env var (assigned 8080)
- `artifacts/catalyst-ai` — React+Vite frontend, port 22573, previewPath `/`
- `lib/db` — Drizzle ORM schema + PostgreSQL client
- `lib/api-spec` — OpenAPI spec + Orval codegen config
- `lib/api-zod` — Generated Zod validation schemas (from codegen)
- `lib/api-client-react` — Generated React Query hooks (from codegen)
- `artifacts/api-server/src/lib/ai.ts` — Gemini REST client with deterministic fallback behavior

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## API Routes (all under /api prefix)

- `GET /api/healthz` — health check
- `GET /api/dashboard/stats` — dashboard overview with metrics, top candidates, recent activity
- `GET /api/reactions` — list all reactions
- `POST /api/reactions` — create reaction
- `GET /api/reactions/:id` — get reaction
- `DELETE /api/reactions/:id` — delete reaction
- `GET /api/reactions/:id/candidates` — list candidates for reaction
- `POST /api/reactions/:id/generate-candidates` — AI-generate candidates via Claude (augmented with PubChem/ChEMBL lookups)
- `POST /api/reactions/:id/search-candidates?query=...` — search PubChem and ChEMBL for known compounds and persist them as `source="literature"` candidates
- `GET /api/candidates/:id` — get candidate with experiments
- `GET /api/experiments` — list all experiments (joined with candidate/reaction data)
- `POST /api/experiments` — log experiment
- `GET /api/experiments/:id` — get experiment detail
- `POST /api/experiments/:id/analyze-discrepancy` — AI discrepancy analysis via Claude
- `GET /api/annotations` — list annotations
- `POST /api/annotations` — create annotation
- `GET /api/retraining-runs` — list retraining runs
- `POST /api/retraining-runs` — trigger retraining run

## Database Schema

- `reactions` — chemical/biological reactions (name, equation, domain, conditions, etc.)
- `candidates` — catalyst/enzyme candidates with predicted metrics (activity, selectivity, stability, confidence) plus optional cheminformatics fields populated from PubChem/ChEMBL: `pubchemCid`, `chemblId`, `molecularWeight`, `logP`, `tpsa`, `canonicalSmiles`, `iupacName`, `sourceDb`
- `experiments` — experimental validation results (measured vs predicted)
- `annotations` — researcher notes linked to experiments
- `retraining_runs` — model retraining history with accuracy before/after

## Frontend Pages

- `/` — Dashboard with stats, top candidates, recent activity
- `/reactions` — Reactions library
- `/reactions/:id` — Reaction detail + AI candidate generation
- `/candidates/:id` — Candidate detail with molecular structure SVG + radar chart
- `/experiments` — Experiments log
- `/experiments/new` — Log experiment form
- `/experiments/:id` — Experiment detail + AI discrepancy analysis
- `/annotations` — Research annotations (searchable)
- `/retraining` — Model retraining history + trigger new run

## Seed Data

GPS Renewables ethanol-to-jet fuel scenario pre-seeded:
- 3 reactions (Ethanol-to-Jet, CO₂ Hydrogenation, Biomass Fermentation)
- 6 candidates (HZSM-5, Ni/HZSM-5, Cu-ZnO/SAPO-34, WO₃/Al₂O₃, Cu/ZnO, S. cerevisiae)
- 6 experiments with measured results
- 5 researcher annotations
- 1 retraining run

## Critical Notes

- Orval codegen uses `mode: "single"` — `lib/api-zod/src/index.ts` only exports from `./generated/api`
- Gemini is optional at runtime; without `GEMINI_API_KEY`, the backend uses deterministic sandbox outputs.
- Frontend uses dark mode by default (`.dark` class on root in layout)
- All API calls from frontend use `@workspace/api-client-react` hooks, never raw fetch
