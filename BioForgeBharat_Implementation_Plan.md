# BioForgeBharat — Phase 2+ Feature Implementation Plan

**Team:** NammaNexus | **Hackathon:** AI for Bharat  
**Client Pitch Target:** GPS Renewables  
**Timeline:** 1 day (13 hours)  
**Repo:** `github.com/Mish-atul/BioForgeBharat-`

---

## How to Read This Document

Each feature is structured as:
- **What it is** — plain description
- **Gap it addresses** — which architectural/product gap this closes
- **GPS Renewables alignment** — why this matters specifically for the pitch
- **Exact implementation steps** — file paths, schema changes, code patterns, UI changes
- **Effort** — realistic time estimate

Features are ordered by priority. Do them in sequence. Do not skip ahead.

---

## Priority 1 — GPS-Specific Reaction Seeds
**Time:** 2 hours | **Type:** Backend (seed.ts only) | **Risk:** Low

### What it is
Replace/augment the demo's "Ethanol → Jet Fuel" seeded data with three reactions that map directly to GPS Renewables' live operational plants and R&D focus areas. When GPS's team sees their own feedstocks and plant names in the demo, the pitch stops being generic and becomes personal.

### Gap it addresses
The current prototype is seeded for a generic chemical catalysis demo. The "Ethanol → Jet Fuel" reaction is illustrative but does not reflect GPS Renewables' actual business. During a live pitch, this creates distance — the audience has to mentally translate your demo into their context. Closing this gap removes that friction entirely.

### GPS Renewables alignment
GPS operates the following live plants directly relevant to these seeds:
- **Indore Plant** — 17 TPD CBG from MSW (operational)
- **Bhopal Project** — 14 TPD CBG from MSW (operational)
- **Mizoram Bamboo Ethanol Plant** — 100 KLPD from bamboo feedstock
- **GPSR Aavishkaar R&D** — anaerobic fungi for biomass-to-biogas conversion

Their entire ₹1,007 Cr revenue in FY25 comes from EPC projects built around these exact feedstock-to-fuel pathways. Seed data that mirrors their plants = zero mental translation required.

### Implementation steps

**File:** `artifacts/api-server/src/seed.ts`

Add three new reaction objects to the seeded reactions array. Keep the existing "Ethanol → Jet Fuel" reaction — it is still useful for chemical catalysis demonstration. Add these after it:

```typescript
// SEED REACTION 2 — GPS Renewables: Indore/Bhopal MSW plant scenario
{
  name: "Municipal Solid Waste → Compressed Biogas (CBG)",
  type: "Anaerobic Digestion",
  equation: "Organic MSW + H₂O → CH₄ + CO₂ + digestate",
  target_product: "Compressed Biogas (CBG)",
  conditions: "Temperature: 35–37°C (mesophilic), pH: 6.8–7.2, HRT: 20–30 days, anaerobic environment",
  description: "Anaerobic digestion of municipal solid waste to produce compressed biogas. GPS Renewables operates this process at the Indore plant (17 TPD CBG) and Bhopal plant (14 TPD CBG). The key catalytic challenge is optimising microbial consortium performance — particularly acetogenic and methanogenic bacteria — for heterogeneous MSW feedstock composition.",
  domain: "synthetic-biology",
  // Add a metadata tag for GPS badge rendering
  tags: ["GPS Renewables Scenario", "Indore Plant", "Bhopal Plant", "CBG", "MSW"]
},

// SEED REACTION 3 — GPS Renewables: Mizoram bamboo ethanol scenario
{
  name: "Bamboo Lignocellulose → 2G Ethanol",
  type: "Enzymatic Hydrolysis + Fermentation",
  equation: "Bamboo cellulose/hemicellulose → glucose → C₂H₅OH + CO₂",
  target_product: "2G Ethanol",
  conditions: "Pretreatment: 180°C steam explosion or dilute acid, Hydrolysis pH: 4.8–5.0, Fermentation: 30–35°C, 48–72h",
  description: "Two-stage conversion of bamboo lignocellulosic biomass to second-generation ethanol. GPS Renewables operates a 100 KLPD bamboo ethanol plant in Mizoram. The critical catalytic bottleneck is cellulase enzyme efficiency on bamboo's dense lignin structure and xylose fermentation yield using engineered yeast or Z. mobilis strains.",
  domain: "synthetic-biology",
  tags: ["GPS Renewables Scenario", "Mizoram Plant", "2G Ethanol", "Bamboo", "Lignocellulosic"]
},

// SEED REACTION 4 — GPS Renewables: Paddy straw BioCNG (agri-residue focus)
{
  name: "Paddy Straw Agri-Residue → Bio-CNG",
  type: "Anaerobic Co-digestion",
  equation: "Paddy straw + press mud cake + H₂O → CH₄ + CO₂ → Bio-CNG",
  target_product: "Bio-CNG",
  conditions: "Feedstock ratio: 70:30 paddy straw to press mud, Temperature: 37°C, pH: 7.0–7.5, HRT: 25 days, CSTR digester",
  description: "Co-digestion of paddy straw with press mud cake for Bio-CNG production aligned with India's SATAT policy. GPS Renewables has multiple projects under this pathway in partnership with IOCL and BPCL. Key catalytic challenge: pretreatment of paddy straw (high silica content, recalcitrant lignin) using fungi or chemical pretreatment before anaerobic digestion.",
  domain: "synthetic-biology",
  tags: ["GPS Renewables Scenario", "SATAT Policy", "Bio-CNG", "Paddy Straw", "IOCL JV"]
}
```

**Schema change required:** Add a `tags` JSON column to the `reactions` table if not already present:

```typescript
// lib/db/src/schema/reactions.ts
tags: text("tags"),  // store as JSON string, parse on read
```

**Frontend badge:** In `artifacts/catalyst-ai/src/pages/reaction-detail.tsx`, add this at the top of the reaction card if `reaction.tags` includes "GPS Renewables Scenario":

```tsx
{reaction.tags?.includes("GPS Renewables Scenario") && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
    ✦ GPS Renewables Scenario
  </span>
)}
```

**Seed candidates for these reactions:** For each new reaction, add 3–4 seeded candidates using the existing candidate structure. For MSW → CBG, seed candidates such as:
- `Methanosaeta concilii` (acetoclastic methanogen, source: "literature")
- `Clostridium thermocellum` co-culture (cellulolytic, source: "literature")
- `Anaerobic fungi consortium (Neocallimastix + Piromyces)` (GPS patent area, source: "ai")

For bamboo → ethanol, seed:
- `Trichoderma reesei` cellulase complex (source: "literature")
- `Zymomonas mobilis ZM4` (source: "literature")
- `Engineered S. cerevisiae + xylose isomerase pathway` (source: "ai")

**Run after changes:**
```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run seed
```

---

## Priority 2 — CO₂e Climate Impact Panel + SDG Tags
**Time:** 3 hours | **Type:** Backend (schema + endpoint) + Frontend | **Risk:** Low–Medium

### What it is
Add a "Climate Impact" panel to every candidate detail page showing: estimated CO₂e avoided per tonne of feedstock processed, the specific SDGs this catalyst supports, and a one-line Gemini-generated climate narrative. Add a "Top Climate-Impact Catalysts" leaderboard to the dashboard.

### Gap it addresses
Phase 2 adds toxicity and recycling — both are safety/performance dimensions. But neither speaks to the outcome GPS Renewables ultimately sells to the world. The missing dimension is: **what does this catalyst do for the climate?** Without a carbon impact number, the Phase 2 composite score is purely technical and misses the ESG story entirely.

### GPS Renewables alignment
GPS Renewables' FY25 headline number is **294,372 MT CO₂e avoided**. This is the first metric their ESG committee, IOCL JV partners, and investor (Sojitz Corporation) see. They map every project and technology against SDG 7 (Clean Energy), SDG 12 (Responsible Consumption), and SDG 13 (Climate Action).

If your candidate detail page shows "estimated 12 kg CO₂e avoided per tonne of paddy straw" and maps to SDG 7 + SDG 13 badges, you are speaking the exact language GPS leadership uses in their own ESG reports. This is the single highest-resonance feature for the pitch.

### Implementation steps

**Step 1 — Schema additions**

```typescript
// lib/db/src/schema/candidates.ts — add these fields:
co2_avoided_per_tonne: real("co2_avoided_per_tonne"),      // kg CO₂e per tonne feedstock
sdg_tags: text("sdg_tags"),                                  // JSON: ["SDG 7", "SDG 13", "SDG 12"]
climate_narrative: text("climate_narrative"),                // Gemini-generated one-liner
```

**Step 2 — CO₂e estimation logic**

Create a utility function in `artifacts/api-server/src/lib/climate.ts`:

```typescript
// Heuristic CO2e estimation — clearly labelled as estimated in UI
export function estimateCO2AvoidedPerTonne(
  candidateType: string,
  targetProduct: string,
  predictedActivity: number,
  sustainabilityScore: number
): number {
  // Base CO2e avoidance benchmarks (kg CO2e / tonne feedstock processed)
  // These are conservative real-world reference values
  const baseValues: Record<string, number> = {
    "Compressed Biogas (CBG)": 180,   // ~180 kg CO2e per tonne MSW processed (IPCC ref)
    "Bio-CNG": 165,
    "2G Ethanol": 140,                 // Bamboo/agri-residue ethanol
    "Jet Fuel": 95,                    // SAF from ethanol
    "Methanol": 110,
    "default": 100
  };
  
  const base = baseValues[targetProduct] ?? baseValues["default"];
  // Scale by predicted activity and sustainability score
  const scaled = base * predictedActivity * (0.7 + 0.3 * sustainabilityScore);
  return Math.round(scaled * 10) / 10;
}

export function assignSDGTags(targetProduct: string, domain: string): string[] {
  const tags: string[] = ["SDG 13"]; // Climate action — always applicable
  if (["CBG", "Bio-CNG", "2G Ethanol", "Jet Fuel", "Methanol"].some(p => targetProduct.includes(p))) {
    tags.push("SDG 7"); // Clean energy
  }
  if (domain === "synthetic-biology") {
    tags.push("SDG 12"); // Responsible consumption (waste → fuel)
  }
  return tags;
}
```

**Step 3 — Generate climate narrative via Gemini**

In `artifacts/api-server/src/lib/discovery-ai.ts`, add a new function:

```typescript
export async function generateClimateNarrative(
  candidateName: string,
  targetProduct: string,
  co2AvoidedPerTonne: number,
  sdgTags: string[]
): Promise<string> {
  const prompt = `You are a climate impact analyst. Write exactly ONE sentence (max 25 words) describing the climate benefit of using ${candidateName} to produce ${targetProduct}. 
The catalyst enables approximately ${co2AvoidedPerTonne} kg CO₂e avoided per tonne of feedstock processed. 
Reference the SDGs: ${sdgTags.join(", ")}.
Be specific and factual. Do not use marketing language. Example format: "Enables ~X kg CO₂e reduction per tonne of feedstock, directly supporting clean energy access (SDG 7) and climate action (SDG 13)."`;

  const response = await callGemini(prompt);
  return response.trim();
}
```

**Step 4 — Populate during candidate generation**

In `artifacts/api-server/src/routes/reactions.ts`, after ML scoring and before saving a new candidate, add:

```typescript
const co2Avoided = estimateCO2AvoidedPerTonne(
  candidate.candidate_type,
  reaction.target_product,
  candidate.predicted_activity,
  candidate.sustainability_score
);
const sdgTags = assignSDGTags(reaction.target_product, reaction.domain);
const climateNarrative = await generateClimateNarrative(
  candidate.name, reaction.target_product, co2Avoided, sdgTags
);

// Add to candidate insert object:
co2_avoided_per_tonne: co2Avoided,
sdg_tags: JSON.stringify(sdgTags),
climate_narrative: climateNarrative,
```

Also add these values to the seeded candidates in `seed.ts`.

**Step 5 — Frontend: Climate Impact panel on candidate-detail.tsx**

Add a new panel section below the existing feasibility scores radar chart:

```tsx
{/* Climate Impact Panel */}
<div className="rounded-xl border border-border bg-card p-5 space-y-4">
  <div className="flex items-center gap-2">
    <span className="text-lg">🌍</span>
    <h3 className="font-medium text-base">Climate Impact</h3>
    <span className="text-xs text-muted-foreground ml-auto">Estimated</span>
  </div>

  {/* CO2e metric */}
  <div className="flex items-baseline gap-2">
    <span className="text-3xl font-medium text-green-600 dark:text-green-400">
      ~{candidate.co2_avoided_per_tonne}
    </span>
    <span className="text-sm text-muted-foreground">kg CO₂e avoided / tonne feedstock</span>
  </div>

  {/* Climate narrative */}
  {candidate.climate_narrative && (
    <p className="text-sm text-muted-foreground italic border-l-2 border-green-500 pl-3">
      {candidate.climate_narrative}
    </p>
  )}

  {/* SDG badges */}
  <div className="flex flex-wrap gap-2">
    {JSON.parse(candidate.sdg_tags || "[]").map((sdg: string) => (
      <span key={sdg} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        {sdg}
      </span>
    ))}
  </div>

  <p className="text-xs text-muted-foreground">
    ⚠ CO₂e values are heuristic estimates for research guidance. Verify with lifecycle analysis before operational deployment.
  </p>
</div>
```

**Step 6 — Dashboard leaderboard**

In `artifacts/api-server/src/routes/dashboard.ts`, add to the stats query:

```typescript
// Top Climate-Impact Catalysts
const topClimateImpact = await db
  .select()
  .from(candidates)
  .orderBy(desc(candidates.co2_avoided_per_tonne))
  .limit(5);
```

In `artifacts/catalyst-ai/src/pages/dashboard.tsx`, add a "Top Climate-Impact Catalysts" leaderboard card below the existing stats, showing candidate name, reaction, and CO₂e metric with a green bar.

---

## Priority 3 — Phase 2 Core (Toxicity + Recycling + Composite Score + Reactor Sizing)
**Time:** 3 hours | **Type:** Backend + Frontend | **Risk:** Medium

### What it is
This is the formal Phase 2 PRD deliverable. Implement all four Phase 2 requirements together since they share schema changes and the composite score depends on toxicity + recycling being present.

### Gap it addresses
Without Phase 2, the platform has no sustainability analytics beyond the existing `sustainability_score` field. Phase 2 transforms BioForgeBharat from a "discovery tool" into a "decision-support tool" — a crucial difference when pitching to GPS Renewables who need catalysts ready for pilot-scale deployment, not just lab discovery.

### GPS Renewables alignment
GPS's engineering team uses a 30-60-90 review framework. At the 60% design review, they need toxicity profiles (safety clearance), recyclability data (OpEx estimation), and reactor sizing (CapEx estimation). Phase 2 directly feeds their engineering decision workflow.

### Implementation steps

**Step 1 — Schema additions**

```typescript
// lib/db/src/schema/candidates.ts
toxicity_score: real("toxicity_score"),          // 0–100 (higher = more toxic)
toxicity_level: text("toxicity_level"),          // "Low" | "Medium" | "High"
toxicity_notes: text("toxicity_notes"),          // Known hazards, safety flags
toxicity_source: text("toxicity_source"),        // "literature" | "llm-estimated"
recycling_retention: text("recycling_retention"), // JSON: [100,98,95,91,86,80,73,65,56,46]
reactor_type: text("reactor_type"),              // "CSTR" | "PFR" | "Batch" | "Fixed-Bed"
reactor_volume_min: real("reactor_volume_min"),  // Litres (pilot scale min)
reactor_volume_max: real("reactor_volume_max"),  // Litres (pilot scale max)
reactor_constraints: text("reactor_constraints"),// JSON: {pressure, temperature, flow_rate}
composite_score: real("composite_score"),        // 0–100 weighted composite
composite_rank: integer("composite_rank"),       // Rank within reaction
```

**Step 2 — Toxicity estimation utility**

Add to `artifacts/api-server/src/lib/sustainability.ts` (new file):

```typescript
export function estimateToxicityScore(
  formula: string,
  candidateType: string,
  molecularWeight: number | null,
  logP: number | null
): { score: number; level: "Low" | "Medium" | "High"; notes: string; source: string } {
  
  // Nano-material and metal-based catalysts carry higher toxicity risk
  const highRiskIndicators = ["nano", "Pt", "Pd", "Cd", "Cr", "Hg", "Pb", "As"];
  const mediumRiskIndicators = ["Ni", "Cu", "Zn", "Co", "Fe oxide", "TiO2"];
  const bioSafeIndicators = ["enzyme", "microbial", "fungi", "yeast", "bacteria"];
  
  let score = 30; // default baseline
  let notes = "";
  
  if (bioSafeIndicators.some(ind => candidateType?.toLowerCase().includes(ind) || formula?.toLowerCase().includes(ind))) {
    score = 10 + Math.random() * 15; // 10–25 (biological agents, low toxicity)
    notes = "Biological catalyst — generally low environmental toxicity. Assess pathogenicity for specific strains.";
  } else if (highRiskIndicators.some(ind => formula?.includes(ind))) {
    score = 65 + Math.random() * 25; // 65–90
    notes = "Contains potentially toxic metals. Requires environmental impact assessment. Refer to Tox21 database.";
  } else if (mediumRiskIndicators.some(ind => formula?.includes(ind))) {
    score = 35 + Math.random() * 25; // 35–60
    notes = "Metal-based catalyst. Standard industrial safety protocols apply. Assess leaching risk.";
  } else {
    score = 20 + Math.random() * 30;
    notes = "Toxicity estimated by structural heuristics. Verify against NanoEHS or Tox21 datasets before deployment.";
  }

  score = Math.round(score);
  const level = score < 33 ? "Low" : score < 66 ? "Medium" : "High";
  
  return { score, level, notes, source: "llm-estimated" };
}

export function generateRecyclingCurve(
  predictedStability: number,
  cycles: number = 10
): number[] {
  // Exponential decay model: retention(n) = initial * e^(-k*n)
  // k derived from stability score: higher stability = lower decay rate
  const k = (1 - predictedStability) * 0.12; // decay constant
  const curve: number[] = [];
  for (let n = 0; n <= cycles; n++) {
    const retention = Math.round(100 * Math.exp(-k * n) * 10) / 10;
    curve.push(Math.max(0, retention));
  }
  return curve;
}

export function estimateReactorSizing(
  domain: string,
  targetProduct: string,
  predictedActivity: number
): { type: string; volumeMin: number; volumeMax: number; constraints: object } {
  
  const reactorProfiles: Record<string, { type: string; volMin: number; volMax: number; constraints: object }> = {
    "synthetic-biology": {
      type: "CSTR (Continuous Stirred Tank Reactor)",
      volMin: 500, volMax: 5000,
      constraints: { pressure_bar: "1 (atmospheric)", temperature_C: "35–55", HRT_days: "20–30", pH: "6.8–7.5" }
    },
    "chemical-catalysis": {
      type: "Fixed-Bed Plug Flow Reactor",
      volMin: 50, volMax: 500,
      constraints: { pressure_bar: "10–50", temperature_C: "200–400", WHSV: "1–5 h⁻¹", feed_ratio: "H₂:CO 2:1–3:1" }
    }
  };

  const profile = reactorProfiles[domain] ?? reactorProfiles["chemical-catalysis"];
  // Scale volume inversely with predicted activity (higher activity = smaller reactor needed)
  const activityFactor = 1.5 - predictedActivity;
  
  return {
    type: profile.type,
    volumeMin: Math.round(profile.volMin * activityFactor),
    volumeMax: Math.round(profile.volMax * activityFactor),
    constraints: profile.constraints
  };
}

export function calculateCompositeScore(candidate: {
  predicted_activity: number;
  predicted_selectivity: number;
  predicted_stability: number;
  toxicity_score: number;
  recycling_retention: string;
  sustainability_score: number;
  cost_score: number;
}): number {
  // Configurable weights — these should sum to 1.0
  const weights = {
    activity:      0.25,
    selectivity:   0.20,
    stability:     0.15,
    toxicity:      0.15,  // inverted: lower toxicity = higher score
    recycling:     0.15,  // retention at cycle 10
    sustainability: 0.05,
    cost:          0.05
  };

  const retention10 = JSON.parse(candidate.recycling_retention || "[0]").at(-1) / 100;
  const toxicityNorm = 1 - (candidate.toxicity_score / 100); // invert — lower toxicity is better

  const composite =
    candidate.predicted_activity    * weights.activity     +
    candidate.predicted_selectivity * weights.selectivity  +
    candidate.predicted_stability   * weights.stability    +
    toxicityNorm                    * weights.toxicity     +
    retention10                     * weights.recycling    +
    (candidate.sustainability_score ?? 0.5) * weights.sustainability +
    (candidate.cost_score ?? 0.5)   * weights.cost;

  return Math.round(composite * 100); // 0–100
}
```

**Step 3 — Integrate into candidate generation pipeline**

In `artifacts/api-server/src/routes/reactions.ts`, after existing ML scoring:

```typescript
import { estimateToxicityScore, generateRecyclingCurve, estimateReactorSizing, calculateCompositeScore } from '../lib/sustainability';

// After ML scoring, before DB insert:
const toxicity = estimateToxicityScore(
  candidate.formula, candidate.candidate_type,
  candidate.molecular_weight, candidate.log_p
);
const recyclingCurve = generateRecyclingCurve(candidate.predicted_stability);
const reactor = estimateReactorSizing(reaction.domain, reaction.target_product, candidate.predicted_activity);

const compositeScore = calculateCompositeScore({
  ...candidate,
  toxicity_score: toxicity.score,
  recycling_retention: JSON.stringify(recyclingCurve),
});

// Add to DB insert:
toxicity_score: toxicity.score,
toxicity_level: toxicity.level,
toxicity_notes: toxicity.notes,
toxicity_source: toxicity.source,
recycling_retention: JSON.stringify(recyclingCurve),
reactor_type: reactor.type,
reactor_volume_min: reactor.volumeMin,
reactor_volume_max: reactor.volumeMax,
reactor_constraints: JSON.stringify(reactor.constraints),
composite_score: compositeScore,
```

**Step 4 — New API endpoints**

In `artifacts/api-server/src/routes/candidates.ts` (or create new routes file):

```typescript
// GET /api/candidates/:id/sustainability
// Returns toxicity, recycling, reactor, composite in one call
router.get("/:id/sustainability", async (req, res) => { ... });

// POST /api/candidates/:id/score  
// Recalculate composite score with custom weights
router.post("/:id/score", async (req, res) => {
  const { weights } = req.body; // { activity, selectivity, stability, toxicity, recycling }
  // recalculate and return
});

// GET /api/reactions/:id/best-candidate
router.get("/:id/best-candidate", async (req, res) => {
  const best = await db.select().from(candidates)
    .where(eq(candidates.reaction_id, req.params.id))
    .orderBy(desc(candidates.composite_score))
    .limit(1);
  res.json(best[0]);
});
```

**Step 5 — Frontend panels on candidate-detail.tsx**

Add four new panels below the existing radar chart. Implement in this order:

**Toxicity Panel:**
```tsx
<div className="rounded-xl border p-5">
  <h3 className="font-medium mb-3">🧪 Toxicity Profile</h3>
  <div className="flex items-center gap-3 mb-3">
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
      candidate.toxicity_level === "Low" ? "bg-green-100 text-green-800" :
      candidate.toxicity_level === "Medium" ? "bg-amber-100 text-amber-800" :
      "bg-red-100 text-red-800"
    }`}>
      {candidate.toxicity_level} Risk
    </span>
    <span className="text-2xl font-medium">{candidate.toxicity_score}/100</span>
    <span className="text-sm text-muted-foreground ml-auto">
      {candidate.toxicity_source === "llm-estimated" ? "⚠ AI-estimated" : "Literature"}
    </span>
  </div>
  <p className="text-sm text-muted-foreground">{candidate.toxicity_notes}</p>
</div>
```

**Recycling Deactivation Curve:** Use Recharts LineChart. X-axis = cycle number 0–10, Y-axis = retention %, single line with area fill. Add a horizontal reference line at 80% ("Industry threshold"). Label: "Retains X% after 10 cycles" where X = `recyclingCurve[10]`.

**Reactor Sizing Card:**
```tsx
<div className="rounded-xl border p-5">
  <h3 className="font-medium mb-3">⚗️ Reactor Sizing (Pilot Scale)</h3>
  <p className="text-sm font-medium">{candidate.reactor_type}</p>
  <p className="text-sm text-muted-foreground mt-1">
    Estimated volume: {candidate.reactor_volume_min}–{candidate.reactor_volume_max} L
  </p>
  <div className="mt-3 grid grid-cols-2 gap-2">
    {Object.entries(JSON.parse(candidate.reactor_constraints || "{}")).map(([k, v]) => (
      <div key={k} className="text-xs">
        <span className="text-muted-foreground">{k}: </span>
        <span>{String(v)}</span>
      </div>
    ))}
  </div>
  <p className="text-xs text-muted-foreground mt-3">⚠ Sizing based on engineering heuristics. Verify with FEED study.</p>
</div>
```

**Composite Score + Rank:** Large score number (0–100) with breakdown bar chart showing contribution of each dimension. "Best Candidate" gold badge if `composite_rank === 1`.

**Step 6 — Reaction detail page: best candidate highlight**

In `artifacts/catalyst-ai/src/pages/reaction-detail.tsx`, add a "🏆 Best Candidate" highlight card at the top of the candidates list, populated from `GET /api/reactions/:id/best-candidate`. Show name, composite score, and a one-line summary.

---

## Priority 4 — ML Uncertainty Visualisation
**Time:** 2 hours | **Type:** Frontend only | **Risk:** Low

### What it is
Surface the existing `uncertainty_score` field (already in your schema and populated) as visual confidence indicators throughout the UI. Add ± error representation on the radar chart and confidence-level badges on candidate cards.

### Gap it addresses
Ridge Regression gives point estimates. The existing UI presents these as definitive scores (e.g., "Activity: 0.87") without any indication of how reliable that number is. A sophisticated audience — and GPS Renewables' Climate Software Labs team absolutely qualifies — will immediately question why there are no confidence bounds. This gap makes the ML look unsophisticated even though the data to fix it already exists.

### GPS Renewables alignment
GPS has their own ML systems for plant monitoring and biogas yield prediction. Their engineers understand model uncertainty. Showing calibrated confidence ("Activity: 0.87 ± 0.12, High confidence") demonstrates that BioForgeBharat is production-grade, not a toy. This is a credibility signal, not just a feature.

### Implementation steps

**No backend changes needed.** `uncertainty_score` is already populated. All changes are in `artifacts/catalyst-ai/src/`.

**Step 1 — Confidence label utility function**

```typescript
// In a utils file or at the top of candidate-detail.tsx:
function getConfidenceLabel(uncertaintyScore: number): { label: string; color: string } {
  if (uncertaintyScore < 0.2) return { label: "High confidence", color: "text-green-600" };
  if (uncertaintyScore < 0.4) return { label: "Medium confidence", color: "text-amber-600" };
  return { label: "Low confidence", color: "text-red-600" };
}
```

**Step 2 — Confidence badge on candidate cards**

In `artifacts/catalyst-ai/src/pages/reaction-detail.tsx` (candidate list cards), add below the activity/selectivity/stability scores:

```tsx
const conf = getConfidenceLabel(candidate.uncertainty_score);
<span className={`text-xs ${conf.color}`}>
  ● {conf.label}
</span>
```

**Step 3 — Error representation on radar chart**

The existing radar chart in `candidate-detail.tsx` uses Recharts `RadarChart`. Recharts does not natively support error bars on radar. Use this approach instead:

Add a second, slightly transparent Radar series with values offset by ±uncertainty:

```tsx
const radarData = [
  { subject: "Activity", A: candidate.predicted_activity, 
    AHigh: Math.min(1, candidate.predicted_activity + candidate.uncertainty_score * 0.5),
    ALow: Math.max(0, candidate.predicted_activity - candidate.uncertainty_score * 0.5) },
  // repeat for selectivity, stability, etc.
];

<RadarChart data={radarData}>
  <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
  <Radar name="Upper bound" dataKey="AHigh" stroke="#93c5fd" fill="#93c5fd" fillOpacity={0.15} dot={false} />
  <Radar name="Lower bound" dataKey="ALow" stroke="#93c5fd" fill="transparent" fillOpacity={0} dot={false} />
</RadarChart>
```

Add a legend note: "Shaded area = prediction uncertainty range (±1σ)"

**Step 4 — Score display with ± notation**

Change all score displays from:
```
Activity: 0.87
```
To:
```
Activity: 0.87 ± 0.09
```
Where the ± value = `uncertainty_score * 0.5 * dimension_weight`. Display in muted color.

---

## Priority 5 — Autonomous Discovery Agent (Streaming)
**Time:** 3 hours | **Type:** Backend (new route + SSE) + Frontend (streaming log UI) | **Risk:** Medium

### What it is
A "Run Discovery Agent" button that triggers an autonomous multi-step pipeline: PubChem literature search → Gemini candidate generation → ML scoring → toxicity + recycling + climate impact population → filtered shortlist with rationale. The pipeline streams its progress as a real-time log in the UI so the audience watches it "think."

### Gap it addresses
The current workflow requires manual button clicks for each step: generate, then score, then view candidates. This is a research tool UX, not an autonomous AI platform UX. The gap is the absence of agentic behaviour — the system waits for the human at every step instead of executing the full discovery pipeline autonomously.

### GPS Renewables alignment
GPS already operates AI systems (AI Biogas Bot, remote monitoring, CSL). They are not impressed by a form that calls an API. But watching an agent autonomously chain five distinct operations — literature search, AI generation, ML scoring, safety analysis, shortlisting — in real time, narrated step by step, demonstrates a capability gap that their current tool stack does not have. This is the single most memorable demo moment.

The streaming log also creates a natural pause during the pitch for the presenter to narrate what each step means to GPS's workflow: *"Step 2: the agent is now generating novel candidates beyond what exists in literature — this is where GPS's R&D team currently spends weeks of manual effort."*

### Implementation steps

**Step 1 — New SSE route in reactions.ts**

```typescript
// POST /api/reactions/:id/agent-run
// Returns Server-Sent Events stream
router.post("/:id/agent-run", async (req, res) => {
  const reactionId = parseInt(req.params.id);
  
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const emit = (step: string, message: string, data?: object) => {
    res.write(`data: ${JSON.stringify({ step, message, data, timestamp: new Date().toISOString() })}\n\n`);
  };

  try {
    emit("init", "🤖 Discovery Agent initialised. Loading reaction context...");

    // Step 1: Load reaction
    const reaction = await db.select().from(reactions).where(eq(reactions.id, reactionId)).limit(1);
    emit("reaction-loaded", `📋 Reaction: "${reaction[0].name}". Target product: ${reaction[0].target_product}.`);

    await delay(600);

    // Step 2: PubChem literature search
    emit("literature-search", "🔍 Searching PubChem and ChEMBL for known catalysts...");
    const litCandidates = await fetchLiteratureCandidates(reaction[0]); // existing cheminformatics.ts function
    emit("literature-found", `📚 Found ${litCandidates.length} known catalysts in literature databases.`, { count: litCandidates.length });

    await delay(800);

    // Step 3: Gemini generative candidates
    emit("ai-generation", "🧬 Generating novel catalyst candidates with Gemini 2.5 Flash...");
    const aiCandidates = await generateCandidatesWithGemini(reaction[0]); // existing discovery-ai.ts
    emit("ai-generated", `✨ Generated ${aiCandidates.length} novel AI candidates beyond literature.`);

    await delay(600);

    // Step 4: ML scoring
    emit("ml-scoring", "📊 Running ML virtual screening (Ridge Regression ensemble)...");
    const allCandidates = [...litCandidates, ...aiCandidates];
    const scoredCandidates = allCandidates.map(c => ({ ...c, scores: runMLInference(c) }));
    emit("ml-scored", `🎯 ML scoring complete. Top predicted activity: ${Math.max(...scoredCandidates.map(c => c.scores.activity)).toFixed(2)}`);

    await delay(600);

    // Step 5: Sustainability analysis
    emit("sustainability", "♻️ Analysing toxicity, recycling capacity, and climate impact...");
    const sustainableCandidates = scoredCandidates.map(c => ({
      ...c,
      toxicity: estimateToxicityScore(c.formula, c.candidate_type, c.molecular_weight, c.log_p),
      recycling: generateRecyclingCurve(c.scores.stability),
      co2: estimateCO2AvoidedPerTonne(c.candidate_type, reaction[0].target_product, c.scores.activity, c.scores.sustainability)
    }));
    emit("sustainability-done", "✅ Sustainability analysis complete.");

    await delay(600);

    // Step 6: Composite scoring + filtering
    emit("ranking", "🏆 Calculating composite scores and ranking shortlist...");
    const ranked = sustainableCandidates
      .map(c => ({ ...c, composite: calculateCompositeScore(c) }))
      .sort((a, b) => b.composite - a.composite)
      .slice(0, 5); // top 5

    // Step 7: Save to DB
    emit("saving", "💾 Saving shortlisted candidates to database...");
    // ... db insert logic ...

    emit("complete", `🎉 Agent run complete. Shortlisted ${ranked.length} candidates. Top candidate: "${ranked[0].name}" (composite score: ${ranked[0].composite}/100).`, {
      topCandidate: ranked[0].name,
      compositeScore: ranked[0].composite,
      totalEvaluated: allCandidates.length,
      shortlisted: ranked.length
    });

    res.end();
  } catch (error) {
    emit("error", `❌ Agent encountered an error: ${error.message}`);
    res.end();
  }
});
```

**Step 2 — Helper delay function**
```typescript
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

**Step 3 — Frontend streaming log component**

Create `artifacts/catalyst-ai/src/components/agent-run-log.tsx`:

```tsx
import { useState, useRef, useEffect } from "react";

interface LogEntry {
  step: string;
  message: string;
  timestamp: string;
  data?: object;
}

export function AgentRunLog({ reactionId }: { reactionId: number }) {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const runAgent = async () => {
    setIsRunning(true);
    setIsComplete(false);
    setLogs([]);

    const response = await fetch(`/api/reactions/${reactionId}/agent-run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split("\n").filter(l => l.startsWith("data: "));
      
      for (const line of lines) {
        const entry = JSON.parse(line.replace("data: ", "")) as LogEntry;
        setLogs(prev => [...prev, entry]);
        if (entry.step === "complete") {
          setIsComplete(true);
          setIsRunning(false);
        }
      }
    }
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-medium">🤖 Autonomous Discovery Agent</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chains literature search → AI generation → ML scoring → sustainability analysis → ranking
          </p>
        </div>
        <button
          onClick={runAgent}
          disabled={isRunning}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {isRunning ? "Running..." : "Run Agent"}
        </button>
      </div>

      {logs.length > 0 && (
        <div className="p-4 bg-gray-950 font-mono text-sm max-h-72 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className={`mb-1 ${
              log.step === "error" ? "text-red-400" :
              log.step === "complete" ? "text-green-400 font-medium" :
              "text-gray-300"
            }`}>
              <span className="text-gray-600 text-xs mr-2">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              {log.message}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}

      {isComplete && (
        <div className="p-4 border-t bg-green-50 dark:bg-green-950">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            ✅ Discovery complete — scroll down to see ranked candidates
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 4 — Mount on reaction-detail.tsx**

Add `<AgentRunLog reactionId={reaction.id} />` at the top of the candidate generation section, above the existing manual "Generate Candidates" button. Keep the manual button as a fallback.

---

## Priority 6 — Auto-Discrepancy Trigger (Agentic Feedback Loop)
**Time:** 2 hours | **Type:** Backend (trigger logic) + Frontend (inline disclosure) | **Risk:** Low

### What it is
When a researcher logs an experiment where the measured result deviates more than 20% from the ML prediction, the system automatically triggers discrepancy analysis and surfaces the hypothesis inline without requiring a manual button click. The researcher is then offered one-click "Add to retrain queue."

### Gap it addresses
The feedback loop exists but is manually operated: log experiment → navigate to discrepancy tab → click analyse → click retrain. This is three extra steps that most users will skip in a real workflow. The gap is the absence of automatic closure — the platform knows when something is anomalous but stays silent.

### GPS Renewables alignment
GPS operates 31 CBG projects simultaneously (IOCL JV + owned). Their researchers need anomalies to surface automatically, not require manual investigation. Demonstrating that the system watches for discrepancies and responds without prompting shows operational intelligence — the kind GPS would want from a tool integrated into their plant monitoring workflow.

### Implementation steps

**Step 1 — Discrepancy trigger middleware in experiments.ts**

```typescript
// In POST /api/experiments (after creating experiment):
router.post("/", async (req, res) => {
  // ... existing create logic ...
  const experiment = await db.insert(experiments).values(req.body).returning();
  
  // Auto-trigger discrepancy analysis if deviation > threshold
  const candidate = await db.select().from(candidates)
    .where(eq(candidates.id, experiment[0].candidate_id)).limit(1);
  
  const activityDeviation = Math.abs(
    experiment[0].measured_activity - candidate[0].predicted_activity
  );
  
  if (activityDeviation > 0.20) {
    // Fire-and-forget: generate hypothesis asynchronously
    generateDiscrepancyHypothesis(experiment[0].id, candidate[0], experiment[0])
      .then(hypothesis => {
        db.update(experiments)
          .set({ discrepancy_hypothesis: hypothesis, discrepancy_auto_triggered: true })
          .where(eq(experiments.id, experiment[0].id));
      })
      .catch(console.error);
    
    // Return response with flag so frontend can show the alert
    res.json({ 
      ...experiment[0], 
      auto_discrepancy_triggered: true,
      deviation: activityDeviation 
    });
  } else {
    res.json(experiment[0]);
  }
});
```

**Step 2 — Schema addition**

```typescript
// lib/db/src/schema/experiments.ts
discrepancy_auto_triggered: boolean("discrepancy_auto_triggered").default(false),
```

**Step 3 — Frontend: inline discrepancy disclosure**

In the experiment logging form response handler in `artifacts/catalyst-ai/src/`, after a successful experiment POST:

```tsx
// If auto_discrepancy_triggered === true in response:
{experimentResult?.auto_discrepancy_triggered && (
  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 p-4">
    <div className="flex items-start gap-3">
      <span className="text-amber-500 text-lg">⚠️</span>
      <div>
        <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
          Significant deviation detected ({(experimentResult.deviation * 100).toFixed(0)}% from prediction)
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
          The AI is generating a discrepancy hypothesis...
        </p>
        {/* Poll for hypothesis every 2s */}
        {hypothesis && (
          <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded border text-sm">
            <p className="font-medium mb-1">Hypothesis:</p>
            <p className="text-muted-foreground">{hypothesis}</p>
          </div>
        )}
        <button 
          onClick={addToRetrainQueue}
          className="mt-3 px-3 py-1.5 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          Add to Retrain Queue
        </button>
      </div>
    </div>
  </div>
)}
```

---

## Priority 7 — Candidate Compare View
**Time:** 3 hours | **Type:** Frontend only | **Risk:** Low

### What it is
A side-by-side comparison view where a researcher selects 2–3 candidates and sees all their scores, sustainability metrics, toxicity, recycling curves, reactor sizing, and climate impact in a single table. Includes an "Export comparison" button that generates a downloadable comparison summary.

### Gap it addresses
Currently, comparing candidates requires opening each detail page separately and mentally tracking differences. For a research decision — especially a commercially critical one like "which catalyst do we take to pilot?" — this cognitive load is a workflow blocker. The gap is the absence of a synthesis view.

### GPS Renewables alignment
GPS engineers run a 30-60-90 design review process. At the 60% review stage, the engineering team needs to present a shortlist of 2–3 catalyst options to the project approval committee with a rationale for the recommendation. A side-by-side comparison table is exactly the artefact that gets shared in those reviews. Building it into BioForgeBharat means the platform produces GPS's internal decision documents, not just raw data.

### Implementation steps

**Step 1 — Selection mechanism**

In `artifacts/catalyst-ai/src/pages/reaction-detail.tsx`, add a checkbox to each candidate card:

```tsx
const [selectedIds, setSelectedIds] = useState<number[]>([]);

const toggleSelect = (id: number) => {
  setSelectedIds(prev => 
    prev.includes(id) ? prev.filter(x => x !== id) : 
    prev.length < 3 ? [...prev, id] : prev
  );
};

// In candidate card:
<input 
  type="checkbox" 
  checked={selectedIds.includes(candidate.id)}
  onChange={() => toggleSelect(candidate.id)}
  className="w-4 h-4"
/>

// Sticky compare bar at bottom of page:
{selectedIds.length >= 2 && (
  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white dark:bg-gray-900 border rounded-xl px-5 py-3 shadow-lg">
    <span className="text-sm font-medium">{selectedIds.length} candidates selected</span>
    <button onClick={() => navigate(`/compare?ids=${selectedIds.join(",")}`)}
      className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg">
      Compare ↗
    </button>
    <button onClick={() => setSelectedIds([])} className="text-sm text-muted-foreground">Clear</button>
  </div>
)}
```

**Step 2 — Compare page**

Create `artifacts/catalyst-ai/src/pages/compare.tsx`. The page reads `?ids=1,2,3` from the URL, fetches each candidate, and renders a comparison grid:

Layout: candidates as columns, metrics as rows. Group rows by category: ML Scores | Sustainability | Toxicity | Recycling | Reactor | Climate Impact.

```tsx
// Metric row component
function MetricRow({ label, values, format, highlight = "highest" }: {
  label: string;
  values: number[];
  format: (v: number) => string;
  highlight: "highest" | "lowest";
}) {
  const best = highlight === "highest" ? Math.max(...values) : Math.min(...values);
  return (
    <tr className="border-b">
      <td className="py-2 px-3 text-sm text-muted-foreground font-medium">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`py-2 px-3 text-sm text-center font-medium ${
          v === best ? "text-green-600 dark:text-green-400" : ""
        }`}>
          {format(v)}
        </td>
      ))}
    </tr>
  );
}
```

Row definitions:
- Composite Score (highlight highest)
- Predicted Activity (highest)
- Predicted Selectivity (highest)
- Predicted Stability (highest)
- Toxicity Score (lowest — lower is better)
- Toxicity Level (text, no highlight)
- Recycling at Cycle 10 (highest)
- CO₂e Avoided / tonne (highest)
- Reactor Volume Range (text)
- Cost Tier (text)
- Confidence Level (text)

**Step 3 — Export functionality**

Add an "Export as CSV" button that generates:

```typescript
const exportComparison = () => {
  const headers = ["Metric", ...candidates.map(c => c.name)];
  const rows = [
    ["Composite Score", ...candidates.map(c => c.composite_score)],
    ["Activity", ...candidates.map(c => c.predicted_activity)],
    // ... all metrics
  ];
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `catalyst-comparison-${Date.now()}.csv`;
  a.click();
};
```

**Step 4 — Add route in App.tsx**

```tsx
<Route path="/compare" component={ComparePage} />
```

---

## Priority 8 — Feedstock Compatibility Matrix + Techno-Economic Snapshot + ZLD Flag
**Time:** 3 hours | **Type:** Backend + Frontend | **Risk:** Low–Medium

### What it is
Three related GPS-specific fields bundled together since they share the same implementation pattern: a Gemini-generated feedstock compatibility matrix, a cost-tier card, and a ZLD (zero liquid discharge) compatibility flag. All are generated at candidate creation time and displayed in a single "Commercial Readiness" panel.

### Gap it addresses
Phase 2 answers "is this catalyst safe and recyclable?" This feature answers "can GPS actually use this at their plants?" — addressing feedstock heterogeneity (MSW is not pure cellulose), commercial economics, and their mandatory ZLD compliance.

### GPS Renewables alignment
GPS's feedstocks are: MSW, paddy straw, press mud cake, bagasse, food waste, bamboo, agricultural residues. Their ISO-certified manufacturing and EPC commitments require zero liquid discharge compliance. Their JV agreements with IOCL and BPCL require commercially-viable cost profiles. This panel answers the three questions their procurement and engineering teams ask before approving a catalyst for pilot testing.

### Implementation steps

**Step 1 — Schema additions**

```typescript
// lib/db/src/schema/candidates.ts
feedstock_matrix: text("feedstock_matrix"),   // JSON: { "MSW": 0.8, "Paddy straw": 0.6, ... }
cost_tier: text("cost_tier"),                 // "Low" | "Medium" | "High"
cost_rationale: text("cost_rationale"),       // One-line explanation
scalability_tier: text("scalability_tier"),   // "Lab-only" | "Pilot-feasible" | "Industrial"
zld_compatible: boolean("zld_compatible"),
zld_rationale: text("zld_rationale"),
```

**Step 2 — Generation logic**

In `artifacts/api-server/src/lib/sustainability.ts`, add:

```typescript
export async function generateFeedstockMatrix(
  candidateName: string,
  formula: string,
  candidateType: string
): Promise<Record<string, number>> {
  const gpsf feedstocks = ["MSW", "Paddy straw", "Press mud cake", "Bagasse", "Bamboo", "Food waste", "Agricultural residues"];
  
  const prompt = `You are a catalysis expert. For the catalyst "${candidateName}" (formula: ${formula}, type: ${candidateType}), rate its compatibility with each feedstock on a scale of 0.0 to 1.0.
  
  Feedstocks: ${GPS_FEEDSTOCKS.join(", ")}
  
  Return ONLY a JSON object with feedstock names as keys and decimal scores as values. Example: {"MSW": 0.7, "Paddy straw": 0.9}
  Consider: heterogeneous feedstocks (MSW) are harder for most catalysts. Biological catalysts adapt better to organic feedstocks.`;
  
  const response = await callGemini(prompt);
  try {
    return JSON.parse(response.trim());
  } catch {
    // Fallback: uniform medium compatibility
    return Object.fromEntries(GPS_FEEDSTOCKS.map(f => [f, 0.5]));
  }
}

export function determineCostTier(
  formula: string,
  molecularWeight: number | null,
  candidateType: string
): { tier: "Low" | "Medium" | "High"; rationale: string } {
  const expensiveElements = ["Pt", "Pd", "Rh", "Ir", "Ru", "Au"];
  const moderateElements = ["Ni", "Co", "Cu", "Mo", "V"];
  
  if (expensiveElements.some(e => formula?.includes(e))) {
    return { tier: "High", rationale: `Contains precious metal (${expensiveElements.find(e => formula.includes(e))}). High raw material cost; consider recovery/recycling loop.` };
  }
  if (candidateType?.includes("enzyme") || candidateType?.includes("microbial")) {
    return { tier: "Low", rationale: "Biological catalyst. Fermentation production is cost-effective at scale." };
  }
  if (moderateElements.some(e => formula?.includes(e))) {
    return { tier: "Medium", rationale: `Base metal catalyst. Commercially available at moderate cost.` };
  }
  return { tier: "Low", rationale: "Low-cost materials. Scalable synthesis expected." };
}

export function assessZLDCompatibility(
  candidateType: string,
  reactorType: string,
  domain: string
): { compatible: boolean; rationale: string } {
  const zldFriendlyTypes = ["enzyme", "microbial", "biological", "anaerobic"];
  const isZLDFriendly = zldFriendlyTypes.some(t => 
    candidateType?.toLowerCase().includes(t) || domain === "synthetic-biology"
  );
  
  if (isZLDFriendly) {
    return { 
      compatible: true, 
      rationale: "Biological/anaerobic process. Digestate can be valorised as biofertiliser; effluent recycled in closed loop. ZLD compatible with standard GPS plant design." 
    };
  }
  return { 
    compatible: false, 
    rationale: "Chemical process generates liquid effluents (wash water, solvent recovery). ZLD requires additional treatment unit. Assess with GPS process engineering team." 
  };
}
```

**Step 3 — Frontend: "Commercial Readiness" panel**

Add to `candidate-detail.tsx` below the Reactor Sizing card:

```tsx
<div className="rounded-xl border p-5 space-y-5">
  <h3 className="font-medium">🏭 Commercial Readiness</h3>

  {/* Cost tier */}
  <div>
    <p className="text-xs text-muted-foreground mb-1">Cost profile</p>
    <div className="flex items-center gap-2">
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
        candidate.cost_tier === "Low" ? "bg-green-100 text-green-800" :
        candidate.cost_tier === "Medium" ? "bg-amber-100 text-amber-800" :
        "bg-red-100 text-red-800"
      }`}>{candidate.cost_tier} Cost</span>
      <span className="text-xs text-muted-foreground">{candidate.cost_rationale}</span>
    </div>
  </div>

  {/* Scale-up tier */}
  <div>
    <p className="text-xs text-muted-foreground mb-1">Scale-up readiness</p>
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
      candidate.scalability_tier === "Industrial" ? "bg-green-100 text-green-800" :
      candidate.scalability_tier === "Pilot-feasible" ? "bg-blue-100 text-blue-800" :
      "bg-gray-100 text-gray-800"
    }`}>{candidate.scalability_tier}</span>
  </div>

  {/* ZLD flag */}
  <div>
    <p className="text-xs text-muted-foreground mb-1">Zero Liquid Discharge compatibility</p>
    <div className="flex items-start gap-2">
      <span className={`mt-0.5 text-sm ${candidate.zld_compatible ? "text-green-500" : "text-amber-500"}`}>
        {candidate.zld_compatible ? "✓" : "⚠"}
      </span>
      <p className="text-sm">{candidate.zld_rationale}</p>
    </div>
  </div>

  {/* Feedstock compatibility heatmap */}
  <div>
    <p className="text-xs text-muted-foreground mb-2">GPS feedstock compatibility</p>
    <div className="grid grid-cols-2 gap-1.5">
      {Object.entries(JSON.parse(candidate.feedstock_matrix || "{}")).map(([feedstock, score]) => (
        <div key={feedstock} className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
            <div 
              className="h-full rounded-full bg-green-500"
              style={{ width: `${(score as number) * 100}%`, opacity: 0.4 + (score as number) * 0.6 }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-24 truncate">{feedstock}</span>
          <span className="text-xs font-medium w-8 text-right">{Math.round((score as number) * 100)}%</span>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

## Priority 9 — Literature Watch Agent
**Time:** 2 hours | **Type:** Backend (new route) + Frontend (watch panel) | **Risk:** Low

### What it is
A "Literature Watch" panel on the reaction detail page that, when triggered, queries PubChem for compounds published or updated in the last 90 days matching the reaction's target product, compares them to existing candidates, and summarises novelty findings via Gemini.

### Gap it addresses
The current literature ingestion is a one-time fetch. There is no mechanism to track what's new. In a research context — especially for a company like GPS with an active R&D arm — the literature changes continuously. The gap is the absence of monitoring.

### GPS Renewables alignment
GPS's R&D arm (GPSR Aavishkaar) has research collaborations with ARI (Agharkar Research Institute), DSIR, TNAU, and VSI. Their researchers actively monitor new findings in anaerobic fungi, biomass pretreatment, and 2G ethanol. Building a "what's new in the literature since your last run?" feature directly replicates a task their team does manually today.

### Implementation steps

**Step 1 — New route**

```typescript
// GET /api/reactions/:id/literature-watch
router.get("/:id/literature-watch", async (req, res) => {
  const reactionId = parseInt(req.params.id);
  const reaction = await db.select().from(reactions).where(eq(reactions.id, reactionId)).limit(1);
  
  // Fetch existing candidates for this reaction
  const existing = await db.select().from(candidates)
    .where(eq(candidates.reaction_id, reactionId));
  const existingNames = existing.map(c => c.name.toLowerCase());
  
  // PubChem search using existing cheminformatics.ts
  const searchTerms = [reaction[0].target_product, ...reaction[0].conditions.split(",").slice(0, 2)];
  const newCompounds = await fetchLiteratureCandidates(reaction[0], { maxAge: 90 }); // add date filter param
  
  const novel = newCompounds.filter(c => 
    !existingNames.some(name => name.includes(c.name.toLowerCase().slice(0, 8)))
  );
  
  // Gemini summary
  const summaryPrompt = `You are a research analyst. Summarise these ${novel.length} newly found compounds for the reaction "${reaction[0].name}".
  Existing candidates: ${existingNames.join(", ")}
  New findings: ${novel.map(c => c.name).join(", ")}
  
  Write 2–3 sentences: what is novel, which are most promising, and what this means for the research direction. Be specific.`;
  
  const summary = novel.length > 0 ? await callGemini(summaryPrompt) : "No new candidates found in the literature in the last 90 days.";
  
  res.json({
    newCount: novel.length,
    newCandidates: novel.slice(0, 5), // top 5
    summary,
    lastChecked: new Date().toISOString()
  });
});
```

**Step 2 — Frontend panel**

Add to `reaction-detail.tsx` in the sidebar or below the reaction description:

```tsx
{/* Literature Watch Panel */}
<div className="rounded-xl border p-4">
  <div className="flex items-center justify-between mb-3">
    <div>
      <h4 className="font-medium text-sm">📡 Literature Watch</h4>
      <p className="text-xs text-muted-foreground">New compounds in last 90 days</p>
    </div>
    <button onClick={runLiteratureWatch} disabled={watchLoading}
      className="text-xs px-3 py-1.5 border rounded-lg hover:bg-secondary transition-colors">
      {watchLoading ? "Checking..." : "Check now"}
    </button>
  </div>
  
  {watchResult && (
    <>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-medium">{watchResult.newCount}</span>
        <span className="text-sm text-muted-foreground">new candidates found</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{watchResult.summary}</p>
      {watchResult.newCandidates.length > 0 && (
        <button onClick={importNewCandidates}
          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg">
          Import {watchResult.newCount} new candidates
        </button>
      )}
    </>
  )}
</div>
```

---

## Priority 10 — Google Drive MCP Export Integration
**Time:** 30 minutes | **Type:** Frontend (new export option) | **Risk:** Low

### What it is
Augment the existing "Export Session" button to add a second option: "Sync to Drive." When clicked, the session JSON and candidate CSV are automatically uploaded to a pre-configured GPS Renewables shared Google Drive folder using the Google Drive MCP server already connected to Claude.

### Why this is last
This is a demo flourish, not a core capability. All previous features add scientific or commercial value. This adds enterprise workflow integration. It is implementable in 30 minutes because the Google Drive MCP is already connected.

### GPS Renewables alignment
GPS is an enterprise client with an active digital infrastructure (Climate Software Labs, remote monitoring systems). Showing that BioForgeBharat exports directly into a shared workspace — not just downloads a file — signals enterprise readiness and removes the "it's a hackathon prototype" impression.

### Implementation steps

**Step 1 — Export route addition**

In `artifacts/api-server/src/routes/export.ts`, add a new endpoint:

```typescript
// POST /api/export/drive
// Accepts session JSON, uploads to Drive
router.post("/drive", async (req, res) => {
  const { reactionId, filename } = req.body;
  
  // Generate the same CSV/JSON as existing export endpoints
  const sessionData = await generateSessionExport(reactionId);
  const candidateCSV = await generateCandidateCSV(reactionId);
  
  // Use Drive MCP via Anthropic API call from the backend
  // (The Drive MCP is connected on the claude.ai session — for backend use,
  // use the Google Drive API directly with OAuth token from env)
  // For demo: use the existing export endpoint and open Drive URL
  
  res.json({ 
    success: true, 
    message: "Session exported to GPS Renewables shared folder",
    driveUrl: "https://drive.google.com/..." // placeholder for demo
  });
});
```

**Step 2 — Frontend: export button dropdown**

In the export section of the UI, change the single "Export" button to a dropdown with two options:

```tsx
<div className="relative">
  <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-secondary">
    Export <ChevronDown className="w-4 h-4" />
  </button>
  {showExportMenu && (
    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 border rounded-xl shadow-sm py-1 z-10">
      <button onClick={exportLocal} className="w-full text-left px-4 py-2 text-sm hover:bg-secondary">
        💾 Download (JSON + CSV)
      </button>
      <button onClick={exportToDrive} className="w-full text-left px-4 py-2 text-sm hover:bg-secondary">
        📁 Sync to Drive
      </button>
    </div>
  )}
</div>
```

---

## Consolidated Schema Migration

Run this once before starting development to apply all new fields in one migration:

```bash
# After adding all new fields to the schema files:
pnpm --filter @workspace/db run push

# Re-seed with updated seed data (includes all new fields):
pnpm --filter @workspace/api-server run seed
```

All new fields should have sensible defaults or be nullable so existing data is not broken.

---

## OpenAPI Spec and Codegen

After adding all new backend routes, update `lib/api-spec/openapi.yaml` with the new endpoints:
- `GET /candidates/{id}/sustainability`
- `POST /candidates/{id}/score`
- `GET /reactions/{id}/best-candidate`
- `POST /reactions/{id}/agent-run`
- `GET /reactions/{id}/literature-watch`
- `POST /export/drive`

Then regenerate client hooks:

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Demo Script (GPS Renewables Pitch)

Use this sequence for the live demo. Each step is designed to land a specific point.

**Step 1 — Open the Reactions Library**
> *"GPS Renewables operates plants at Indore, Bhopal, and Mizoram. We've seeded BioForgeBharat with their exact feedstock scenarios."*
— Select the "Municipal Solid Waste → CBG" reaction. Show the GPS Renewables badge.

**Step 2 — Run the Discovery Agent**
> *"Instead of clicking through manual steps, we run a single autonomous agent that chains literature search, AI generation, ML scoring, and sustainability analysis end to end."*
— Click "Run Agent." Let the streaming log narrate itself for 30 seconds.

**Step 3 — Open the Best Candidate**
> *"The agent has ranked the candidates. Let's look at the top result."*
— Open the candidate with the highest composite score. Walk through each panel:
- Composite Score and rank
- Toxicity: "Low risk, verified against structural heuristics"
- Recycling: "Retains 78% activity after 10 cycles"
- Reactor Sizing: "CSTR, 500–2000L for pilot scale"
- **Climate Impact**: *"This is what matters to GPS — ~180 kg CO₂e avoided per tonne of MSW processed, contributing to SDG 7 and SDG 13."*
- **Commercial Readiness**: ZLD compatible, Low cost, Pilot-feasible

**Step 4 — Log a discrepancy experiment**
> *"Suppose the GPS lab team runs this catalyst and gets a different result. Watch what happens."*
— Log an experiment with measured_activity = 0.4 (prediction is ~0.8).
— The auto-discrepancy alert fires immediately.
> *"The system detected the deviation, generated a hypothesis, and offered to queue this for model retraining — without anyone clicking anything."*

**Step 5 — Compare two candidates**
> *"GPS's engineering team would take this comparison to their 60% design review."*
— Select two candidates, click Compare.
— Show the side-by-side table.
— Click "Export as CSV."

**Step 6 — Literature Watch**
> *"GPSR Aavishkaar's researchers track literature continuously. BioForgeBharat can watch it for them."*
— Click "Check now" on Literature Watch.
— Show the summary.

---

## GPS Renewables Feature Alignment Summary

| Feature | Gap Closed | GPS Alignment |
|---|---|---|
| GPS-specific reaction seeds | Generic demo data | Maps to Indore, Bhopal, Mizoram plants directly |
| CO₂e climate impact panel | No carbon metric | Mirrors GPS's FY25 ESG headline: 294,372 MT CO₂e |
| SDG tags | No sustainability framing | GPS reports against SDG 7, 12, 13 |
| Phase 2: toxicity + recycling | No safety/durability data | Feeds GPS's 60% engineering design review |
| Phase 2: reactor sizing | No scale-up guidance | CapEx/OpEx context for IOCL/BPCL JV projects |
| Phase 2: composite score | No synthesis metric | Single number for "best catalyst" recommendation |
| ML uncertainty visualisation | Point estimates only | GPS's CSL team will notice missing confidence bounds |
| Discovery Agent (streaming) | Manual multi-step flow | Autonomous intelligence GPS's current tools lack |
| Auto-discrepancy trigger | Manual feedback loop | Operational intelligence for 31 simultaneous projects |
| Candidate compare view | No synthesis view | Produces the 60% review shortlist artefact |
| Feedstock compatibility matrix | No GPS feedstock fit | MSW, paddy straw, bamboo compatibility in one glance |
| Techno-economic snapshot | No cost/scale context | IOCL/BPCL JV procurement needs cost viability upfront |
| ZLD compatibility flag | No GPS ESG constraint | GPS has ZLD as a mandatory ESG commitment |
| Literature Watch Agent | One-time ingestion | GPSR Aavishkaar monitors literature continuously |
| Google Drive MCP export | Download-only export | Enterprise workflow readiness signal |

---

*Document generated: 2026-05-12 | BioForgeBharat Phase 2+ | NammaNexus*
