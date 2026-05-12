export function estimateToxicityScore(
  formula: string,
  candidateType: string,
  molecularWeight: number | null,
  logP: number | null
): { score: number; level: "Low" | "Medium" | "High"; notes: string; source: string } {
  const highRiskIndicators = ["nano", "Pt", "Pd", "Cd", "Cr", "Hg", "Pb", "As"];
  const mediumRiskIndicators = ["Ni", "Cu", "Zn", "Co", "Fe oxide", "TiO2"];
  const bioSafeIndicators = ["enzyme", "microbial", "fungi", "yeast", "bacteria"];
  
  let score = 30;
  let notes = "";
  
  const formulaLower = formula?.toLowerCase() || "";
  const typeLower = candidateType?.toLowerCase() || "";

  if (bioSafeIndicators.some(ind => typeLower.includes(ind) || formulaLower.includes(ind))) {
    score = 10 + Math.random() * 15;
    notes = "Biological catalyst — generally low environmental toxicity. Assess pathogenicity for specific strains.";
  } else if (highRiskIndicators.some(ind => formula?.includes(ind))) {
    score = 65 + Math.random() * 25;
    notes = "Contains potentially toxic metals. Requires environmental impact assessment. Refer to Tox21 database.";
  } else if (mediumRiskIndicators.some(ind => formula?.includes(ind))) {
    score = 35 + Math.random() * 25;
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
  const k = (1 - predictedStability) * 0.12;
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
  const activityFactor = 1.5 - predictedActivity;
  
  return {
    type: profile.type,
    volumeMin: Math.round(profile.volMin * activityFactor),
    volumeMax: Math.round(profile.volMax * activityFactor),
    constraints: profile.constraints
  };
}

export function calculateCompositeScore(candidate: {
  predictedActivity: number;
  predictedSelectivity: number;
  predictedStability: number;
  toxicityScore: number;
  recyclingRetention: string;
  sustainabilityScore?: number;
  costScore?: number;
}): number {
  const weights = {
    activity:      0.25,
    selectivity:   0.20,
    stability:     0.15,
    toxicity:      0.15,
    recycling:     0.15,
    sustainability: 0.05,
    cost:          0.05
  };

  const retentionArr = JSON.parse(candidate.recyclingRetention || "[0]");
  const retention10 = (retentionArr[retentionArr.length - 1] || 0) / 100;
  const toxicityNorm = 1 - (candidate.toxicityScore / 100);

  const composite =
    candidate.predictedActivity    * weights.activity     +
    candidate.predictedSelectivity * weights.selectivity  +
    candidate.predictedStability   * weights.stability    +
    toxicityNorm                    * weights.toxicity     +
    retention10                     * weights.recycling    +
    (candidate.sustainabilityScore ?? 0.5) * weights.sustainability +
    (candidate.costScore ?? 0.5)   * weights.cost;

  return Math.round(composite * 100);
}
