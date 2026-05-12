import type { Reaction } from "@workspace/db";
import { extractJsonArray, generateGeminiText } from "./ai";
import { generateMLCandidates } from "./ml_model";
import { logger } from "./logger";
import { estimateCO2AvoidedPerTonne, assignSDGTags } from "./climate";
import { estimateToxicityScore, generateRecyclingCurve, estimateReactorSizing, calculateCompositeScore } from "./sustainability";

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
  co2AvoidedPerTonne: number;
  sdgTags: string;
  climateNarrative: string;
  toxicityScore: number;
  toxicityLevel: string;
  toxicityNotes: string;
  toxicitySource: string;
  recyclingRetention: string;
  reactorType: string;
  reactorVolumeMin: number;
  reactorVolumeMax: number;
  reactorConstraints: string;
  compositeScore: number;
}

// ... helper functions ...
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

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
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

  const name = stringValue(raw.name, isBio ? `Engineered BioRoute ${i + 1}` : `Bharat Catalyst ${i + 1}`);
  const formula = stringValue(raw.formula, isBio ? "S. cerevisiae pathway edit" : "M/ZSM-5 variant");
  const candidateType = stringValue(raw.candidateType, isBio ? "microbial-pathway" : "heterogeneous-catalyst");
  const predictedActivity = clampScore(raw.predictedActivity, 0.78 - i * 0.03);
  const predictedSelectivity = clampScore(raw.predictedSelectivity, 0.82 - i * 0.02);
  const predictedStability = clampScore(raw.predictedStability, 0.76 - i * 0.025);
  const sustainabilityScore = clampScore(raw.sustainabilityScore, 0.86 - i * 0.012);
  const targetProduct = reaction.targetProduct;

  const co2Avoided = estimateCO2AvoidedPerTonne(candidateType, targetProduct, predictedActivity, sustainabilityScore);
  const sdgTags = assignSDGTags(targetProduct, reaction.domain);
  const climateNarrative = `Enables ~${co2Avoided} kg CO2e reduction per tonne of feedstock, directly supporting ${sdgTags.join(" and ")}.`;

  const toxicity = estimateToxicityScore(formula, candidateType, raw.molecularWeight as number | null, raw.logP as number | null);
  const recyclingCurve = generateRecyclingCurve(predictedStability);
  const reactor = estimateReactorSizing(reaction.domain, targetProduct, predictedActivity);

  const compositeScore = calculateCompositeScore({
    predictedActivity,
    predictedSelectivity,
    predictedStability,
    toxicityScore: toxicity.score,
    recyclingRetention: JSON.stringify(recyclingCurve),
    sustainabilityScore,
    costScore: clampScore(raw.costScore, 0.78 - i * 0.015)
  });

  return {
    name,
    formula,
    candidateType,
    routeType: stringValue(raw.routeType, isBio ? "synthetic-biology" : "chemical-catalysis"),
    predictedActivity,
    predictedSelectivity,
    predictedStability,
    confidenceScore: clampScore(raw.confidenceScore, 0.72 - i * 0.015),
    feedstockFitScore: clampScore(raw.feedstockFitScore, 0.84 - i * 0.02),
    costScore: clampScore(raw.costScore, 0.78 - i * 0.015),
    sustainabilityScore,
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
    co2AvoidedPerTonne: co2Avoided,
    sdgTags: JSON.stringify(sdgTags),
    climateNarrative,
    toxicityScore: toxicity.score,
    toxicityLevel: toxicity.level,
    toxicityNotes: toxicity.notes,
    toxicitySource: toxicity.source,
    recyclingRetention: JSON.stringify(recyclingCurve),
    reactorType: reactor.type,
    reactorVolumeMin: reactor.volumeMin,
    reactorVolumeMax: reactor.volumeMax,
    reactorConstraints: JSON.stringify(reactor.constraints),
    compositeScore
  };
}

const CATALYST_POOL: [string, string, string][] = [
  ["Ni-La/HZSM-5 Water-Tolerant", "Ni·La₂O₃/SiO₂·Al₂O₃", "La promoter stabilizes Ni dispersion and reduces water-induced deactivation during ethanol-to-jet upgrading."],
  ["Cu-ZnO/SAPO-34 Tandem", "Cu·ZnO/SAPO-34", "Cu-ZnO controls oxygenate activation while SAPO-34 shape-selective acidity favors C8-C12 hydrocarbon formation."],
  ["CoFe₂O₄/H-Beta Spinel", "CoFe₂O₄/BEA", "Spinel redox sites resist sintering and H-Beta pores improve jet-range selectivity."],
  ["In₂O₃-ZrO₂ Methanol Selective", "In₂O₃·ZrO₂", "Oxygen vacancies support CO₂ activation while ZrO₂ improves thermal durability for green methanol."],
  ["Hierarchical ZSM-5 Core-Shell Ni", "Ni@SiO₂/HZSM-5", "A thin silica shell controls diffusion and slows coke formation around the Ni active phase."],
  ["Pd-Ga Single Atom Alloy", "Pd₁Ga₃/CeO₂", "Isolated Pd atoms on Ga₃ sites achieve near-unity CO₂ selectivity with minimal H₂ consumption."],
  ["Fe-Mn/K₂O Fischer-Tropsch", "Fe₃Mn₁/K₂O-Al₂O₃", "Potassium promotion shifts FT product slate toward olefins, while Mn improves iron carbide stability."],
  ["Ru-MoS₂ Hydrodeoxygenation", "Ru/MoS₂-TiO₂", "Sulfide-phase Ru edges selectively cleave C–O bonds in pyrolysis bio-oil without ring saturation."],
  ["Cu₃Sn Intermetallic CO₂RR", "Cu₃Sn/C", "Ordered intermetallic suppresses hydrogen evolution and tunes CO₂ electroreduction to ethanol."],
  ["Pt-CeO₂ Water-Gas Shift", "Pt/CeO₂-rod", "CeO₂ rod morphology maximizes oxygen storage capacity for low-temperature WGS under syngas conditions."],
  ["V₂O₅-WO₃/TiO₂ Dual SCR", "V₂O₅·WO₃/TiO₂", "Tungsten stabilizes vanadium sites and broadens temperature window for NOx reduction with NH₃."],
  ["Mo₂C Carbide Dry Reforming", "Mo₂C/SiO₂", "Carbide surface activates CO₂ via a Mars-van Krevelen mechanism while resisting coke at 700°C."],
  ["Ag-Cu Bimetallic Ethylene", "Ag₃Cu₁/α-Al₂O₃", "Cu promoter lowers Ag activation energy for epoxidation and suppresses total combustion."],
  ["ZIF-8 Derived Zn-N-C Electro", "Zn-N₄/C", "Atomic Zn sites in nitrogen-doped carbon catalyze CO₂ to CO with > 95% Faradaic efficiency."],
  ["Rh-Mn/SiO₂ Ethanol Synthesis", "Rh₂Mn₁/SiO₂", "Mn promotion enhances CO insertion kinetics to selectively produce ethanol from syngas."],
  ["NiFe LDH OER Electrocatalyst", "NiFe-LDH/Ni foam", "Layered double hydroxide provides abundant edge sites for alkaline oxygen evolution at 200 mV overpotential."],
  ["CuCrO₂ Delafossite Methanol", "CuCrO₂-δ", "P-type delafossite with oxygen vacancies drives CO₂ hydrogenation toward methanol at 180°C."],
  ["Sn-Beta Zeolite Biomass", "Sn-BEA", "Isomorphous Sn in BEA framework enables glucose isomerization to fructose for HMF production."],
  ["Co-N-C Single Site ORR", "Co-N₄/CNT", "Pyrolyzed Co-porphyrin on carbon nanotubes gives near-Pt ORR activity in acidic PEM fuel cells."],
  ["TiO₂-P25 Photocatalytic H₂", "TiO₂-P25/Pt", "Degussa P25 anatase-rutile junction with Pt co-catalyst achieves 4.2% solar-to-hydrogen efficiency."],
  ["Cs-Ru/MgO Ammonia Synthesis", "Cs₂O-Ru/MgO", "Cs electronic promoter dramatically lowers N₂ dissociation barrier on Ru step sites."],
  ["AuPd/TiO₂ Direct H₂O₂", "Au₅₀Pd₅₀/TiO₂", "Core-shell AuPd nanoparticles suppress H₂O₂ decomposition and yield > 90% selectivity."],
  ["MnO₂ Birnessite Water Oxid", "δ-MnO₂/FTO", "Layered birnessite manganese oxide mimics PSII-OEC for neutral-pH water oxidation."],
  ["La₀.₆Sr₀.₄CoO₃ Perovskite", "LSCO-δ", "A-site deficiency creates oxygen vacancies for high O₂⁻ mobility in solid oxide fuel cells."],
  ["Ni₃Fe/CeO₂-ZrO₂ Tri-Reform", "Ni₃Fe/CZO", "Iron alloying suppresses Ni sintering and coke in combined steam-dry-partial oxidation reforming."],
];

const BIO_POOL: [string, string, string][] = [
  ["S. cerevisiae PDC1↑ ADH2Δ GPD1Δ", "S. cerevisiae PDC1↑ ADH2Δ GPD1Δ", "Redirects pyruvate and acetaldehyde flux toward ethanol while suppressing glycerol and ethanol re-oxidation."],
  ["Z. mobilis Xylose+ SAF Precursor", "Z. mobilis xylA/xylB↑ adhB↑", "Adds C5 sugar utilization to improve Indian lignocellulosic feedstock fit."],
  ["C. ljungdahlii Syngas-Ethanol", "C. ljungdahlii adhE2↑ acsB↑", "Improves Wood-Ljungdahl pathway flux from syngas toward ethanol."],
  ["E. coli Fatty Alcohol Route", "E. coli atoB↑ fadDΔ acr1↑", "Builds hydrocarbon precursor pathway with reduced beta-oxidation drain."],
  ["Cellulase Cocktail Thermostable", "Cel7A-E217Q + Bgl1↑", "Raises biomass saccharification stability before fermentation."],
  ["Yarrowia lipolytica Lipid Acc", "Y. lipolytica DGA1↑ MFE1Δ", "Boosts triacylglycerol accumulation from waste glycerol for biodiesel precursor."],
  ["Synechocystis Ethylene Pathway", "Synechocystis efe↑ slr0168Δ", "Photosynthetic ethylene production via efe expression with competing pathway knockout."],
  ["Pichia pastoris Isobutanol", "P. pastoris kivD↑ adhA↑ ilvCΔ", "Redirects valine pathway intermediates toward isobutanol via Ehrlich pathway engineering."],
  ["Bacillus subtilis PHA Accum", "B. subtilis phaCAB↑ sigF Δ", "Poly-3-hydroxybutyrate production from agri-waste sugars via optimized PHA synthase operon."],
  ["Aspergillus niger Citric Acid", "A. niger goxC Δ pfkA↑", "Eliminates gluconate shunt and enhances phosphofructokinase flux toward citric acid."],
  ["Pseudomonas putida Muconate", "P. putida catA↑ pcaHG Δ", "Channels catechol toward muconic acid, a precursor for adipic acid and nylon intermediates."],
  ["Corynebacterium glutamicum Lys", "C. glutamicum lysC-T311I dapA↑", "Feedback-resistant aspartokinase pushes carbon toward L-lysine overproduction."],
  ["Rhodococcus opacus TAG Route", "R. opacus tadA↑ nlpR↑", "Enhanced triacylglycerol accumulation from lignin-derived aromatics for drop-in biodiesel."],
  ["Acetobacterium woodii H₂-Acetate", "A. woodii hydABCD↑ pta↑", "Improved hydrogenase and phosphotransacetylase flux for H₂+CO₂ to acetic acid."],
  ["Cupriavidus necator PHB-HV", "C. necator phaC-A510V bktB↑", "Point mutation broadens PHA synthase substrate range for HV copolymer production."],
  ["E. coli Mevalonate Isoprene", "E. coli mvk↑ ispS↑ dxs Δ", "Mevalonate pathway for isoprene production independent of native MEP pathway."],
  ["Klebsiella pneumoniae 1,3-PDO", "K. pneumoniae dhaB↑ yqhD↑", "Enhanced glycerol dehydratase and alcohol dehydrogenase for 1,3-propanediol yield."],
  ["Clostridium acetobutylicum ABE", "C. acetobutylicum adhE1↑ ctfAB↑", "Improved solventogenesis shift for higher butanol-to-acetone ratio in ABE fermentation."],
  ["Ralstonia eutropha Autotrophic", "R. eutropha cbbL↑ phaC↑", "CO₂-fixing autotrophic PHB production via enhanced RuBisCO and PHA synthase."],
  ["Thermoanaerobacterium Ethanol", "T. saccharolyticum adhE↑ ldh Δ", "Thermophilic ethanol producer with lactate dehydrogenase knockout for improved yield."],
  ["Geobacillus Hemicellulase", "G. stearothermophilus xynA↑ celA↑", "Thermostable xylanase-cellulase co-expression for direct consolidated bioprocessing at 60°C."],
  ["Anabaena Nitrogenase H₂", "Anabaena nifH↑ hupSL Δ", "Heterocyst-based biohydrogen via nitrogenase with uptake hydrogenase knockout."],
  ["Chlorella Lipid Engineering", "Chlorella DGAT2↑ STA1 Δ", "Microalgal lipid hyperaccumulation by redirecting carbon from starch to TAG."],
  ["Trichoderma reesei Cellulase", "T. reesei cbh1↑ xyr1↑ ace1Δ", "Hyper-cellulase secretion strain via transcription factor engineering for biomass saccharification."],
  ["S. elongatus Sucrose Export", "S. elongatus cscB↑ sps↑", "Cyanobacterial sucrose secretion from CO₂ as feedstock for heterotrophic co-cultures."],
];

export function fallbackDiscoveryCandidates(reaction: Reaction, count: number): DiscoveryCandidate[] {
  const isBio = reaction.domain === "synthetic-biology";
  const pool = isBio ? BIO_POOL : CATALYST_POOL;

  const rng = seededRandom(Date.now() ^ (reaction.id * 7919));

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return Array.from({ length: count }, (_, i) => {
    const [name, formula, mechanism] = shuffled[i % shuffled.length];
    const jitter = () => (rng() - 0.5) * 0.12;
    return normalizeCandidate(
      {
        name,
        formula,
        mechanismText: mechanism,
        predictedActivity: Math.max(0.4, Math.min(0.98, 0.88 - i * 0.035 + jitter())),
        predictedSelectivity: Math.max(0.4, Math.min(0.98, 0.84 - i * 0.025 + jitter())),
        predictedStability: Math.max(0.4, Math.min(0.98, 0.82 - i * 0.02 + jitter())),
        confidenceScore: Math.max(0.35, Math.min(0.95, 0.76 - i * 0.015 + jitter())),
        feedstockFitScore: Math.max(0.4, Math.min(0.98, 0.9 - i * 0.025 + jitter())),
        costScore: Math.max(0.3, Math.min(0.95, 0.8 - i * 0.03 + jitter())),
        sustainabilityScore: Math.max(0.5, Math.min(0.99, 0.92 - i * 0.018 + jitter())),
        scalabilityScore: Math.max(0.4, Math.min(0.98, 0.84 - i * 0.02 + jitter())),
        uncertaintyScore: Math.max(0.05, Math.min(0.5, 0.16 + i * 0.025 + jitter())),
      },
      reaction,
      i,
    );
  });
}

export async function generateDiscoveryCandidates(reaction: Reaction, count: number): Promise<DiscoveryCandidate[]> {
  // ─── 1. PRIMARY: Local ML Virtual High-Throughput Screening ───
  try {
    const mlCandidates = generateMLCandidates(reaction.domain, count);
    if (mlCandidates && mlCandidates.length > 0) {
      logger.info({ count: mlCandidates.length, domain: reaction.domain }, "ML engine: virtual screening complete");
      return mlCandidates.map((c, i) => normalizeCandidate(c, reaction, i));
    }
  } catch (err) {
    logger.warn({ err }, "ML engine threw error, falling back");
  }

  // ─── 2. SECONDARY: Gemini LLM (only if ML engine fails) ───
  logger.info("ML engine returned empty, trying Gemini LLM...");
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
  
  // ─── 3. LAST RESORT: Curated expert pool ───
  if (!parsed || parsed.length === 0) {
    logger.info("Gemini also unavailable, using curated expert candidates");
    return fallbackDiscoveryCandidates(reaction, count);
  }

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
