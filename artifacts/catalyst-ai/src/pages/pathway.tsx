import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dna, Zap, ChevronRight, Info, TrendingUp, Beaker, Leaf } from "lucide-react";

interface PathwayNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  type: "substrate" | "intermediate" | "product" | "byproduct";
}

interface PathwayEdge {
  from: string;
  to: string;
  enzyme: string;
  flux: number;
  geneTarget?: string;
  color?: string;
}

interface EnzymeDetail {
  name: string;
  gene: string;
  organism: string;
  kcat: string;
  km: string;
  improvement: string;
  status: "native" | "engineered" | "heterologous";
}

const NODES: PathwayNode[] = [
  { id: "glucose", label: "Glucose", sublabel: "C₆H₁₂O₆", x: 80, y: 160, type: "substrate" },
  { id: "g6p", label: "G-6-P", sublabel: "Glycolysis", x: 200, y: 160, type: "intermediate" },
  { id: "pyruvate", label: "Pyruvate", sublabel: "C₃H₃O₃⁻", x: 320, y: 160, type: "intermediate" },
  { id: "acetaldehyde", label: "Acetaldehyde", sublabel: "C₂H₄O", x: 440, y: 110, type: "intermediate" },
  { id: "ethanol", label: "Ethanol", sublabel: "C₂H₅OH", x: 560, y: 110, type: "product" },
  { id: "co2", label: "CO₂", sublabel: "Byproduct", x: 440, y: 220, type: "byproduct" },
  { id: "acetylcoa", label: "Acetyl-CoA", sublabel: "TCA branch", x: 320, y: 260, type: "intermediate" },
  { id: "biomass", label: "Biomass", sublabel: "Cell growth", x: 440, y: 310, type: "byproduct" },
];

const EDGES: PathwayEdge[] = [
  { from: "glucose", to: "g6p", enzyme: "HXK1/GLK1", flux: 92, geneTarget: "HXK2Δ", color: "#00cccc" },
  { from: "g6p", to: "pyruvate", enzyme: "Glycolysis", flux: 88, color: "#00cccc" },
  { from: "pyruvate", to: "acetaldehyde", enzyme: "PDC1/PDC5/PDC6", flux: 76, geneTarget: "PDC↑", color: "#00e673" },
  { from: "acetaldehyde", to: "ethanol", enzyme: "ADH1/ADH2", flux: 74, geneTarget: "ADH1↑ ADH2Δ", color: "#00e673" },
  { from: "pyruvate", to: "co2", enzyme: "PDC (decarbox.)", flux: 76, color: "#6b7280" },
  { from: "pyruvate", to: "acetylcoa", enzyme: "PDH complex", flux: 12, color: "#a78bfa" },
  { from: "acetylcoa", to: "biomass", enzyme: "TCA / Anabolic", flux: 12, color: "#a78bfa" },
];

const ENZYME_DETAILS: Record<string, EnzymeDetail> = {
  "PDC1/PDC5/PDC6": {
    name: "Pyruvate Decarboxylase",
    gene: "PDC1, PDC5, PDC6",
    organism: "S. cerevisiae BY4741",
    kcat: "68 s⁻¹",
    km: "0.3 mM (pyruvate)",
    improvement: "+31% flux via PDC1 overexpression",
    status: "engineered",
  },
  "ADH1/ADH2": {
    name: "Alcohol Dehydrogenase",
    gene: "ADH1 (↑), ADH2 (Δ)",
    organism: "S. cerevisiae BY4741",
    kcat: "320 s⁻¹",
    km: "0.5 mM (acetaldehyde)",
    improvement: "ADH2 deletion removes ethanol re-oxidation pathway",
    status: "engineered",
  },
  "HXK1/GLK1": {
    name: "Hexokinase / Glucokinase",
    gene: "HXK1, GLK1, HXK2Δ",
    organism: "S. cerevisiae BY4741",
    kcat: "140 s⁻¹",
    km: "0.15 mM (glucose)",
    improvement: "HXK2 deletion relieves glucose repression",
    status: "engineered",
  },
};

const NODE_COLORS: Record<PathwayNode["type"], { fill: string; stroke: string; text: string }> = {
  substrate: { fill: "rgba(0, 204, 204, 0.15)", stroke: "#00cccc", text: "#00cccc" },
  intermediate: { fill: "rgba(148, 163, 184, 0.1)", stroke: "#64748b", text: "#94a3b8" },
  product: { fill: "rgba(0, 230, 115, 0.2)", stroke: "#00e673", text: "#00e673" },
  byproduct: { fill: "rgba(107, 114, 128, 0.1)", stroke: "#6b7280", text: "#6b7280" },
};

const STRAINS = [
  {
    name: "BY4741 ΔAld6",
    description: "Base strain with aldehyde dehydrogenase knockout. Reduces acetate formation.",
    ethanol: 74.2,
    biomass: 8.1,
    status: "validated",
    tags: ["ADH2Δ", "ALD6Δ"],
  },
  {
    name: "BY4741 PDC↑ ADH2Δ",
    description: "Overexpressed PDC1, deleted ADH2 to redirect flux from ethanol re-oxidation.",
    ethanol: 81.3,
    biomass: 6.4,
    status: "in-progress",
    tags: ["PDC1↑", "ADH2Δ"],
  },
  {
    name: "BY4741 GPD1Δ GPD2Δ",
    description: "Glycerol pathway knockout. Eliminates glycerol by-product drain.",
    ethanol: 78.8,
    biomass: 7.2,
    status: "validated",
    tags: ["GPD1Δ", "GPD2Δ"],
  },
];

export default function Pathway() {
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [selectedStrain, setSelectedStrain] = useState(0);

  const getNodeById = (id: string) => NODES.find((n) => n.id === id);

  const selectedEnzyme = selectedEdge
    ? EDGES.find((e) => `${e.from}-${e.to}` === selectedEdge)?.enzyme
    : null;
  const enzymeDetail = selectedEnzyme ? ENZYME_DETAILS[selectedEnzyme] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Dna className="w-6 h-6 text-accent" />
            <Badge variant="outline" className="text-xs font-mono border-accent/50 text-accent">
              Synthetic Biology
            </Badge>
            <Badge variant="outline" className="text-xs font-mono border-primary/50 text-primary">
              Direction 2
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Metabolic Pathway Explorer
          </h1>
          <p className="text-muted-foreground mt-2">
            Interactive flux map for <span className="text-accent font-medium">Biomass Ethanol Fermentation</span> — S. cerevisiae engineering for bioethanol production.
          </p>
        </div>
      </div>

      {/* Pathway SVG */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Metabolic Flux Diagram
            <span className="ml-auto text-xs font-normal normal-case">Click an arrow to inspect enzyme details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg
            viewBox="0 0 680 370"
            className="w-full"
            style={{ minHeight: 240 }}
          >
            <defs>
              <marker id="arrow-cyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#00cccc" />
              </marker>
              <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#00e673" />
              </marker>
              <marker id="arrow-gray" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#6b7280" />
              </marker>
              <marker id="arrow-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#a78bfa" />
              </marker>
              <filter id="node-glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Edges */}
            {EDGES.map((edge) => {
              const fromNode = getNodeById(edge.from);
              const toNode = getNodeById(edge.to);
              if (!fromNode || !toNode) return null;
              const edgeId = `${edge.from}-${edge.to}`;
              const isSelected = selectedEdge === edgeId;
              const color = edge.color ?? "#00cccc";
              const markerColor = color === "#00cccc" ? "arrow-cyan" : color === "#00e673" ? "arrow-green" : color === "#a78bfa" ? "arrow-purple" : "arrow-gray";

              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const r = 32;
              const sx = fromNode.x + (dx / len) * r;
              const sy = fromNode.y + (dy / len) * r;
              const ex = toNode.x - (dx / len) * (r + 6);
              const ey = toNode.y - (dy / len) * (r + 6);
              const mx = (sx + ex) / 2;
              const my = (sy + ey) / 2;

              return (
                <g
                  key={edgeId}
                  onClick={() => setSelectedEdge(isSelected ? null : edgeId)}
                  className="cursor-pointer"
                >
                  <line
                    x1={sx} y1={sy} x2={ex} y2={ey}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : Math.max(1.5, edge.flux / 30)}
                    strokeOpacity={isSelected ? 1 : 0.65}
                    markerEnd={`url(#${markerColor})`}
                  />
                  {isSelected && (
                    <line
                      x1={sx} y1={sy} x2={ex} y2={ey}
                      stroke={color}
                      strokeWidth={8}
                      strokeOpacity={0.15}
                    />
                  )}
                  <text
                    x={mx}
                    y={my - 7}
                    textAnchor="middle"
                    fill={color}
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {edge.flux}%
                  </text>
                  {edge.geneTarget && (
                    <text
                      x={mx}
                      y={my + 5}
                      textAnchor="middle"
                      fill={color}
                      fontSize="7"
                      fontFamily="monospace"
                      fillOpacity={0.75}
                    >
                      {edge.geneTarget}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map((node) => {
              const colors = NODE_COLORS[node.type];
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={32}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={1.5}
                    filter="url(#node-glow)"
                  />
                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.label}
                  </text>
                  {node.sublabel && (
                    <text
                      x={node.x}
                      y={node.y + 8}
                      textAnchor="middle"
                      fill={colors.text}
                      fontSize="6.5"
                      fontFamily="monospace"
                      fillOpacity={0.7}
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Legend */}
            <g transform="translate(10, 330)">
              {[
                { color: "#00cccc", label: "Main glycolytic flux" },
                { color: "#00e673", label: "Ethanol production" },
                { color: "#a78bfa", label: "TCA / biomass" },
                { color: "#6b7280", label: "Byproducts" },
              ].map((item, i) => (
                <g key={i} transform={`translate(${i * 160}, 0)`}>
                  <line x1={0} y1={5} x2={20} y2={5} stroke={item.color} strokeWidth={2} />
                  <text x={24} y={9} fill={item.color} fontSize="8" fontFamily="monospace">{item.label}</text>
                </g>
              ))}
            </g>
          </svg>
        </CardContent>
      </Card>

      {/* Enzyme Detail Panel */}
      {enzymeDetail && (
        <Card className="bg-card border-primary/30 shadow-md shadow-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4" />
              Enzyme Detail — {enzymeDetail.name}
              <Badge
                variant="outline"
                className={`ml-auto text-xs font-mono ${
                  enzymeDetail.status === "engineered"
                    ? "border-primary/50 text-primary"
                    : enzymeDetail.status === "native"
                    ? "border-accent/50 text-accent"
                    : "border-chart-3/50 text-chart-3"
                }`}
              >
                {enzymeDetail.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Gene</div>
                <div className="font-mono text-sm text-foreground">{enzymeDetail.gene}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">k_cat</div>
                <div className="font-mono text-sm text-accent">{enzymeDetail.kcat}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Km</div>
                <div className="font-mono text-sm text-primary">{enzymeDetail.km}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Organism</div>
                <div className="font-mono text-sm italic text-muted-foreground">{enzymeDetail.organism}</div>
              </div>
            </div>
            <div className="mt-4 p-3 rounded border border-accent/20 bg-accent/5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Engineering Strategy</div>
              <p className="text-sm text-foreground/90">{enzymeDetail.improvement}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engineered Strains */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-accent" />
          Engineered Strain Library
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STRAINS.map((strain, i) => (
            <Card
              key={i}
              onClick={() => setSelectedStrain(i)}
              className={`bg-card border-border cursor-pointer transition-all hover:-translate-y-0.5 duration-300 ${
                selectedStrain === i ? "border-primary/60 shadow-md shadow-primary/10" : ""
              }`}
              data-testid={`card-strain-${i}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="font-mono font-bold text-sm text-foreground">{strain.name}</div>
                  <Badge
                    variant="outline"
                    className={`text-xs flex-shrink-0 ml-2 ${
                      strain.status === "validated"
                        ? "border-accent/50 text-accent"
                        : "border-chart-4/50 text-chart-4"
                    }`}
                  >
                    {strain.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{strain.description}</p>
                <div className="flex gap-1 flex-wrap mb-3">
                  {strain.tags.map((tag) => (
                    <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Ethanol yield</span>
                      <span className="font-mono text-accent">{strain.ethanol}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${strain.ethanol}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Biomass yield</span>
                      <span className="font-mono text-muted-foreground">{strain.biomass}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-muted-foreground/50 rounded-full"
                        style={{ width: `${strain.biomass * 4}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Flux Balance Analysis Summary */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Flux Balance Analysis — {STRAINS[selectedStrain].name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Ethanol Yield", value: `${STRAINS[selectedStrain].ethanol}%`, note: "theoretical max 95.1%", color: "text-accent" },
              { label: "Biomass Yield", value: `${STRAINS[selectedStrain].biomass}%`, note: "gDCW/gGlucose", color: "text-muted-foreground" },
              { label: "Glucose Uptake", value: "2.1 mmol/gDCW·h", note: "specific rate", color: "text-primary" },
              { label: "O₂ Req.", value: "Anaerobic", note: "fermentative mode", color: "text-chart-3" },
            ].map((item) => (
              <div key={item.label} className="space-y-1 p-3 rounded border border-border bg-background">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</div>
                <div className={`text-lg font-mono font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.note}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded border border-border bg-background">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Pathway Engineering Notes</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground/80">PDC overexpression increases pyruvate → acetaldehyde flux by 31%, reducing overflow metabolism.</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground/80">ADH2 deletion prevents ethanol re-oxidation to acetaldehyde, improving net ethanol titer.</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground/80">GPD1/2 knockouts eliminate glycerol drain (~4% carbon), but require osmotic stress management.</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground/80">HXK2 deletion relieves glucose catabolite repression, enabling efficient xylose co-utilization.</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison with Direction 1 */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Beaker className="w-4 h-4 text-primary" />
            Integrated Workflow — Synthetic Biology → Chemical Catalysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {[
              { step: "1", label: "Biomass Feedstock", sub: "Agricultural waste, sugarcane", color: "text-accent" },
              { step: "→", label: "", sub: "", color: "text-muted-foreground" },
              { step: "2", label: "Fermentation", sub: "S. cerevisiae BY4741 (engineered)", color: "text-primary" },
              { step: "→", label: "", sub: "", color: "text-muted-foreground" },
              { step: "3", label: "Bioethanol", sub: "74–81% yield", color: "text-accent" },
              { step: "→", label: "", sub: "", color: "text-muted-foreground" },
              { step: "4", label: "Catalytic Upgrade", sub: "HZSM-5 / Ni/HZSM-5 (Direction 1)", color: "text-primary" },
              { step: "→", label: "", sub: "", color: "text-muted-foreground" },
              { step: "5", label: "Jet Fuel (SAF)", sub: "C₈–C₁₆ hydrocarbons", color: "text-accent" },
            ].map((item, i) => (
              item.step === "→" ? (
                <ChevronRight key={i} className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <div key={i} className="flex-shrink-0 text-center p-3 rounded border border-border bg-background min-w-[120px]">
                  <div className="text-xs font-mono text-muted-foreground mb-1">Step {item.step}</div>
                  <div className={`text-sm font-bold ${item.color}`}>{item.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.sub}</div>
                </div>
              )
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            BioForgeBharat integrates both discovery directions: engineered <span className="italic">S. cerevisiae</span> strains (Direction 2) produce bioethanol from lignocellulosic biomass, which is then upgraded to sustainable aviation fuel (SAF) via AI-optimized heterogeneous catalysts (Direction 1). GPS Renewables pilot targets 10,000 L/day ethanol → 6,500 L/day jet fuel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
