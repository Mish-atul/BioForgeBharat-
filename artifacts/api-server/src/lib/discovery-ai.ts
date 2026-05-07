import type { Reaction } from "@workspace/db";
import { extractJsonArray, generateGeminiText } from "./ai";

export interface DiscoveryCandidate {
  name: string;
  formula: string;
  candidateType: string;
  routeType: string;
  predictedActivity: number;
  predictedSelectivity: number;
  predictedStability: number;
  confidenceScore: number;
  feedstockFitScore: number;
  costScore: number;
  sustainabilityScore: number;
  scalabilityScore: number;
  uncertaintyScore: number;
  mechanismText: string;
  structureData: string;
  evidenceText: string;
  energyProfileData: string | null;
  pathwayData: string | null;
}

function clampScore(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(1, n));
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function jsonString(value: unknown, fallback: unknown): string {
  if (typeof value === "string" && value.trim()) {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify(fallback);
    }
  }
  if (value && typeof value === "object") return JSON.stringify(value);
  return JSON.stringify(fallback);
}

function normalizeCandidate(raw: Record<string, unknown>, reaction: Reaction, i: number): DiscoveryCandidate {
  const isBio = reaction.domain === "synthetic-biology";
  const fallbackStructure = {
    nodes: [
      { id: isBio ? "Gene" : "Active site", x: 45, y: 75 },
      { id: isBio ? "Flux" : "Support", x: 135, y: 75 },
    ],
    edges: [{ from: isBio ? "Gene" : "Active site", to: isBio ? "Flux" : "Support" }],
  };
  const fallbackEnergy = {
    steps: [
      { label: "Reactants", energy: 0 },
      { label: "Adsorbed", energy: -0.18 - i * 0.02 },
      { label: "Transition", energy: 0.42 - i * 0.03 },
      { label: "Products", energy: -0.32 - i * 0.01 },
    ],
  };
  const fallbackPathway = {
    nodes: [
      { id: "feedstock", label: "Feedstock", flux: 100 },
      { id: "intermediate", label: "Intermediate", flux: 78 - i * 3 },
      { id: "product", label: reaction.targetProduct, flux: 62 - i * 2 },
    ],
    edits: ["Overexpress rate-limiting enzyme", "Knock down by-product branch"],
    bottlenecks: ["NADH balance", "Product tolerance"],
  };

  return {
    name: stringValue(raw.name, isBio ? `Engineered BioRoute ${i + 1}` : `Bharat Catalyst ${i + 1}`),
    formula: stringValue(raw.formula, isBio ? "S. cerevisiae pathway edit" : "M/ZSM-5 variant"),
    candidateType: stringValue(raw.candidateType, isBio ? "microbial-pathway" : "heterogeneous-catalyst"),
    routeType: stringValue(raw.routeType, isBio ? "synthetic-biology" : "chemical-catalysis"),
    predictedActivity: clampScore(raw.predictedActivity, 0.78 - i * 0.03),
    predictedSelectivity: clampScore(raw.predictedSelectivity, 0.82 - i * 0.02),
    predictedStability: clampScore(raw.predictedStability, 0.76 - i * 0.025),
    confidenceScore: clampScore(raw.confidenceScore, 0.72 - i * 0.015),
    feedstockFitScore: clampScore(raw.feedstockFitScore, 0.84 - i * 0.02),
    costScore: clampScore(raw.costScore, 0.78 - i * 0.015),
    sustainabilityScore: clampScore(raw.sustainabilityScore, 0.86 - i * 0.012),
    scalabilityScore: clampScore(raw.scalabilityScore, 0.8 - i * 0.02),
    uncertaintyScore: clampScore(raw.uncertaintyScore, 0.18 + i * 0.025),
    mechanismText: stringValue(
      raw.mechanismText,
      isBio
        ? "The design redirects carbon flux toward the target product by improving the rate-limiting enzymatic step and reducing competing by-product formation."
        : "The design combines tuned acid sites with a metal or oxide active phase to balance dehydration, C-C coupling, and product-range selectivity.",
    ),
    structureData: jsonString(raw.structureData, fallbackStructure),
    evidenceText: stringValue(
      raw.evidenceText,
      "Generated from seeded literature patterns, reaction conditions, India-relevant feedstock constraints, and deterministic scoring rules for the hackathon sandbox.",
    ),
    energyProfileData: isBio ? null : jsonString(raw.energyProfileData, fallbackEnergy),
    pathwayData: isBio ? jsonString(raw.pathwayData, fallbackPathway) : null,
  };
}

export function fallbackDiscoveryCandidates(reaction: Reaction, count: number): DiscoveryCandidate[] {
  const isBio = reaction.domain === "synthetic-biology";
  const catalystNames = [
    ["Ni-La/HZSM-5 Water-Tolerant", "Ni·La₂O₃/SiO₂·Al₂O₃", "La promoter stabilizes Ni dispersion and reduces water-induced deactivation during ethanol-to-jet upgrading."],
    ["Cu-ZnO/SAPO-34 Tandem", "Cu·ZnO/SAPO-34", "Cu-ZnO controls oxygenate activation while SAPO-34 shape-selective acidity favors C8-C12 hydrocarbon formation."],
    ["CoFe₂O₄/H-Beta Spinel", "CoFe₂O₄/BEA", "Spinel redox sites resist sintering and H-Beta pores improve jet-range selectivity."],
    ["In₂O₃-ZrO₂ Methanol Selective", "In₂O₃·ZrO₂", "Oxygen vacancies support CO2 activation while ZrO2 improves thermal durability for green methanol."],
    ["Hierarchical ZSM-5 Core-Shell Ni", "Ni@SiO₂/HZSM-5", "A thin silica shell controls diffusion and slows coke formation around the Ni active phase."],
  ];
  const bioNames = [
    ["S. cerevisiae PDC1↑ ADH2Δ GPD1Δ", "S. cerevisiae PDC1↑ ADH2Δ GPD1Δ", "Redirects pyruvate and acetaldehyde flux toward ethanol while suppressing glycerol and ethanol re-oxidation."],
    ["Zymomonas mobilis Xylose+ SAF Precursor", "Z. mobilis xylA/xylB↑ adhB↑", "Adds C5 sugar utilization to improve Indian lignocellulosic feedstock fit."],
    ["Clostridium ljungdahlii Syngas-Ethanol", "C. ljungdahlii adhE2↑ acsB↑", "Improves Wood-Ljungdahl pathway flux from syngas toward ethanol."],
    ["E. coli Fatty Alcohol Route", "E. coli atoB↑ fadDΔ acr1↑", "Builds hydrocarbon precursor pathway with reduced beta-oxidation drain."],
    ["Cellulase Cocktail Thermostable Mix", "Cel7A-E217Q + Bgl1↑", "Raises biomass saccharification stability before fermentation."],
  ];

  return Array.from({ length: count }, (_, i) => {
    const [name, formula, mechanism] = (isBio ? bioNames : catalystNames)[i % 5];
    const uniqueName = `${name} v${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
    return normalizeCandidate(
      {
        name: uniqueName,
        formula,
        mechanismText: mechanism,
        predictedActivity: 0.88 - i * 0.035,
        predictedSelectivity: 0.84 - i * 0.025,
        predictedStability: 0.82 - i * 0.02,
        confidenceScore: 0.76 - i * 0.015,
        feedstockFitScore: 0.9 - i * 0.025,
        costScore: 0.8 - i * 0.03,
        sustainabilityScore: 0.92 - i * 0.018,
        scalabilityScore: 0.84 - i * 0.02,
        uncertaintyScore: 0.16 + i * 0.025,
      },
      reaction,
      i,
    );
  });
}

export async function generateDiscoveryCandidates(reaction: Reaction, count: number): Promise<DiscoveryCandidate[]> {
  const isBio = reaction.domain === "synthetic-biology";
  const system = isBio
    ? "You are a synthetic biology platform agent for enzyme engineering, metabolic flux, microbial pathway design, and safe human-in-the-loop recommendations."
    : "You are a computational catalysis platform agent for sustainable fuels, catalyst design, reaction energy profiles, and explainable screening.";

  const prompt = `Generate exactly ${count} novel candidate designs for BioForgeBharat.

Reaction: ${reaction.name}
Equation: ${reaction.equation}
Target product: ${reaction.targetProduct}
Conditions: ${reaction.conditions}
Domain: ${reaction.domain}

Return only a JSON array. Each object must include:
name, formula, candidateType, routeType, predictedActivity, predictedSelectivity, predictedStability, confidenceScore,
feedstockFitScore, costScore, sustainabilityScore, scalabilityScore, uncertaintyScore,
mechanismText, structureData, evidenceText, energyProfileData, pathwayData.

Scores must be 0 to 1. structureData, energyProfileData, and pathwayData may be JSON objects. For chemical catalysis include energyProfileData steps. For synthetic biology include pathwayData nodes, edits, and bottlenecks.`;

  const text = await generateGeminiText({ system, prompt });
  const parsed = text ? extractJsonArray(text) : null;
  if (!parsed || parsed.length === 0) return fallbackDiscoveryCandidates(reaction, count);

  return parsed.slice(0, count).map((raw, i) => normalizeCandidate(raw, reaction, i));
}

export async function generateDiscrepancyHypothesis(input: {
  candidateName: string;
  candidateFormula: string;
  reactionEquation: string;
  conditions: string;
  mechanismText: string;
  predictedActivity: number;
  measuredActivity: number;
  predictedSelectivity: number;
  measuredSelectivity: number;
  measuredYield: number;
  notes: string | null;
}): Promise<string> {
  const activityDiff = input.measuredActivity - input.predictedActivity;
  const selectivityDiff = input.measuredSelectivity - input.predictedSelectivity;
  const performance = activityDiff > 0.05 ? "exceeded" : activityDiff < -0.05 ? "underperformed" : "matched";
  const fallback = `${input.candidateName} ${performance} the predicted activity by ${(activityDiff * 100).toFixed(1)} percentage points and selectivity by ${(selectivityDiff * 100).toFixed(1)} percentage points. The likely gap is an underweighted stability or transport feature under the stated process conditions, especially water tolerance, active-site accessibility, or competing by-product formation. The next experiment should isolate this factor with a controlled temperature/feed-water sweep and compare fresh versus spent catalyst or strain/pathway markers before retraining.`;

  const prompt = `Analyze this prediction-vs-actual gap for a molecular discovery platform.

Candidate: ${input.candidateName} (${input.candidateFormula})
Reaction: ${input.reactionEquation}
Conditions: ${input.conditions}
Mechanism: ${input.mechanismText}
Predicted activity: ${(input.predictedActivity * 100).toFixed(1)}%
Measured activity: ${(input.measuredActivity * 100).toFixed(1)}%
Predicted selectivity: ${(input.predictedSelectivity * 100).toFixed(1)}%
Measured selectivity: ${(input.measuredSelectivity * 100).toFixed(1)}%
Measured yield: ${(input.measuredYield * 100).toFixed(1)}%
Notes: ${input.notes ?? "None"}

Return 3 concise sentences: probable cause, underweighted feature, next experiment.`;

  const text = await generateGeminiText({
    system: "You are a scientific critique agent. Avoid overclaiming; produce explainable, human-in-the-loop hypotheses.",
    prompt,
  });
  return text?.trim() || fallback;
}

