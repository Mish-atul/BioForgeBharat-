import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dna, Zap, ChevronRight, Info, TrendingUp, Beaker, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Glass Card Component ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] group", className)}>
    <div className="h-full w-full rounded-[calc(2.5rem-0.375rem)] bg-[#080310]/90 backdrop-blur-3xl border border-white/10 p-6 md:p-8 relative overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
      {children}
    </div>
  </div>
);

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
  { from: "glucose", to: "g6p", enzyme: "HXK1/GLK1", flux: 92, geneTarget: "HXK2Δ", color: "#06b6d4" },
  { from: "g6p", to: "pyruvate", enzyme: "Glycolysis", flux: 88, color: "#06b6d4" },
  { from: "pyruvate", to: "acetaldehyde", enzyme: "PDC1/PDC5/PDC6", flux: 76, geneTarget: "PDC↑", color: "#d946ef" },
  { from: "acetaldehyde", to: "ethanol", enzyme: "ADH1/ADH2", flux: 74, geneTarget: "ADH1↑ ADH2Δ", color: "#d946ef" },
  { from: "pyruvate", to: "co2", enzyme: "PDC (decarbox.)", flux: 76, color: "#6b7280" },
  { from: "pyruvate", to: "acetylcoa", enzyme: "PDH complex", flux: 12, color: "#f97316" },
  { from: "acetylcoa", to: "biomass", enzyme: "TCA / Anabolic", flux: 12, color: "#f97316" },
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
  substrate: { fill: "rgba(6, 182, 212, 0.15)", stroke: "#06b6d4", text: "#06b6d4" },
  intermediate: { fill: "rgba(148, 163, 184, 0.1)", stroke: "#64748b", text: "#e2e8f0" },
  product: { fill: "rgba(217, 70, 239, 0.2)", stroke: "#d946ef", text: "#f0abfc" },
  byproduct: { fill: "rgba(107, 114, 128, 0.1)", stroke: "#6b7280", text: "#9ca3af" },
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
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 text-xs font-bold tracking-[0.25em] uppercase mb-4 shadow-[0_0_30px_rgba(217,70,239,0.2)]">
            <Dna className="w-4 h-4 animate-spin-slow" />
            Synthetic Biology
          </div>
          <h1 className="text-5xl font-serif font-black tracking-tight text-white mb-2 drop-shadow-lg">Pathway Explorer</h1>
          <p className="text-lg text-white/60 max-w-2xl font-medium">
            Interactive flux map for <span className="text-fuchsia-400 font-bold">Biomass Ethanol Fermentation</span>.
          </p>
        </div>
      </motion.div>

      {/* Pathway SVG */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: "spring" }}>
        <GlassCard>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-fuchsia-600/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
          <h2 className="text-2xl font-serif font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <Zap className="w-6 h-6 text-fuchsia-400" />
            Metabolic Flux Diagram
            <span className="ml-auto text-xs font-sans font-medium text-white/40 uppercase tracking-widest">Click an arrow to inspect</span>
          </h2>
          <div className="relative z-10 bg-black/40 rounded-3xl border border-white/5 p-4 overflow-hidden">
            <svg viewBox="0 0 680 370" className="w-full h-auto drop-shadow-2xl">
              <defs>
                <marker id="arrow-cyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#06b6d4" />
                </marker>
                <marker id="arrow-pink" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#d946ef" />
                </marker>
                <marker id="arrow-gray" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#6b7280" />
                </marker>
                <marker id="arrow-orange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#f97316" />
                </marker>
                <filter id="node-glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
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
                const color = edge.color ?? "#06b6d4";
                const markerColor = color === "#06b6d4" ? "arrow-cyan" : color === "#d946ef" ? "arrow-pink" : color === "#f97316" ? "arrow-orange" : "arrow-gray";

                const dx = toNode.x - fromNode.x;
                const dy = toNode.y - fromNode.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const r = 36;
                const sx = fromNode.x + (dx / len) * r;
                const sy = fromNode.y + (dy / len) * r;
                const ex = toNode.x - (dx / len) * (r + 8);
                const ey = toNode.y - (dy / len) * (r + 8);
                const mx = (sx + ex) / 2;
                const my = (sy + ey) / 2;

                return (
                  <g key={edgeId} onClick={() => setSelectedEdge(isSelected ? null : edgeId)} className="cursor-pointer group">
                    <line
                      x1={sx} y1={sy} x2={ex} y2={ey}
                      stroke={color}
                      strokeWidth={isSelected ? 4 : Math.max(1.5, edge.flux / 25)}
                      strokeOpacity={isSelected ? 1 : 0.6}
                      markerEnd={`url(#${markerColor})`}
                      className="transition-all duration-300"
                    />
                    {/* Hover hit area */}
                    <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="transparent" strokeWidth={20} />
                    {isSelected && (
                      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={12} strokeOpacity={0.2} filter="url(#node-glow)" />
                    )}
                    <rect x={mx - 15} y={my - 12} width="30" height="14" fill="#050505" rx="4" opacity={0.8} />
                    <text x={mx} y={my - 2} textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace" fontWeight="bold">
                      {edge.flux}%
                    </text>
                    {edge.geneTarget && (
                      <text x={mx} y={my + 10} textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace" fillOpacity={0.9} fontWeight="bold">
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
                  <g key={node.id} className="hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                    <circle cx={node.x} cy={node.y} r={34} fill={colors.fill} stroke={colors.stroke} strokeWidth={2} filter="url(#node-glow)" />
                    <text x={node.x} y={node.y - 2} textAnchor="middle" fill={colors.text} fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                      {node.label}
                    </text>
                    {node.sublabel && (
                      <text x={node.x} y={node.y + 10} textAnchor="middle" fill={colors.text} fontSize="7" fontFamily="sans-serif" fillOpacity={0.8} fontWeight="bold">
                        {node.sublabel}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Legend */}
              <g transform="translate(20, 340)">
                {[
                  { color: "#06b6d4", label: "Glycolytic flux" },
                  { color: "#d946ef", label: "Ethanol" },
                  { color: "#f97316", label: "TCA/Biomass" },
                  { color: "#6b7280", label: "Byproducts" },
                ].map((item, i) => (
                  <g key={i} transform={`translate(${i * 140}, 0)`}>
                    <rect x={0} y={0} width="12" height="12" rx="3" fill={item.color} fillOpacity={0.2} stroke={item.color} strokeWidth={2} />
                    <text x={20} y={9} fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="bold" opacity={0.7}>{item.label}</text>
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </GlassCard>
      </motion.div>

      {/* Enzyme Detail Panel */}
      <AnimatePresence>
        {enzymeDetail && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard className="border-fuchsia-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
                  <Info className="w-5 h-5 text-fuchsia-400" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">Enzyme Detail — {enzymeDetail.name}</h3>
                <Badge variant="outline" className="ml-auto bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30 text-xs tracking-widest uppercase font-bold py-1 px-3 rounded-full">
                  {enzymeDetail.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">Gene</div>
                  <div className="font-mono text-sm text-white font-bold">{enzymeDetail.gene}</div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">k_cat</div>
                  <div className="font-mono text-sm text-fuchsia-400 font-bold">{enzymeDetail.kcat}</div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">Km</div>
                  <div className="font-mono text-sm text-cyan-400 font-bold">{enzymeDetail.km}</div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">Organism</div>
                  <div className="font-sans text-sm text-white/70 italic">{enzymeDetail.organism}</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5">
                <div className="text-[10px] text-fuchsia-400 uppercase tracking-widest mb-2 font-bold">Engineering Strategy</div>
                <p className="text-sm font-medium text-white/90 leading-relaxed">{enzymeDetail.improvement}</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Engineered Strains */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-3xl font-serif font-bold flex items-center gap-3">
            <Leaf className="w-8 h-8 text-cyan-400" />
            Engineered Strain Library
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STRAINS.map((strain, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} onClick={() => setSelectedStrain(i)}>
                <GlassCard className={selectedStrain === i ? "border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]" : "cursor-pointer"}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="font-serif font-bold text-xl text-white">{strain.name}</div>
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-widest font-bold border ${strain.status === "validated" ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" : "text-orange-400 border-orange-500/30 bg-orange-500/10"}`}>
                      {strain.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-6 min-h-[60px]">{strain.description}</p>
                  <div className="flex gap-2 flex-wrap mb-6">
                    {strain.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-white/5 text-white/80 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/50">
                        <span>Ethanol</span>
                        <span className="font-mono text-fuchsia-400">{strain.ethanol}%</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.5)]" style={{ width: `${strain.ethanol}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/50">
                        <span>Biomass</span>
                        <span className="font-mono text-white/50">{strain.biomass}%</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-white/30 rounded-full" style={{ width: `${strain.biomass * 4}%` }} />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FBA Summary */}
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            Flux Analysis
          </h2>
          <GlassCard className="h-[calc(100%-3rem)] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 bg-white/5 p-3 rounded-xl border border-white/10 text-center font-mono">
              {STRAINS[selectedStrain].name}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
              {[
                { label: "EtOH Yield", value: `${STRAINS[selectedStrain].ethanol}%`, note: "max 95.1%", color: "text-fuchsia-400" },
                { label: "Biomass", value: `${STRAINS[selectedStrain].biomass}%`, note: "gDCW/gGlc", color: "text-white/60" },
                { label: "Glc Uptake", value: "2.1", note: "mmol/gDCW·h", color: "text-cyan-400" },
                { label: "O₂ Req.", value: "Anaer.", note: "mode", color: "text-orange-400" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col justify-center p-4 rounded-2xl border border-white/5 bg-black/40 text-center shadow-inner">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">{item.label}</div>
                  <div className={`text-2xl font-mono font-black ${item.color}`}>{item.value}</div>
                  <div className="text-[10px] text-white/30 mt-1">{item.note}</div>
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <Button className="w-full bg-gradient-to-r from-orange-600 to-rose-500 text-white rounded-xl py-6 font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all">
                Export SBML Model
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
