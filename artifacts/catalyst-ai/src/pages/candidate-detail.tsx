import React from "react";
import { useParams, Link } from "wouter";
import { useGetCandidate, getGetCandidateQueryKey } from "@workspace/api-client-react";
import type { Experiment } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Atom,
  FlaskConical,
  Clock,
  Database,
  ExternalLink,
  ChevronRight,
  BrainCircuit,
  Activity,
  Plus
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Glass Card Component ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/50 shadow-[0_0_40px_rgba(0,0,0,0.5)] group hover:bg-white/[0.06] transition-colors duration-500", className)}>
    <div className="h-full w-full rounded-[calc(2.5rem-0.375rem)] bg-white/60 backdrop-blur-3xl border border-white/40 p-6 md:p-8 relative overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
      {children}
    </div>
  </div>
);

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)", scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { delay: i * 0.1, duration: 0.8, type: "spring", bounce: 0.4 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: "spring", bounce: 0.5 } },
};

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(10, 5, 20, 0.95)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 16,
  color: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: "bold"
};

interface StructureNode {
  id: string;
  x: number;
  y: number;
  r?: number;
  color?: string;
}
interface StructureEdge {
  from: string;
  to: string;
}
interface StructureData {
  nodes: StructureNode[];
  edges: StructureEdge[];
}

function MoleculeViz({ structureData }: { structureData: string }) {
  let data: StructureData | null = null;
  try {
    data = JSON.parse(structureData) as StructureData;
  } catch {
    return <div className="text-xs text-slate-900/40 italic">Structure data unavailable</div>;
  }
  if (!data || !data.nodes) return null;

  const nodeMap = Object.fromEntries(data.nodes.map((n) => [n.id, n]));
  const w = 200;
  const h = 160;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48 rounded-2xl bg-white/40 border border-white/40 drop-shadow-xl">
      <defs>
        <filter id="glow-cyan">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {data.edges?.map((edge, i) => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return null;
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="rgba(6, 182, 212, 0.6)"
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        );
      })}
      {data.nodes.map((node) => (
        <g key={node.id} className="hover:-translate-y-1 transition-transform cursor-pointer">
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r ?? 18}
            fill={`${node.color ?? "#06b6d4"}33`}
            stroke={node.color ?? "#06b6d4"}
            strokeWidth={2}
            filter="url(#glow-cyan)"
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fff"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {node.id}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface MolecularPropertiesCandidate {
  pubchemCid?: number | null;
  chemblId?: string | null;
  molecularWeight?: number | null;
  logP?: number | null;
  tpsa?: number | null;
  canonicalSmiles?: string | null;
  iupacName?: string | null;
  sourceDb?: string | null;
}

function MolecularPropertiesCard({ candidate }: { candidate: MolecularPropertiesCandidate }) {
  const hasAnyProp =
    candidate.molecularWeight != null ||
    candidate.logP != null ||
    candidate.tpsa != null ||
    candidate.canonicalSmiles != null ||
    candidate.iupacName != null ||
    candidate.pubchemCid != null ||
    candidate.chemblId != null;

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
          <Database className="w-5 h-5 text-cyan-400" />
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-900">Molecular Properties</h3>
        {candidate.sourceDb && (
          <Badge variant="outline" className="ml-auto bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-[10px] tracking-widest uppercase font-bold py-1 px-3 rounded-full">
            {candidate.sourceDb}
          </Badge>
        )}
      </div>
      <div className="space-y-4 relative z-10">
        {!hasAnyProp ? (
          <div className="text-slate-900/50 italic py-4">
            No matching record in PubChem or ChEMBL for this structure.
          </div>
        ) : (
          <>
            {candidate.iupacName && (
              <div className="bg-white/40 border border-white/40 rounded-2xl p-4">
                <div className="text-[10px] text-slate-900/40 uppercase tracking-widest mb-2 font-bold">IUPAC Name</div>
                <div className="font-mono text-xs text-slate-900/90 leading-relaxed break-words font-medium">
                  {candidate.iupacName}
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <PropCell label="MW (g/mol)" value={candidate.molecularWeight?.toFixed(2)} color="text-fuchsia-400" />
              <PropCell label="logP" value={candidate.logP?.toFixed(2)} color="text-orange-400" />
              <PropCell label="TPSA (Å²)" value={candidate.tpsa?.toFixed(1)} color="text-cyan-400" />
            </div>
            {candidate.canonicalSmiles && (
              <div className="bg-white/40 border border-white/40 rounded-2xl p-4">
                <div className="text-[10px] text-slate-900/40 uppercase tracking-widest mb-2 font-bold">Canonical SMILES</div>
                <div className="font-mono text-xs text-cyan-400 font-bold break-all leading-relaxed">
                  {candidate.canonicalSmiles}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              {candidate.pubchemCid != null && (
                <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${candidate.pubchemCid}`} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:bg-blue-500/20 transition-colors">
                  PubChem CID {candidate.pubchemCid}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {candidate.chemblId && (
                <a href={`https://www.ebi.ac.uk/chembl/compound_report_card/${candidate.chemblId}/`} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 hover:bg-fuchsia-500/20 transition-colors">
                  {candidate.chemblId}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}

function PropCell({ label, value, color }: { label: string; value: string | undefined; color: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/40 p-4 flex flex-col justify-center items-center text-center shadow-inner">
      <div className="text-[10px] uppercase tracking-widest text-slate-900/40 font-bold mb-2">{label}</div>
      <div className={`font-mono text-lg font-black ${color}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function parseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function ExtendedScoreGrid({ candidate }: { candidate: {
  feedstockFitScore?: number | null;
  costScore?: number | null;
  sustainabilityScore?: number | null;
  scalabilityScore?: number | null;
  uncertaintyScore?: number | null;
} }) {
  const items = [
    ["Feedstock Fit", candidate.feedstockFitScore, "text-fuchsia-400", "bg-fuchsia-500/10 border-fuchsia-500/20"],
    ["Cost Fit", candidate.costScore, "text-blue-400", "bg-blue-500/10 border-blue-500/20"],
    ["Sustainability", candidate.sustainabilityScore, "text-cyan-400", "bg-cyan-500/10 border-cyan-500/20"],
    ["Scalability", candidate.scalabilityScore, "text-orange-400", "bg-orange-500/10 border-orange-500/20"],
    ["Uncertainty", candidate.uncertaintyScore, "text-rose-400", "bg-rose-500/10 border-rose-500/20"],
  ] as const;

  return (
    <GlassCard>
      <h3 className="text-xl font-serif font-bold text-slate-900 mb-6 relative z-10 flex items-center gap-3">
        <BrainCircuit className="w-5 h-5 text-orange-400" />
        Feasibility Scores
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
        {items.map(([label, value, textColor, bgColor]) => (
          <div key={label} className={cn("rounded-2xl border p-4 text-center shadow-inner", bgColor)}>
            <div className="text-[10px] uppercase tracking-widest text-slate-900/60 font-bold mb-2">{label}</div>
            <div className={cn("font-mono text-xl font-black drop-shadow-md", textColor)}>
              {typeof value === "number" ? `${(value * 100).toFixed(0)}%` : "—"}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const candidateId = Number(id);

  const { data, isLoading } = useGetCandidate(candidateId, {
    query: { queryKey: getGetCandidateQueryKey(candidateId) },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-80 bg-white/10 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96 bg-white/30 rounded-[2.5rem]" />
          <Skeleton className="h-96 bg-white/30 rounded-[2.5rem] lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { candidate, experiments } = data;

  const radarData = [
    { metric: "Activity", predicted: candidate.predictedActivity * 100, measured: null },
    { metric: "Selectivity", predicted: candidate.predictedSelectivity * 100, measured: null },
    { metric: "Stability", predicted: candidate.predictedStability * 100, measured: null },
    { metric: "Confidence", predicted: candidate.confidenceScore * 100, measured: null },
  ];

  const comparisonData = experiments.length > 0
    ? [
        {
          name: "Activity",
          Predicted: parseFloat((candidate.predictedActivity * 100).toFixed(1)),
          Measured: parseFloat((experiments[0].measuredActivity * 100).toFixed(1)),
        },
        {
          name: "Selectivity",
          Predicted: parseFloat((candidate.predictedSelectivity * 100).toFixed(1)),
          Measured: parseFloat((experiments[0].measuredSelectivity * 100).toFixed(1)),
        },
      ]
    : [];

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer as any} className="space-y-8 pb-20">
      
      {/* Header */}
      <motion.div variants={fadeUp as any} custom={0} className="flex items-start gap-6">
        <Link href={`/reactions/${candidate.reactionId}`}>
          <Button variant="ghost" className="rounded-full w-12 h-12 bg-white/30 border border-white/50 hover:bg-white/10 hover:text-slate-900 transition-all shadow-lg p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Atom className="w-5 h-5 text-fuchsia-400" />
            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full", candidate.source === "generated" ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30")}>
              {candidate.source}
            </Badge>
            {candidate.rank && (
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border-orange-500/30">
                Rank #{candidate.rank}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-slate-900 drop-shadow-lg">{candidate.name}</h1>
          <div className="font-mono text-lg text-cyan-400 font-bold mt-2 tracking-tight">{candidate.formula}</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <motion.div variants={fadeUp as any} custom={1} className="space-y-8">
          
          {/* Structure */}
          <GlassCard>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none" />
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-6 relative z-10 flex items-center gap-3">
              <Atom className="w-5 h-5 text-cyan-400" />
              Molecular Structure
            </h3>
            <div className="relative z-10">
              <MoleculeViz structureData={candidate.structureData} />
            </div>
          </GlassCard>

          {/* Predictions */}
          <GlassCard>
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-6 relative z-10 flex items-center gap-3">
              <BrainCircuit className="w-5 h-5 text-fuchsia-400" />
              Predicted Performance
            </h3>
            <div className="space-y-5 relative z-10">
              {[
                { label: "Activity", value: candidate.predictedActivity, color: "from-fuchsia-600 to-fuchsia-400", glow: "shadow-[0_0_10px_rgba(217,70,239,0.5)]" },
                { label: "Selectivity", value: candidate.predictedSelectivity, color: "from-cyan-600 to-cyan-400", glow: "shadow-[0_0_10px_rgba(6,182,212,0.5)]" },
                { label: "Stability", value: candidate.predictedStability, color: "from-orange-600 to-orange-400", glow: "shadow-[0_0_10px_rgba(249,115,22,0.5)]" },
                { label: "Confidence", value: candidate.confidenceScore, color: "from-yellow-600 to-yellow-400", glow: "shadow-[0_0_10px_rgba(234,179,8,0.5)]" },
              ].map(({ label, value, color, glow }) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-900/50">
                    <span>{label}</span>
                    <span className="font-mono text-slate-900/90">{(value * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-white/50 rounded-full overflow-hidden border border-white/40">
                    <div className={cn("h-full rounded-full bg-gradient-to-r", color, glow)} style={{ width: `${value * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <MolecularPropertiesCard candidate={candidate} />
        </motion.div>

        {/* Right Column */}
        <motion.div variants={fadeUp as any} custom={2} className="lg:col-span-2 space-y-8">
          
          <ExtendedScoreGrid candidate={candidate} />

          {/* Mechanism */}
          <GlassCard>
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-6 relative z-10 flex items-center gap-3">
              <FlaskConical className="w-5 h-5 text-orange-400" />
              Proposed Mechanism
            </h3>
            <div className="relative z-10 bg-white/40 border border-white/40 rounded-2xl p-6">
              <p className="text-base leading-relaxed text-slate-900/80 font-medium">{candidate.mechanismText}</p>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard>
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-6 relative z-10 flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-400" />
                Profile Mapping
              </h3>
              <div className="relative z-10">
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "bold", fontFamily: "monospace" }} />
                    <Radar name="Predicted" dataKey="predicted" stroke="#d946ef" fill="#d946ef" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col">
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-3">
                  <FlaskConical className="w-5 h-5 text-emerald-400" />
                  Validation
                  <span className="ml-2 font-mono text-sm text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {experiments.length}
                  </span>
                </h3>
                <Link href="/experiments/new">
                  <Button size="sm" variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-300">
                    <Plus className="w-4 h-4 mr-1" />
                    Log Result
                  </Button>
                </Link>
              </div>
              
              <div className="relative z-10 flex-1 flex flex-col justify-center">
                {experiments.length === 0 ? (
                  <div className="text-center py-8">
                    <FlaskConical className="w-10 h-10 mx-auto mb-3 text-slate-900/20" />
                    <p className="text-sm font-medium text-slate-900/40">No experiments logged yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comparisonData.length > 0 && (
                      <div className="mb-6">
                        <ResponsiveContainer width="100%" height={140}>
                          <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", fontWeight: "bold" }} axisLine={false} tickLine={false} dy={5} />
                            <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace", fontWeight: "bold" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif', fontWeight: 'bold' }} />
                            <Bar dataKey="Predicted" fill="#d946ef" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Measured" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {experiments.map((exp: Experiment) => (
                      <Link key={exp.id} href={`/experiments/${exp.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-white/40 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-pointer bg-white/40 group shadow-inner">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">{exp.researcherName}</div>
                            <div className="text-sm font-medium text-slate-900/80">
                              Activity: <span className="font-mono text-slate-900 font-bold">{(exp.measuredActivity * 100).toFixed(1)}%</span>
                              <span className="mx-2 text-slate-900/20">|</span>
                              Yield: <span className="font-mono text-slate-900 font-bold">{(exp.measuredYield * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold font-mono uppercase tracking-widest text-slate-900/40 group-hover:text-emerald-300 transition-colors">
                            <Clock className="w-3 h-3" />
                            {new Date(exp.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
