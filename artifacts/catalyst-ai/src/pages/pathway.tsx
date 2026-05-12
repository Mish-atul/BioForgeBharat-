import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dna, Zap, ChevronRight, Info, TrendingUp, Beaker, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Glass Card Component ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/50 shadow-[0_0_40px_rgba(0,0,0,0.5)] group", className)}>
    <div className="h-full w-full rounded-[calc(2.5rem-0.375rem)] bg-white/60 backdrop-blur-3xl border border-white/50 p-6 md:p-8 relative overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
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
          <h1 className="text-5xl font-serif font-black tracking-tight text-slate-900 mb-2 drop-shadow-lg">Pathway Explorer</h1>
          <p className="text-lg text-slate-900/60 max-w-2xl font-medium">
            Interactive flux map for <span className="text-fuchsia-400 font-bold">Biomass Ethanol Fermentation</span>.
          </p>
        </div>
      </motion.div>

      {/* Pathway SVG */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: "spring" }}>
        <GlassCard>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-fuchsia-600/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 relative z-10 flex items-center gap-3">
            <Zap className="w-6 h-6 text-fuchsia-400" />
            Metabolic Flux Diagram
            <span className="ml-auto text-xs font-sans font-medium text-slate-900/40 uppercase tracking-widest">Click an arrow to inspect</span>
          </h2>
          <div className="relative z-10 bg-white/40 rounded-[2rem] border border-white/40 p-8 overflow-hidden shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
            <svg viewBox="0 0 680 370" className="w-full h-auto drop-shadow-2xl overflow-visible">
              <defs>
                <marker id="arrow-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse">
                  <path d="M0,1 L0,5 L6,3 z" fill="#06b6d4" />
                </marker>
                <marker id="arrow-pink" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse">
                  <path d="M0,1 L0,5 L6,3 z" fill="#d946ef" />
                </marker>
                <marker id="arrow-gray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse">
                  <path d="M0,1 L0,5 L6,3 z" fill="#6b7280" />
                </marker>
                <marker id="arrow-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse">
                  <path d="M0,1 L0,5 L6,3 z" fill="#f97316" />
                </marker>
                <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="edge-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="flux-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
                </linearGradient>
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
                const ex = toNode.x - (dx / len) * (r + 12);
                const ey = toNode.y - (dy / len) * (r + 12);
                const mx = (sx + ex) / 2;
                const my = (sy + ey) / 2;

                // Create a smooth curve if it's not a straight horizontal line
                const curveOffset = Math.abs(dy) > 10 ? 40 : 0;
                const cx1 = sx + (dx / 3);
                const cy1 = sy - curveOffset;
                const cx2 = ex - (dx / 3);
                const cy2 = ey - curveOffset;
                
                const pathD = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${ex} ${ey}`;
                const pMx = (sx + cx1 + cx2 + ex) / 4;
                const pMy = (sy + cy1 + cy2 + ey) / 4;

                return (
                  <g key={edgeId} onClick={() => setSelectedEdge(isSelected ? null : edgeId)} className="cursor-pointer group" style={{ color }}>
                    {/* Base track */}
                    <path
                      d={pathD}
                      stroke={color}
                      fill="none"
                      strokeWidth={isSelected ? 5 : Math.max(2, edge.flux / 20)}
                      strokeOpacity={0.15}
                    />
                    
                    {/* Glowing animated line */}
                    <motion.path
                      d={pathD}
                      stroke={color}
                      fill="none"
                      strokeWidth={isSelected ? 4 : Math.max(1.5, edge.flux / 25)}
                      strokeOpacity={isSelected ? 1 : 0.8}
                      markerEnd={`url(#${markerColor})`}
                      filter="url(#edge-glow)"
                      initial={{ strokeDasharray: "10 20", strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className={cn("transition-all duration-300", !isSelected && "group-hover:stroke-opacity-100 group-hover:stroke-width-[3px]")}
                    />

                    {/* Hover hit area */}
                    <path d={pathD} fill="none" stroke="transparent" strokeWidth={24} />
                    
                    {/* Flux Label */}
                    <g transform={`translate(${pMx}, ${pMy})`}>
                      <rect x="-20" y="-14" width="40" height="18" fill="#0A0815" rx="6" opacity={0.9} stroke={color} strokeWidth={isSelected ? 1.5 : 0.5} strokeOpacity={0.5} filter={isSelected ? "url(#node-glow)" : ""} className="transition-all duration-300 group-hover:stroke-opacity-100" />
                      <text x="0" y="-2" textAnchor="middle" fill={color} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="900" style={{ textShadow: `0 0 10px ${color}` }}>
                        {edge.flux}%
                      </text>
                      {edge.geneTarget && (
                        <text x="0" y="14" textAnchor="middle" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" fillOpacity={0.9} fontWeight="bold">
                          {edge.geneTarget}
                        </text>
                      )}
                    </g>
                  </g>
                );
              })}

              {/* Nodes */}
              {NODES.map((node, i) => {
                const colors = NODE_COLORS[node.type];
                return (
                  <motion.g 
                    key={node.id} 
                    className="cursor-pointer"
                    initial={{ y: 0 }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                  >
                    {/* Outer Glow */}
                    <circle cx={node.x} cy={node.y} r={42} fill={colors.fill} opacity={0.4} filter="url(#node-glow)" />
                    {/* Main Node */}
                    <circle cx={node.x} cy={node.y} r={36} fill="#0A0815" stroke={colors.stroke} strokeWidth={2} className="transition-all duration-300" />
                    {/* Inner core */}
                    <circle cx={node.x} cy={node.y} r={30} fill={colors.fill} opacity={0.3} />
                    
                    <text x={node.x} y={node.y - 2} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                      {node.label}
                    </text>
                    {node.sublabel && (
                      <text x={node.x} y={node.y + 12} textAnchor="middle" fill={colors.text} fontSize="8" fontFamily="'JetBrains Mono', monospace" fillOpacity={0.9} fontWeight="bold">
                        {node.sublabel}
                      </text>
                    )}
                  </motion.g>
                );
              })}

              {/* Legend */}
              <g transform="translate(20, 340)">
                <rect x="-10" y="-10" width="540" height="30" fill="#0A0815" fillOpacity={0.8} rx="15" stroke="rgba(255,255,255,0.05)" />
                {[
                  { color: "#06b6d4", label: "Glycolytic flux" },
                  { color: "#d946ef", label: "Ethanol" },
                  { color: "#f97316", label: "TCA/Biomass" },
                  { color: "#6b7280", label: "Byproducts" },
                ].map((item, i) => (
                  <g key={i} transform={`translate(${10 + i * 130}, 0)`}>
                    <circle cx="6" cy="5" r="4" fill={item.color} filter="url(#node-glow)" />
                    <circle cx="6" cy="5" r="2" fill="#fff" />
                    <text x="18" y="8" fill="white" fontSize="10" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" opacity={0.8}>{item.label}</text>
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
                <h3 className="text-2xl font-serif font-bold text-slate-900">Enzyme Detail — {enzymeDetail.name}</h3>
                <Badge variant="outline" className="ml-auto bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30 text-xs tracking-widest uppercase font-bold py-1 px-3 rounded-full">
                  {enzymeDetail.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/40 border border-white/40 rounded-2xl p-4">
                  <div className="text-[10px] text-slate-900/40 uppercase tracking-widest mb-2 font-bold">Gene</div>
                  <div className="font-mono text-sm text-slate-900 font-bold">{enzymeDetail.gene}</div>
                </div>
                <div className="bg-white/40 border border-white/40 rounded-2xl p-4">
                  <div className="text-[10px] text-slate-900/40 uppercase tracking-widest mb-2 font-bold">k_cat</div>
                  <div className="font-mono text-sm text-fuchsia-400 font-bold">{enzymeDetail.kcat}</div>
                </div>
                <div className="bg-white/40 border border-white/40 rounded-2xl p-4">
                  <div className="text-[10px] text-slate-900/40 uppercase tracking-widest mb-2 font-bold">Km</div>
                  <div className="font-mono text-sm text-cyan-400 font-bold">{enzymeDetail.km}</div>
                </div>
                <div className="bg-white/40 border border-white/40 rounded-2xl p-4">
                  <div className="text-[10px] text-slate-900/40 uppercase tracking-widest mb-2 font-bold">Organism</div>
                  <div className="font-sans text-sm text-slate-900/70 italic">{enzymeDetail.organism}</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5">
                <div className="text-[10px] text-fuchsia-400 uppercase tracking-widest mb-2 font-bold">Engineering Strategy</div>
                <p className="text-sm font-medium text-slate-900/90 leading-relaxed">{enzymeDetail.improvement}</p>
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
                    <div className="font-serif font-bold text-xl text-slate-900">{strain.name}</div>
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-widest font-bold border ${strain.status === "validated" ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" : "text-orange-400 border-orange-500/30 bg-orange-500/10"}`}>
                      {strain.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-900/60 leading-relaxed mb-6 min-h-[60px]">{strain.description}</p>
                  <div className="flex gap-2 flex-wrap mb-6">
                    {strain.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-white/30 text-slate-900/80 border border-white/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-900/50">
                        <span>Ethanol</span>
                        <span className="font-mono text-fuchsia-400">{strain.ethanol}%</span>
                      </div>
                      <div className="h-2 bg-white/50 rounded-full overflow-hidden border border-white/40">
                        <div className="h-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.5)]" style={{ width: `${strain.ethanol}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-900/50">
                        <span>Biomass</span>
                        <span className="font-mono text-slate-900/50">{strain.biomass}%</span>
                      </div>
                      <div className="h-2 bg-white/50 rounded-full overflow-hidden border border-white/40">
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
            <h3 className="text-lg font-bold text-slate-900 mb-6 bg-white/30 p-3 rounded-xl border border-white/50 text-center font-mono">
              {STRAINS[selectedStrain].name}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
              {[
                { label: "EtOH Yield", value: `${STRAINS[selectedStrain].ethanol}%`, note: "max 95.1%", color: "text-fuchsia-400" },
                { label: "Biomass", value: `${STRAINS[selectedStrain].biomass}%`, note: "gDCW/gGlc", color: "text-slate-900/60" },
                { label: "Glc Uptake", value: "2.1", note: "mmol/gDCW·h", color: "text-cyan-400" },
                { label: "O₂ Req.", value: "Anaer.", note: "mode", color: "text-orange-400" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col justify-center p-4 rounded-2xl border border-white/40 bg-white/40 text-center shadow-inner">
                  <div className="text-[10px] text-slate-900/40 uppercase tracking-widest font-bold mb-2">{item.label}</div>
                  <div className={`text-2xl font-mono font-black ${item.color}`}>{item.value}</div>
                  <div className="text-[10px] text-slate-900/30 mt-1">{item.note}</div>
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <Button className="w-full bg-gradient-to-r from-orange-600 to-rose-500 text-slate-900 rounded-xl py-6 font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all">
                Export SBML Model
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
