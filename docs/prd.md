# PRD — BioForgeBharat Phase 2 Enhancements (AI Platform for Molecular Discovery)

**Owner:** Mish-atul  
**Date:** 2026-05-11  
**Repo:** Mish-atul/BioForgeBharat-  

## 1) Product Summary
BioForgeBharat is an AI-powered research platform for molecular discovery in chemical catalysis and synthetic biology. It accelerates candidate discovery by combining literature search, generative AI, ML predictions, visualization, and an experimental feedback loop. The Phase 2 objective is to extend the prototype with deeper materials performance analytics (toxicity, recyclability, reactor constraints, and best-catalyst benchmarking) while maintaining the end-to-end discovery workflow.

---

## 2) What’s Already Done (Current Prototype Capabilities)

### 2.1 Core Workflow (End-to-End)
- **Reaction intake**: User selects a target reaction (e.g., Ethanol → Jet fuel).
- **Literature ingestion**: Known catalysts pulled from PubChem/ChEMBL.
- **Generative AI**: Novel candidates created using LLMs.
- **ML ranking**: Predict activity, selectivity, stability.
- **Visualization**: Candidate comparison, charts, reaction and pathway visuals.
- **Feedback loop**: Users log experiment results and retrain models.
- **Exports**: Session JSON + candidate CSV.

### 2.2 Backend (API Server)
- Express + Drizzle/Postgres
- Core routes:
  - Reactions, candidates, experiments, annotations, retraining
  - AI candidate generation & discrepancy analysis
  - Export endpoints
- ML inference via precomputed Ridge Regression weights (Node.js inference)

### 2.3 Frontend (Catalyst AI)
- Dashboard, reaction library, candidate detail
- Experiment logging + discrepancy analysis
- Retraining history page
- Visual analytics panels

### 2.4 ML Pipeline
- Synthetic dataset generation
- Ridge regression model exported into API

### 2.5 Seeded Data
- Example GPS Renewables scenarios
- Example catalysts, experiments, and annotations

---

## 3) Phase 2 Requirements (New Deliverables)

Based on mentor guidance, the Phase 2 prototype should include:

### 3.1 Toxicity Analysis of Nanomaterials
**Goal:** Evaluate the environmental and biological toxicity risk of each candidate.

**Required Outputs**
- Toxicity score (0–100 or Low/Medium/High)
- Known toxicity references (if from literature)
- Safety flags for hazard categories

**Implementation Ideas**
- Add toxicity fields in candidate schema
- Use curated datasets (e.g., Tox21, NanoEHS) for reference
- LLM-based estimates if real datasets unavailable (with disclaimer)

---

### 3.2 Recycling Capacity / Catalyst Retention After 10 Cycles
**Goal:** Estimate how much performance a catalyst retains after repeated cycles.

**Required Outputs**
- Retention after cycle 1–10 (%)
- Deactivation curve visualization
- Summary: “Retains X% after 10 cycles”

**Implementation Ideas**
- Add recycling profile field to candidates
- Simple simulated degradation curve for sandbox
- UI chart in candidate detail

---

### 3.3 Best Catalyst Comparison / Efficiency Ranking
**Goal:** Identify which candidate is “best” based on multi-factor scoring.

**Required Outputs**
- Composite score = activity + selectivity + stability + toxicity + recycling
- Top ranked catalyst for each reaction
- Comparison table

**Implementation Ideas**
- Add ranking algorithm with weighted scoring
- Display “Best Candidate” badge on UI
- Add filters for “safest”, “most recyclable”, “highest activity”

---

### 3.4 Reactor Size Recommendation
**Goal:** Provide reactor sizing constraints for a selected reaction/catalyst.

**Required Outputs**
- Reactor type (batch/continuous/plug flow)
- Estimated volume range (L) for pilot
- Key constraints (pressure, temperature, flow rate)

**Implementation Ideas**
- Add “Process/Scale” panel to reaction detail
- Use simplified engineering heuristics
- Store assumptions in metadata

---

## 4) Feature-by-Feature Enhancements

### 4.1 Backend Changes
- **Database schema additions**
  - candidate.toxicityScore
  - candidate.toxicityNotes
  - candidate.recyclingRetention (array or json)
  - candidate.reactorSizeEstimate
  - candidate.compositeScore
- **New API endpoints**
  - GET /candidates/:id/sustainability
  - POST /candidates/:id/score
  - GET /reactions/:id/best-candidate

### 4.2 Frontend Changes
- **Candidate Detail**
  - Toxicity panel
  - Recycling curve chart
  - Reactor size estimate card
  - Composite score and rank
- **Reaction Detail**
  - Best candidate highlight
  - Sort by composite score
- **Dashboard**
  - “Top Sustainable Catalysts” leaderboard

### 4.3 ML & AI Enhancements
- Toxicity estimation pipeline (real datasets or LLM assisted)
- Recycling degradation regression model
- Composite scoring weights configurable per reaction domain

---

## 5) Non-Negotiables Coverage
✅ End-to-end workflow retained  
✅ Data feedback loop present  
✅ Multi-user annotation support present  
✅ Experimental results re-train model  
✅ Literature ingestion + generative candidates  

Phase 2 upgrades extend this with **safety, sustainability, recyclability, and scale constraints**.

---

## 6) Development Roadmap (Phase 2 Focus)

### Immediate (Hackathon Demo)
- Add toxicity + recycling fields in schema
- Mock toxicity + retention curves
- Composite score display
- Best catalyst ranking
- Reactor sizing heuristics

### Short-Term (Pilot Readiness)
- Real toxicity data integration
- Deactivation curve trained on real data
- Reactor sizing integration with process simulation tools
- LIMS-ready import/export for experiments

---

## 7) Risks & Trade-offs
- Toxicity datasets may be sparse; LLM estimations should be labeled as “synthetic”
- Reactor sizing is domain sensitive; use safe approximations for demo
- Multi-factor scoring weights must be transparent to users

---

## 8) Success Metrics for Phase 2
- Toxicity + recycling shown for all candidates
- Best catalyst per reaction is auto-identified
- Reactor sizing estimation provided for each reaction
- Demo run completes full loop with sustainability analytics

---

## 9) Open Questions
1. Do we need separate toxicity for catalyst vs support?
2. Should recycling retention be measured in activity or selectivity?
3. Should reactor sizing be user-defined or auto-estimated only?

---

**End of PRD**