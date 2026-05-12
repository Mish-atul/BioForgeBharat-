const fs = require('fs');

let content = fs.readFileSync('artifacts/api-server/src/seed.ts', 'utf8');

// 1. Add imports
content = content.replace(
  'import { drizzle } from "drizzle-orm/node-postgres";',
  'import { drizzle } from "drizzle-orm/node-postgres";\nimport { estimateCO2AvoidedPerTonne, assignSDGTags } from "./lib/climate";\nimport { estimateToxicityScore, generateRecyclingCurve, estimateReactorSizing, calculateCompositeScore } from "./lib/sustainability";'
);

// 2. Update enrichCandidate
const enrichCandidateRegex = /function enrichCandidate[\s\S]*?\n\}/;
const newEnrichCandidate = `function enrichCandidate<T extends {
  name: string;
  formula: string;
  mechanismText: string;
  predictedActivity: number;
  predictedSelectivity: number;
  predictedStability: number;
  confidenceScore: number;
  candidateType?: string;
  molecularWeight?: number;
  logP?: number;
}>(candidate: T, domain: "chemical-catalysis" | "synthetic-biology", index: number, targetProduct: string): T & {
  candidateType: string;
  routeType: string;
  feedstockFitScore: number;
  costScore: number;
  sustainabilityScore: number;
  scalabilityScore: number;
  uncertaintyScore: number;
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
} {
  const isBio = domain === "synthetic-biology";
  const baseFit = isBio ? 0.88 : 0.84;
  
  const candidateType = candidate.candidateType || (isBio ? "microbial-pathway" : "heterogeneous-catalyst");
  const sustainabilityScore = Math.max(0, 0.9 - index * 0.004);
  
  const co2Avoided = estimateCO2AvoidedPerTonne(candidateType, targetProduct, candidate.predictedActivity, sustainabilityScore);
  const sdgTags = assignSDGTags(targetProduct, domain);
  const climateNarrative = "Enables ~" + co2Avoided + " kg CO2e reduction per tonne of feedstock, directly supporting " + sdgTags.join(" and ") + ".";
  
  const toxicity = estimateToxicityScore(candidate.formula, candidateType, candidate.molecularWeight || null, candidate.logP || null);
  const recyclingCurve = generateRecyclingCurve(candidate.predictedStability);
  const reactor = estimateReactorSizing(domain, targetProduct, candidate.predictedActivity);
  
  const compositeScore = calculateCompositeScore({
    predictedActivity: candidate.predictedActivity,
    predictedSelectivity: candidate.predictedSelectivity,
    predictedStability: candidate.predictedStability,
    toxicityScore: toxicity.score,
    recyclingRetention: JSON.stringify(recyclingCurve),
    sustainabilityScore,
    costScore: Math.max(0, 0.82 - index * 0.005)
  });

  return {
    ...candidate,
    candidateType,
    routeType: domain,
    feedstockFitScore: Math.max(0, baseFit - index * 0.006),
    costScore: Math.max(0, 0.82 - index * 0.005),
    sustainabilityScore,
    scalabilityScore: Math.max(0, 0.83 - index * 0.005),
    uncertaintyScore: Math.min(1, Math.max(0.08, 1 - candidate.confidenceScore)),
    evidenceText: isBio
      ? "Seeded from synthetic biology pathway patterns, enzyme engineering heuristics, and deterministic hackathon feedback data."
      : "Seeded from catalyst literature patterns, process feasibility heuristics, India-relevant feedstock fit, and deterministic hackathon feedback data.",
    energyProfileData: isBio
      ? null
      : JSON.stringify({
          steps: [
            { label: "Reactants", energy: 0 },
            { label: "Adsorbed intermediate", energy: -0.16 - index * 0.003 },
            { label: "Rate-limiting transition", energy: 0.46 - candidate.predictedActivity * 0.22 },
            { label: "Target products", energy: -0.28 - candidate.predictedSelectivity * 0.08 },
          ],
        }),
    pathwayData: isBio
      ? JSON.stringify({
          nodes: [
            { id: "feedstock", label: "Biomass sugars", flux: 100 },
            { id: "central", label: "Central metabolism", flux: Math.round(candidate.predictedActivity * 100) },
            { id: "product", label: "Fuel product", flux: Math.round(candidate.predictedSelectivity * 100) },
          ],
          edits: ["Overexpress rate-limiting enzyme", "Suppress by-product branch", "Tune redox balance"],
          bottlenecks: ["Product tolerance", "NADH/NAD+ balance", "C5/C6 sugar co-utilization"],
        })
      : null,
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
    compositeScore: compositeScore,
  };
}`;
content = content.replace(enrichCandidateRegex, newEnrichCandidate);

// 3. Update the mapping calls to enrichCandidate
content = content.replace(
  /enrichCandidate\(c, "chemical-catalysis", i\)/g,
  'enrichCandidate(c, "chemical-catalysis", i, "Sustainable Aviation Fuel (C₈–C₁₆)")'
);
content = content.replace(
  /enrichCandidate\(c, "chemical-catalysis", i\), reactionId: co2RxnId/g,
  'enrichCandidate(c, "chemical-catalysis", i, "Green Methanol"), reactionId: co2RxnId'
);
content = content.replace(
  /enrichCandidate\(c, "synthetic-biology", i\), reactionId: fermRxnId/g,
  'enrichCandidate(c, "synthetic-biology", i, "Bioethanol (>95% purity)"), reactionId: fermRxnId'
);

// 4. Add the 3 new reactions
const reactionsTarget = 'const reactionId = rxnEtj.id;';
const newReactions = `
  const [rxnMSW] = await db.insert(reactionsTable).values({
    name: "Municipal Solid Waste → Compressed Biogas (CBG)",
    type: "Anaerobic Digestion",
    equation: "Organic MSW + H₂O → CH₄ + CO₂ + digestate",
    targetProduct: "Compressed Biogas (CBG)",
    conditions: "Temperature: 35–37°C (mesophilic), pH: 6.8–7.2, HRT: 20–30 days, anaerobic environment",
    description: "Anaerobic digestion of municipal solid waste to produce compressed biogas. GPS Renewables operates this process at the Indore plant (17 TPD CBG) and Bhopal plant (14 TPD CBG).",
    domain: "synthetic-biology",
    tags: JSON.stringify(["GPS Renewables Scenario", "Indore Plant", "Bhopal Plant", "CBG", "MSW"])
  }).returning();

  const [rxnBamboo] = await db.insert(reactionsTable).values({
    name: "Bamboo Lignocellulose → 2G Ethanol",
    type: "Enzymatic Hydrolysis + Fermentation",
    equation: "Bamboo cellulose/hemicellulose → glucose → C₂H₅OH + CO₂",
    targetProduct: "2G Ethanol",
    conditions: "Pretreatment: 180°C steam explosion or dilute acid, Hydrolysis pH: 4.8–5.0, Fermentation: 30–35°C, 48–72h",
    description: "Two-stage conversion of bamboo lignocellulosic biomass to second-generation ethanol. GPS Renewables operates a 100 KLPD bamboo ethanol plant in Mizoram.",
    domain: "synthetic-biology",
    tags: JSON.stringify(["GPS Renewables Scenario", "Mizoram Plant", "2G Ethanol", "Bamboo", "Lignocellulosic"])
  }).returning();

  const [rxnPaddy] = await db.insert(reactionsTable).values({
    name: "Paddy Straw Agri-Residue → Bio-CNG",
    type: "Anaerobic Co-digestion",
    equation: "Paddy straw + press mud cake + H₂O → CH₄ + CO₂ → Bio-CNG",
    targetProduct: "Bio-CNG",
    conditions: "Feedstock ratio: 70:30 paddy straw to press mud, Temperature: 37°C, pH: 7.0–7.5, HRT: 25 days, CSTR digester",
    description: "Co-digestion of paddy straw with press mud cake for Bio-CNG production aligned with India's SATAT policy.",
    domain: "synthetic-biology",
    tags: JSON.stringify(["GPS Renewables Scenario", "SATAT Policy", "Bio-CNG", "Paddy Straw", "IOCL JV"])
  }).returning();

  const mswRxnId = rxnMSW.id;
  const bambooRxnId = rxnBamboo.id;
  const paddyRxnId = rxnPaddy.id;
`;

content = content.replace(reactionsTarget, newReactions + '\\n  ' + reactionsTarget);

// 5. Add candidates for new reactions
const candsTarget = '// ─── Experiments (5 experiments on ETJ candidates) ───';
const newCandidates = `
  const mswCandidates = [
    { name: "Methanosaeta concilii", formula: "Acetoclastic methanogen", source: "known", rank: 1, predictedActivity: 0.85, predictedSelectivity: 0.90, predictedStability: 0.82, confidenceScore: 0.89, mechanismText: "Key acetoclastic methanogen for CBG production." },
    { name: "Clostridium thermocellum", formula: "Cellulolytic co-culture", source: "known", rank: 2, predictedActivity: 0.82, predictedSelectivity: 0.85, predictedStability: 0.79, confidenceScore: 0.84, mechanismText: "Efficient degradation of lignocellulose in MSW." },
    { name: "Anaerobic fungi consortium", formula: "Neocallimastix + Piromyces", source: "generated", rank: 3, predictedActivity: 0.88, predictedSelectivity: 0.83, predictedStability: 0.77, confidenceScore: 0.81, mechanismText: "GPS patent area - superior breakdown of recalcitrant biomass." }
  ];
  await db.insert(candidatesTable).values(mswCandidates.map((c, i) => ({ ...enrichCandidate(c, "synthetic-biology", i, "Compressed Biogas (CBG)"), reactionId: mswRxnId })));

  const bambooCandidates = [
    { name: "Trichoderma reesei", formula: "Cellulase complex", source: "known", rank: 1, predictedActivity: 0.87, predictedSelectivity: 0.92, predictedStability: 0.85, confidenceScore: 0.90, mechanismText: "Standard industrial cellulase producer." },
    { name: "Zymomonas mobilis ZM4", formula: "Z. mobilis", source: "known", rank: 2, predictedActivity: 0.84, predictedSelectivity: 0.95, predictedStability: 0.81, confidenceScore: 0.88, mechanismText: "High ethanol tolerance and rapid fermentation." },
    { name: "Engineered S. cerevisiae + xylose", formula: "S. cerevisiae (engineered)", source: "generated", rank: 3, predictedActivity: 0.81, predictedSelectivity: 0.89, predictedStability: 0.83, confidenceScore: 0.85, mechanismText: "Co-fermentation of glucose and xylose from bamboo." }
  ];
  await db.insert(candidatesTable).values(bambooCandidates.map((c, i) => ({ ...enrichCandidate(c, "synthetic-biology", i, "2G Ethanol"), reactionId: bambooRxnId })));
`;

content = content.replace(candsTarget, newCandidates + '\\n  ' + candsTarget);

fs.writeFileSync('artifacts/api-server/src/seed.ts', content, 'utf8');
