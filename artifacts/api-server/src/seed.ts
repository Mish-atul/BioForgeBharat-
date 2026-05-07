import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/src/schema";
import {
  reactionsTable,
  candidatesTable,
  experimentsTable,
  annotationsTable,
  retrainingRunsTable,
} from "@workspace/db/src/schema";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

function enrichCandidate<T extends {
  formula: string;
  mechanismText: string;
  predictedActivity: number;
  predictedSelectivity: number;
  predictedStability: number;
  confidenceScore: number;
}>(candidate: T, domain: "chemical-catalysis" | "synthetic-biology", index: number): T & {
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
} {
  const isBio = domain === "synthetic-biology";
  const baseFit = isBio ? 0.88 : 0.84;
  return {
    ...candidate,
    candidateType: isBio ? "microbial-pathway" : "heterogeneous-catalyst",
    routeType: domain,
    feedstockFitScore: Math.max(0, baseFit - index * 0.006),
    costScore: Math.max(0, 0.82 - index * 0.005),
    sustainabilityScore: Math.max(0, 0.9 - index * 0.004),
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
  };
}

async function seed() {
  console.log("🌱 Seeding BioForgeBharat database...");

  // Clear existing data
  await db.delete(annotationsTable);
  await db.delete(experimentsTable);
  await db.delete(candidatesTable);
  await db.delete(retrainingRunsTable);
  await db.delete(reactionsTable);

  // ─── Reactions ───
  const [rxnEtj] = await db.insert(reactionsTable).values({
    name: "Ethanol-to-Jet Fuel Conversion",
    type: "Catalytic Dehydration / Oligomerization",
    equation: "C₂H₅OH → C₂H₄ + H₂O → C₈–C₁₆ hydrocarbons (SAF)",
    targetProduct: "Sustainable Aviation Fuel (C₈–C₁₆)",
    conditions: "300–450°C, 1–10 bar, LHSV 2 h⁻¹, H₂ co-feed optional",
    description: "GPS Renewables pilot: convert second-generation bioethanol from lignocellulosic waste into sustainable aviation fuel via integrated dehydration + oligomerization + hydrogenation over bifunctional acid/metal catalysts.",
    domain: "chemical-catalysis",
  }).returning();

  const [rxnCO2] = await db.insert(reactionsTable).values({
    name: "CO₂ Hydrogenation to Methanol",
    type: "Heterogeneous Catalysis",
    equation: "CO₂ + 3H₂ → CH₃OH + H₂O  (ΔH = −49.5 kJ/mol)",
    targetProduct: "Green Methanol",
    conditions: "200–280°C, 50–80 bar, Cu/ZnO/Al₂O₃ baseline, H₂:CO₂ = 3:1",
    description: "Carbon utilization via CO₂ hydrogenation to methanol as a green fuel and chemical feedstock. Targeting >85% CO₂ conversion and >95% methanol selectivity for green hydrogen economy.",
    domain: "chemical-catalysis",
  }).returning();

  const [rxnFerm] = await db.insert(reactionsTable).values({
    name: "Biomass Ethanol Fermentation",
    type: "Synthetic Biology / Metabolic Engineering",
    equation: "C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂  (Embden-Meyerhof pathway)",
    targetProduct: "Bioethanol (>95% purity)",
    conditions: "30°C, pH 5.0, anaerobic, S. cerevisiae BY4741, 72 h batch",
    description: "Engineered S. cerevisiae strains for high-yield bioethanol production from lignocellulosic feedstocks. Pathway targets: PDC overexpression, ADH2 deletion, GPD knockout for glycerol elimination.",
    domain: "synthetic-biology",
  }).returning();

  const reactionId = rxnEtj.id;
  const co2RxnId = rxnCO2.id;
  const fermRxnId = rxnFerm.id;

  // ─── Candidates — Ethanol-to-Jet (23 known literature + literature-inspired) ───
  const etjCandidates = [
    // Rank 1-5: Top performers
    { name: "Ni/HZSM-5 Bifunctional", formula: "Ni/SiO₂·Al₂O₃", source: "known", rank: 1, predictedActivity: 0.87, predictedSelectivity: 0.79, predictedStability: 0.82, confidenceScore: 0.91, mechanismText: "Ni sites catalyze ethylene oligomerization while HZSM-5 Brønsted acid sites promote dehydration and cracking. The bifunctional synergy enables single-step ethanol-to-jet conversion with optimal C₈-C₁₆ selectivity.", structureData: JSON.stringify({ nodes: [{ id: "Ni", x: 40, y: 60 }, { id: "HZSM5", x: 120, y: 60 }], edges: [{ from: "Ni", to: "HZSM5" }] }) },
    { name: "Co/HZSM-5 Alkylation", formula: "Co/SiO₂·Al₂O₃", source: "known", rank: 2, predictedActivity: 0.83, predictedSelectivity: 0.81, predictedStability: 0.79, confidenceScore: 0.88, mechanismText: "Cobalt nanoparticles provide hydrogenation activity while HZSM-5 enables Friedel-Crafts type alkylation of aromatic intermediates. Gives high selectivity to C₁₀-C₁₄ range with low coking.", structureData: JSON.stringify({ nodes: [{ id: "Co", x: 40, y: 60 }, { id: "HZSM5", x: 120, y: 60 }], edges: [{ from: "Co", to: "HZSM5" }] }) },
    { name: "Ga/HZSM-5 Aromatization", formula: "Ga₂O₃/SiO₂·Al₂O₃", source: "known", rank: 3, predictedActivity: 0.81, predictedSelectivity: 0.76, predictedStability: 0.84, confidenceScore: 0.86, mechanismText: "Gallium oxide modifies HZSM-5 by introducing Lewis acid sites alongside Brønsted sites, promoting dehydrogenation-cyclization cascade. Particularly effective for aromatic SAF components.", structureData: JSON.stringify({ nodes: [{ id: "Ga2O3", x: 40, y: 60 }, { id: "HZSM5", x: 120, y: 60 }], edges: [{ from: "Ga2O3", to: "HZSM5" }] }) },
    { name: "Cu/ZnO/HZSM-5 Ternary", formula: "Cu·ZnO/SiO₂·Al₂O₃", source: "known", rank: 4, predictedActivity: 0.79, predictedSelectivity: 0.83, predictedStability: 0.75, confidenceScore: 0.85, mechanismText: "Ternary system combining Cu-ZnO synergetic sites (ethanol dehydrogenation) with HZSM-5 acid sites (oligomerization). Copper prevents deep oxidation; zinc oxide stabilizes copper dispersion.", structureData: JSON.stringify({ nodes: [{ id: "Cu", x: 20, y: 60 }, { id: "ZnO", x: 70, y: 60 }, { id: "HZSM5", x: 130, y: 60 }], edges: [{ from: "Cu", to: "ZnO" }, { from: "ZnO", to: "HZSM5" }] }) },
    { name: "Pd/H-Beta Zeolite", formula: "Pd/SiO₂·Al₂O₃ (BEA)", source: "known", rank: 5, predictedActivity: 0.78, predictedSelectivity: 0.85, predictedStability: 0.77, confidenceScore: 0.83, mechanismText: "Beta zeolite's larger 12-membered ring pores accommodate bulkier oligomers, while Pd provides controlled hydrogenation. Excellent selectivity toward branched C₁₂-C₁₆ range for high-freeze-point SAF.", structureData: JSON.stringify({ nodes: [{ id: "Pd", x: 40, y: 60 }, { id: "H-Beta", x: 120, y: 60 }], edges: [{ from: "Pd", to: "H-Beta" }] }) },
    // Rank 6-10
    { name: "Mo₂C/HZSM-5", formula: "Mo₂C/SiO₂·Al₂O₃", source: "known", rank: 6, predictedActivity: 0.76, predictedSelectivity: 0.74, predictedStability: 0.88, confidenceScore: 0.81, mechanismText: "Molybdenum carbide phase provides bifunctional metallic-acid character, resisting sulfur poisoning. High thermal stability up to 500°C makes it suitable for continuous industrial operation.", structureData: JSON.stringify({ nodes: [{ id: "Mo2C", x: 60, y: 60 }], edges: [] }) },
    { name: "Fe-ZSM-5 Oligomerization", formula: "Fe/SiO₂·Al₂O₃", source: "known", rank: 7, predictedActivity: 0.74, predictedSelectivity: 0.72, predictedStability: 0.83, confidenceScore: 0.79, mechanismText: "Iron-exchanged ZSM-5 promotes ethylene oligomerization via carbenium ion mechanism. Fe²⁺/Fe³⁺ redox couples enhance catalyst regenerability under oxidative regeneration cycles.", structureData: JSON.stringify({ nodes: [{ id: "Fe", x: 40, y: 60 }, { id: "ZSM5", x: 120, y: 60 }], edges: [{ from: "Fe", to: "ZSM5" }] }) },
    { name: "Al-MCM-41 Mesoporous", formula: "Al₂O₃/SiO₂ (MCM-41)", source: "known", rank: 8, predictedActivity: 0.71, predictedSelectivity: 0.77, predictedStability: 0.73, confidenceScore: 0.78, mechanismText: "Ordered mesoporous Al-MCM-41 provides high surface area (>1000 m²/g) with accessible Brønsted acid sites. Reduced diffusion limitations compared to microporous zeolites; suitable for heavier feed.", structureData: JSON.stringify({ nodes: [{ id: "AlMCM41", x: 60, y: 60 }], edges: [] }) },
    { name: "Zr/HZSM-5 Dehydration", formula: "ZrO₂/SiO₂·Al₂O₃", source: "known", rank: 9, predictedActivity: 0.70, predictedSelectivity: 0.79, predictedStability: 0.80, confidenceScore: 0.77, mechanismText: "Zirconia modifies HZSM-5 surface acidity by partially neutralizing strong Brønsted sites, giving improved selectivity to C₈-C₁₂ while reducing cracking to C₁-C₄ gases.", structureData: JSON.stringify({ nodes: [{ id: "ZrO2", x: 40, y: 60 }, { id: "HZSM5", x: 120, y: 60 }], edges: [{ from: "ZrO2", to: "HZSM5" }] }) },
    { name: "In₂O₃/HZSM-5 Selective", formula: "In₂O₃/SiO₂·Al₂O₃", source: "known", rank: 10, predictedActivity: 0.68, predictedSelectivity: 0.82, predictedStability: 0.71, confidenceScore: 0.76, mechanismText: "Indium oxide provides unique Lewis acid sites that moderate the strong Brønsted acidity of HZSM-5, reducing unwanted aromatic formation and improving linear hydrocarbon selectivity.", structureData: JSON.stringify({ nodes: [{ id: "In2O3", x: 40, y: 60 }, { id: "HZSM5", x: 120, y: 60 }], edges: [{ from: "In2O3", to: "HZSM5" }] }) },
    // Rank 11-15
    { name: "Pt/H-Beta High Stability", formula: "Pt/SiO₂·Al₂O₃ (BEA)", source: "known", rank: 11, predictedActivity: 0.75, predictedSelectivity: 0.71, predictedStability: 0.90, confidenceScore: 0.82, mechanismText: "Platinum on H-Beta zeolite provides excellent resistance to coking via hydrogenation of coke precursors. Particularly suited for feedstocks with high oxygenate content.", structureData: JSON.stringify({ nodes: [{ id: "Pt", x: 40, y: 60 }, { id: "HBeta", x: 120, y: 60 }], edges: [{ from: "Pt", to: "HBeta" }] }) },
    { name: "WOₓ/ZrO₂ Solid Acid", formula: "WO₃/ZrO₂", source: "known", rank: 12, predictedActivity: 0.66, predictedSelectivity: 0.75, predictedStability: 0.86, confidenceScore: 0.74, mechanismText: "Tungstated zirconia acts as a superacid with Hammett acidity H₀ < −14. Excellent for low-temperature dehydration (<300°C) with minimal coke deposition and easy regeneration.", structureData: JSON.stringify({ nodes: [{ id: "WO3", x: 40, y: 60 }, { id: "ZrO2", x: 120, y: 60 }], edges: [{ from: "WO3", to: "ZrO2" }] }) },
    { name: "Ag/SAPO-34", formula: "Ag/SAPO-34", source: "known", rank: 13, predictedActivity: 0.64, predictedSelectivity: 0.80, predictedStability: 0.69, confidenceScore: 0.72, mechanismText: "Silver-modified SAPO-34 (CHA topology) provides shape-selective oligomerization with pore size tuned for C₄-C₈ product distribution. Silver promotes dehydrogenation of intermediate alkenes.", structureData: JSON.stringify({ nodes: [{ id: "Ag", x: 40, y: 60 }, { id: "SAPO34", x: 120, y: 60 }], edges: [{ from: "Ag", to: "SAPO34" }] }) },
    { name: "Ce/HZSM-5 Oxygen Storage", formula: "CeO₂/SiO₂·Al₂O₃", source: "known", rank: 14, predictedActivity: 0.62, predictedSelectivity: 0.73, predictedStability: 0.85, confidenceScore: 0.71, mechanismText: "Ceria's Ce³⁺/Ce⁴⁺ redox couple provides oxygen storage capacity, improving resistance to carbon deposition. Promotes water-gas shift reaction to consume produced water and shift equilibrium.", structureData: JSON.stringify({ nodes: [{ id: "CeO2", x: 40, y: 60 }, { id: "HZSM5", x: 120, y: 60 }], edges: [{ from: "CeO2", to: "HZSM5" }] }) },
    { name: "Ru/HZSM-5 Ring Opening", formula: "Ru/SiO₂·Al₂O₃", source: "known", rank: 15, predictedActivity: 0.60, predictedSelectivity: 0.68, predictedStability: 0.78, confidenceScore: 0.70, mechanismText: "Ruthenium promotes ring opening of cycloparaffins formed during oligomerization, improving the ratio of linear to branched products in the jet fuel range.", structureData: JSON.stringify({ nodes: [{ id: "Ru", x: 40, y: 60 }, { id: "HZSM5", x: 120, y: 60 }], edges: [{ from: "Ru", to: "HZSM5" }] }) },
    // Rank 16-23: Additional known
    { name: "SiO₂-Al₂O₃ Amorphous", formula: "SiO₂·Al₂O₃ (25% Al)", source: "known", rank: 16, predictedActivity: 0.55, predictedSelectivity: 0.65, predictedStability: 0.88, confidenceScore: 0.68, mechanismText: "Amorphous silica-alumina provides mild Brønsted and Lewis acidity without shape selectivity. Low surface acid site density gives broad product distribution, suitable as baseline reference catalyst.", structureData: JSON.stringify({ nodes: [{ id: "SiO2Al2O3", x: 60, y: 60 }], edges: [] }) },
    { name: "ZSM-22 (TON) Linear Select.", formula: "SiO₂·Al₂O₃ (TON topology)", source: "known", rank: 17, predictedActivity: 0.58, predictedSelectivity: 0.84, predictedStability: 0.72, confidenceScore: 0.73, mechanismText: "ZSM-22 one-dimensional 10-ring pore structure selectively produces linear C₈-C₁₂ alkanes over branched products. High selectivity reduces freeze-point issues for cold-weather aviation applications.", structureData: JSON.stringify({ nodes: [{ id: "ZSM22", x: 60, y: 60 }], edges: [] }) },
    { name: "SAPO-11 Isomerization", formula: "SAPO-11 (AEL topology)", source: "known", rank: 18, predictedActivity: 0.56, predictedSelectivity: 0.78, predictedStability: 0.74, confidenceScore: 0.69, mechanismText: "SAPO-11 elliptical 10-ring pores promote skeletal isomerization of linear to mono-branched products. Improves cold-flow properties of jet fuel blend without significant yield loss.", structureData: JSON.stringify({ nodes: [{ id: "SAPO11", x: 60, y: 60 }], edges: [] }) },
    { name: "Al₂O₃ Gamma Dehydration", formula: "γ-Al₂O₃", source: "known", rank: 19, predictedActivity: 0.52, predictedSelectivity: 0.62, predictedStability: 0.92, confidenceScore: 0.75, mechanismText: "Gamma-alumina provides high surface area Lewis acid sites primarily for ethanol dehydration to ethylene. Excellent thermal stability; commonly used as pre-dehydration stage before oligomerization reactor.", structureData: JSON.stringify({ nodes: [{ id: "Al2O3", x: 60, y: 60 }], edges: [] }) },
    { name: "TiO₂-SiO₂ Mixed Oxide", formula: "TiO₂·SiO₂", source: "known", rank: 20, predictedActivity: 0.50, predictedSelectivity: 0.70, predictedStability: 0.80, confidenceScore: 0.66, mechanismText: "Titanosilicate framework provides isolated Ti⁴⁺ Lewis acid sites within silica matrix. Moderate acidity reduces cracking side reactions; suitable for selective epoxidation intermediates.", structureData: JSON.stringify({ nodes: [{ id: "TiO2SiO2", x: 60, y: 60 }], edges: [] }) },
    { name: "H-Ferrierite (FER)", formula: "SiO₂·Al₂O₃ (FER topology)", source: "known", rank: 21, predictedActivity: 0.54, predictedSelectivity: 0.66, predictedStability: 0.76, confidenceScore: 0.68, mechanismText: "Ferrierite's intersecting 8- and 10-ring channel system provides unique cage effects for C₄-C₆ oligomerization. Lower Si/Al ratio variants show enhanced oligomerization activity.", structureData: JSON.stringify({ nodes: [{ id: "HFerrierite", x: 60, y: 60 }], edges: [] }) },
    { name: "Mordenite H-MOR", formula: "SiO₂·Al₂O₃ (MOR topology)", source: "known", rank: 22, predictedActivity: 0.57, predictedSelectivity: 0.63, predictedStability: 0.79, confidenceScore: 0.67, mechanismText: "H-Mordenite one-dimensional 12-ring channels with strong Brønsted acidity. High activity but diffusion limitations cause rapid coking; benefits significantly from hierarchical pore introduction.", structureData: JSON.stringify({ nodes: [{ id: "HMOR", x: 60, y: 60 }], edges: [] }) },
    { name: "USY Ultrastable Y", formula: "SiO₂·Al₂O₃ (FAU, USY)", source: "known", rank: 23, predictedActivity: 0.59, predictedSelectivity: 0.61, predictedStability: 0.85, confidenceScore: 0.72, mechanismText: "Ultrastabilized Y zeolite with high Si/Al ratio provides medium Brønsted acidity and large 12-ring supercages. Secondary mesopore network from steam treatment reduces diffusion limitations significantly.", structureData: JSON.stringify({ nodes: [{ id: "USY", x: 60, y: 60 }], edges: [] }) },
    // Rank 24-31: AI-generated
    { name: "Ni₃Ga/HZSM-5 Intermetallic", formula: "Ni₃Ga/SiO₂·Al₂O₃", source: "generated", rank: 24, predictedActivity: 0.91, predictedSelectivity: 0.84, predictedStability: 0.78, confidenceScore: 0.79, mechanismText: "Novel Ni₃Ga intermetallic compound modifies the electronic structure of Ni, weakening C–O bond activation energy and enhancing C–C coupling. The ordered intermetallic phase prevents Ni sintering and improves stability at 400°C. HZSM-5 acid sites provide cascade dehydration and cyclization for high SAF yield.", structureData: JSON.stringify({ nodes: [{ id: "Ni3Ga", x: 50, y: 60 }, { id: "HZSM5", x: 130, y: 60 }], edges: [{ from: "Ni3Ga", to: "HZSM5" }] }) },
    { name: "Cu-In₂O₃/HZSM-5 Defect", formula: "Cu·In₂O₃/SiO₂·Al₂O₃", source: "generated", rank: 25, predictedActivity: 0.88, predictedSelectivity: 0.86, predictedStability: 0.74, confidenceScore: 0.76, mechanismText: "Cu doping into In₂O₃ creates oxygen vacancies acting as active sites for ethanol dissociation. The Cu-In synergy enables low-temperature dehydration (250°C) with reduced water inhibition. Paired with HZSM-5 for high jet-range selectivity via shape-controlled oligomerization.", structureData: JSON.stringify({ nodes: [{ id: "CuIn2O3", x: 50, y: 60 }, { id: "HZSM5", x: 130, y: 60 }], edges: [{ from: "CuIn2O3", to: "HZSM5" }] }) },
    { name: "Pt-Sn/Hierarchical ZSM-5", formula: "Pt·Sn/SiO₂·Al₂O₃ (mesoporous)", source: "generated", rank: 26, predictedActivity: 0.85, predictedSelectivity: 0.88, predictedStability: 0.80, confidenceScore: 0.77, mechanismText: "Pt-Sn alloy nanoparticles on hierarchical ZSM-5 with introduced secondary mesopore network (100 nm). Sn electronic modification of Pt reduces coking propensity; mesopores enable higher LHSV operation. Targeted for C₁₂-C₁₆ SAF fraction via controlled oligomerization depth.", structureData: JSON.stringify({ nodes: [{ id: "PtSn", x: 50, y: 60 }, { id: "ZSM5-hier", x: 130, y: 60 }], edges: [{ from: "PtSn", to: "ZSM5-hier" }] }) },
    { name: "MoVNbTeOₓ/HZSM-5", formula: "Mo₁V₀.₃Nb₀.₁Te₀.₂Oₓ/SiO₂·Al₂O₃", source: "generated", rank: 27, predictedActivity: 0.84, predictedSelectivity: 0.80, predictedStability: 0.82, confidenceScore: 0.73, mechanismText: "Multi-component mixed oxide catalyst inspired by M1 phase; vanadium and tellurium create tailored redox sites for selective dehydration without deep oxidation. Molybdenum framework provides structural stability up to 450°C. Niobium doping reduces coking by modifying surface Lewis acidity.", structureData: JSON.stringify({ nodes: [{ id: "MoVNbTe", x: 60, y: 60 }], edges: [] }) },
    { name: "Fe-N-C/HZSM-5 Dual Site", formula: "FeN₄/C·SiO₂·Al₂O₃", source: "generated", rank: 28, predictedActivity: 0.82, predictedSelectivity: 0.77, predictedStability: 0.76, confidenceScore: 0.71, mechanismText: "Single-atom Fe coordinated in N-doped carbon matrix creates FeN₄ sites with unique electronic properties for C–C coupling. The carbon shell prevents zeolite acid site poisoning while enabling electron transfer. Dual-function selectivity: Fe sites for coupling, HZSM-5 for cracking/cyclization.", structureData: JSON.stringify({ nodes: [{ id: "FeN4C", x: 50, y: 60 }, { id: "HZSM5", x: 130, y: 60 }], edges: [{ from: "FeN4C", to: "HZSM5" }] }) },
    { name: "Rh-Mn/HZSM-5 Oxygenate", formula: "Rh·MnO/SiO₂·Al₂O₃", source: "generated", rank: 29, predictedActivity: 0.80, predictedSelectivity: 0.79, predictedStability: 0.72, confidenceScore: 0.70, mechanismText: "Rhodium with MnO promoter enables unique ethanol-to-higher-oxygenate pathway before HZSM-5 cracking/deoxygenation. MnO suppresses methane formation; Rh enables C-C homologation via CO insertion. Particularly effective at 350°C with partial H₂ co-feed.", structureData: JSON.stringify({ nodes: [{ id: "RhMnO", x: 50, y: 60 }, { id: "HZSM5", x: 130, y: 60 }], edges: [{ from: "RhMnO", to: "HZSM5" }] }) },
    { name: "CoFe₂O₄/HZSM-5 Spinel", formula: "CoFe₂O₄/SiO₂·Al₂O₃", source: "generated", rank: 30, predictedActivity: 0.78, predictedSelectivity: 0.74, predictedStability: 0.83, confidenceScore: 0.69, mechanismText: "Cobalt ferrite spinel provides tunable redox properties through Co²⁺/Co³⁺ and Fe²⁺/Fe³⁺ couples. Octahedral Co sites activate O-H bond of ethanol while tetrahedral Fe sites facilitate C-C bond formation. The spinel structure resists sintering up to 500°C in realistic process conditions.", structureData: JSON.stringify({ nodes: [{ id: "CoFe2O4", x: 50, y: 60 }, { id: "HZSM5", x: 130, y: 60 }], edges: [{ from: "CoFe2O4", to: "HZSM5" }] }) },
    { name: "Core-Shell Ni@SiO₂/HZSM-5", formula: "Ni@SiO₂/SiO₂·Al₂O₃", source: "generated", rank: 31, predictedActivity: 0.86, predictedSelectivity: 0.82, predictedStability: 0.88, confidenceScore: 0.75, mechanismText: "Silica shell encapsulation of Ni nanoparticles prevents sintering and enables controlled access to Ni surface. Shell thickness (2-3 nm) modulates reactant diffusion, providing intrinsic shape selectivity before HZSM-5 stage. Novel core-shell architecture shows 40% longer catalyst lifetime in accelerated deactivation tests.", structureData: JSON.stringify({ nodes: [{ id: "Ni-core", x: 40, y: 60 }, { id: "SiO2-shell", x: 80, y: 60 }, { id: "HZSM5", x: 140, y: 60 }], edges: [{ from: "Ni-core", to: "SiO2-shell" }, { from: "SiO2-shell", to: "HZSM5" }] }) },
  ];

  const insertedEtjCandidates = await db.insert(candidatesTable).values(
    etjCandidates.map((c, i) => ({ ...enrichCandidate(c, "chemical-catalysis", i), reactionId }))
  ).returning();

  // ─── Candidates — CO₂ Hydrogenation (5 candidates) ───
  const co2Candidates = [
    { name: "Cu/ZnO/Al₂O₃ Industrial", formula: "Cu·ZnO·Al₂O₃", source: "known", rank: 1, predictedActivity: 0.78, predictedSelectivity: 0.94, predictedStability: 0.82, confidenceScore: 0.92, mechanismText: "Industrial methanol synthesis catalyst. Cu-ZnO interface provides dual active sites: Cu⁰ for CO₂ activation and ZnO for formate intermediate stabilization. Al₂O₃ stabilizes dispersion. Over 95% methanol selectivity at 250°C.", structureData: JSON.stringify({ nodes: [{ id: "Cu", x: 30, y: 60 }, { id: "ZnO", x: 80, y: 60 }, { id: "Al2O3", x: 130, y: 60 }], edges: [{ from: "Cu", to: "ZnO" }, { from: "ZnO", to: "Al2O3" }] }) },
    { name: "In₂O₃ Defect Catalyst", formula: "In₂O₃ (oxygen-deficient)", source: "known", rank: 2, predictedActivity: 0.72, predictedSelectivity: 0.98, predictedStability: 0.76, confidenceScore: 0.87, mechanismText: "Oxygen vacancies in In₂O₃ are the primary active sites for CO₂ hydrogenation via formate pathway. Exceptional methanol selectivity (>99%) with no CO by-product. Lower activity vs Cu-based but superior selectivity for methanol fuel applications.", structureData: JSON.stringify({ nodes: [{ id: "In2O3", x: 60, y: 60 }], edges: [] }) },
    { name: "ZnO-ZrO₂ Solid Solution", formula: "ZnₓZr₁₋ₓO₂", source: "known", rank: 3, predictedActivity: 0.70, predictedSelectivity: 0.96, predictedStability: 0.88, confidenceScore: 0.84, mechanismText: "Zinc-zirconia solid solution forms unique Zn-Zr-O sites with balanced Lewis acid-base properties. No noble metals required; excellent sulfur resistance. High methanol selectivity through formaldehyde-formate pathway.", structureData: JSON.stringify({ nodes: [{ id: "ZnZrO", x: 60, y: 60 }], edges: [] }) },
    { name: "Pd/ZnO Alloy Surface", formula: "Pd·ZnO (PdZn alloy)", source: "known", rank: 4, predictedActivity: 0.74, predictedSelectivity: 0.91, predictedStability: 0.80, confidenceScore: 0.83, mechanismText: "PdZn alloy formed at operating temperature mimics electronic properties of Cu. Pd provides high H₂ dissociation activity; ZnO modulates CO binding strength. Effective at lower H₂:CO₂ ratios (2:1).", structureData: JSON.stringify({ nodes: [{ id: "Pd", x: 40, y: 60 }, { id: "ZnO", x: 100, y: 60 }], edges: [{ from: "Pd", to: "ZnO" }] }) },
    { name: "Cu-ZnO/Graphene Oxide", formula: "Cu·ZnO/GO", source: "generated", rank: 5, predictedActivity: 0.80, predictedSelectivity: 0.92, predictedStability: 0.71, confidenceScore: 0.74, mechanismText: "Graphene oxide support provides electron-rich environment that donates electron density to Cu, enhancing CO₂ adsorption. GO defect sites act as additional nucleation points for Cu-ZnO nanoparticles, improving dispersion to 8 nm average. Predicted 12% higher activity vs alumina support.", structureData: JSON.stringify({ nodes: [{ id: "Cu", x: 30, y: 60 }, { id: "ZnO", x: 80, y: 60 }, { id: "GO", x: 130, y: 60 }], edges: [{ from: "Cu", to: "GO" }, { from: "ZnO", to: "GO" }] }) },
  ];

  const insertedCO2Candidates = await db.insert(candidatesTable).values(
    co2Candidates.map((c, i) => ({ ...enrichCandidate(c, "chemical-catalysis", i), reactionId: co2RxnId }))
  ).returning();

  // ─── Candidates — Biomass Fermentation (3 strains) ───
  const fermCandidates = [
    { name: "BY4741 ΔAld6 PDC↑", formula: "S. cerevisiae BY4741 PDC1↑ ALD6Δ ADH2Δ", source: "known", rank: 1, predictedActivity: 0.81, predictedSelectivity: 0.94, predictedStability: 0.78, confidenceScore: 0.88, mechanismText: "Engineered S. cerevisiae with PDC1 overexpression, ALD6 deletion (removes aldehyde dehydrogenase to prevent acetate formation), and ADH2 deletion (prevents ethanol re-oxidation). 81% theoretical maximum ethanol yield in 72h batch fermentation.", structureData: JSON.stringify({ nodes: [{ id: "PDC1", x: 30, y: 60 }, { id: "ADH1", x: 90, y: 60 }], edges: [{ from: "PDC1", to: "ADH1" }] }) },
    { name: "BY4741 GPD1Δ GPD2Δ", formula: "S. cerevisiae BY4741 GPD1Δ GPD2Δ", source: "known", rank: 2, predictedActivity: 0.79, predictedSelectivity: 0.92, predictedStability: 0.76, confidenceScore: 0.85, mechanismText: "Glycerol pathway double knockout eliminates ~4% carbon drain to glycerol. Requires controlled osmotic stress management. Particularly effective in fed-batch mode with glucose feeding rate control. 79% ethanol yield with near-zero glycerol by-product.", structureData: JSON.stringify({ nodes: [{ id: "GPD1del", x: 30, y: 60 }, { id: "GPD2del", x: 90, y: 60 }], edges: [] }) },
    { name: "CEN.PK113 Xylose+ Strain", formula: "S. cerevisiae CEN.PK113 XYL1↑ XYL2↑ XKS1↑", source: "generated", rank: 3, predictedActivity: 0.74, predictedSelectivity: 0.88, predictedStability: 0.80, confidenceScore: 0.76, mechanismText: "CEN.PK113 background with xylose utilization pathway introduced from Pichia stipitis (XYL1, XYL2) and overexpressed xylulokinase (XKS1). Enables co-fermentation of glucose and xylose from lignocellulosic hydrolysates. 74% overall yield on mixed C5/C6 feedstock.", structureData: JSON.stringify({ nodes: [{ id: "XYL1", x: 30, y: 60 }, { id: "XYL2", x: 80, y: 60 }, { id: "XKS1", x: 130, y: 60 }], edges: [{ from: "XYL1", to: "XYL2" }, { from: "XYL2", to: "XKS1" }] }) },
  ];

  await db.insert(candidatesTable).values(
    fermCandidates.map((c, i) => ({ ...enrichCandidate(c, "synthetic-biology", i), reactionId: fermRxnId }))
  ).returning();

  // ─── Experiments (5 experiments on ETJ candidates) ───
  const topEtj = insertedEtjCandidates.slice(0, 5);

  const experiments = [
    {
      candidateId: topEtj[0].id, // Ni/HZSM-5
      measuredActivity: 0.91,
      measuredSelectivity: 0.82,
      measuredYield: 0.77,
      researcherName: "Dr. Arjun Patel",
      notes: "Excellent activity - exceeded prediction by 4.6%. Ni loading at 3 wt% optimal. No significant coking at 8h TOS.",
      status: "completed",
    },
    {
      candidateId: topEtj[1].id, // Co/HZSM-5
      measuredActivity: 0.80,
      measuredSelectivity: 0.84,
      measuredYield: 0.72,
      researcherName: "Dr. Priya Sharma",
      notes: "Selectivity exceeded prediction by 3.7%. Activity slightly below prediction; Co loading optimization needed. Run at 380°C, 5 bar.",
      status: "completed",
    },
    {
      candidateId: topEtj[2].id, // Ga/HZSM-5
      measuredActivity: 0.78,
      measuredSelectivity: 0.73,
      measuredYield: 0.69,
      researcherName: "Dr. Arjun Patel",
      notes: "Performance consistent with prediction. High aromatic content in C8-C12 fraction (~35% aromatics) — good for aviation but may need blending for freeze-point compliance.",
      status: "completed",
    },
    {
      candidateId: topEtj[3].id, // Cu/ZnO/HZSM-5
      measuredActivity: 0.74,
      measuredSelectivity: 0.86,
      measuredYield: 0.70,
      researcherName: "Dr. Kavitha Reddy",
      notes: "Best selectivity in series — 86% vs predicted 83%. Cu sintering observed after 24h TOS at 420°C; recommend reducing temperature or adding La promoter for stability.",
      status: "completed",
    },
    {
      candidateId: topEtj[4].id, // Pd/H-Beta
      measuredActivity: 0.71,
      measuredSelectivity: 0.88,
      measuredYield: 0.66,
      researcherName: "Dr. Priya Sharma",
      notes: "Exceptional selectivity for C12-C16 range (88%). Activity lower than predicted — H-Beta pore blockage suspected from moisture in ethanol feed. Re-run with dry feed in progress.",
      status: "in-progress",
    },
  ];

  const insertedExps = await db.insert(experimentsTable).values(experiments).returning();

  // ─── Experiments on CO₂ candidates ───
  const co2Exps = [
    {
      candidateId: insertedCO2Candidates[0].id,
      measuredActivity: 0.82,
      measuredSelectivity: 0.96,
      measuredYield: 0.79,
      researcherName: "Dr. Kavitha Reddy",
      notes: "Industrial baseline. 250°C, 60 bar, H₂:CO₂=3:1. Methanol selectivity 96%, consistent with literature. Space time yield: 0.62 g-MeOH/g-cat/h.",
      status: "completed",
    },
    {
      candidateId: insertedCO2Candidates[1].id,
      measuredActivity: 0.68,
      measuredSelectivity: 0.99,
      measuredYield: 0.67,
      researcherName: "Dr. Arjun Patel",
      notes: "In₂O₃ confirmed: 99% selectivity to methanol with zero CO formation. Lower activity than Cu/ZnO but much better selectivity. Key tradeoff for high-purity methanol fuel applications.",
      status: "completed",
    },
  ];

  await db.insert(experimentsTable).values(co2Exps);

  // ─── Annotations ───
  await db.insert(annotationsTable).values([
    {
      experimentId: insertedExps[0].id,
      author: "Dr. Arjun Patel",
      content: "Ni/HZSM-5 performance exceeds predictions by 4.6% activity. Recommend this as primary candidate for GPS Renewables pilot scale-up. Key risk: water tolerance at high conversion — need 500h stability test before scale-up decision.",
    },
    {
      experimentId: insertedExps[1].id,
      author: "Dr. Priya Sharma",
      content: "Co/HZSM-5 selectivity advantage is significant (84% vs 81% predicted). Propose cobalt loading optimization study: 1, 3, 5, 7 wt% to find optimum. Co cost ~10x lower than Pd — important for techno-economic analysis.",
    },
    {
      experimentId: insertedExps[2].id,
      author: "Prof. Suresh Kumar",
      content: "Ga/HZSM-5 aromatic selectivity (35%) is actually a feature for drop-in SAF compliance per ASTM D7566 Annex A1. High aromatics ensure seal swelling compatibility. Recommend this catalyst specifically for aromatic-deficient SAF blends.",
    },
    {
      experimentId: insertedExps[3].id,
      author: "Dr. Kavitha Reddy",
      content: "Cu sintering at 420°C is a known failure mode. Literature suggests La₂O₃ addition (3-5 wt%) stabilizes Cu particles via strong metal-support interaction. Queue AI candidate generation for Cu-La-Zn ternary variations.",
    },
    {
      experimentId: insertedExps[0].id,
      author: "Dr. Priya Sharma",
      content: "Cross-reaction note: Ni/HZSM-5 selectivity at 91% activity is the best combined metric in the ETJ series. Recommend as benchmark catalyst for all future ETJ screening. Should also test on CO₂ hydrogenation to methanol — bifunctional potential.",
    },
  ]);

  // ─── Retraining Run ───
  await db.insert(retrainingRunsTable).values({
    triggeredBy: "Dr. Arjun Patel",
    status: "completed",
    accuracyBefore: 0.834,
    accuracyAfter: 0.871,
    dataPointsUsed: 7,
    notes: "First retraining with experimental results from ETJ candidates 1-5 and CO₂ candidates 1-2. Prediction accuracy improved by 3.7 percentage points. Model now better calibrated for bifunctional acid/metal systems. Next retraining recommended after 5 more experimental points.",
    completedAt: new Date().toISOString(),
  });

  await pool.end();
  console.log("✅ Seed complete:");
  console.log(`   - 3 reactions (ETJ, CO₂ hydrogenation, biomass fermentation)`);
  console.log(`   - ${etjCandidates.length} ETJ candidates (23 known + 8 AI-generated)`);
  console.log(`   - ${co2Candidates.length} CO₂ candidates + ${fermCandidates.length} fermentation strains`);
  console.log(`   - ${experiments.length + co2Exps.length} experiments`);
  console.log(`   - 5 annotations`);
  console.log(`   - 1 retraining run`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
