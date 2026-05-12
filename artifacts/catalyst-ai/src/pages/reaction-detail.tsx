import React, { useMemo, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  useGetReaction,
  useListCandidatesForReaction,
  useGenerateCandidates,
  useDeleteReaction,
  useSearchCandidates,
  getGetReactionQueryKey,
  getListCandidatesForReactionQueryKey,
} from "@workspace/api-client-react";
import type {
  Candidate,
  ListCandidatesForReactionParams,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Beaker,
  Dna,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Download,
  Search,
  Database,
  LayoutGrid,
  Rows3,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Trophy,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Glass Card Component ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] group", className)}>
    <div className="h-full w-full rounded-[calc(2.5rem-0.375rem)] bg-[#1A1528]/80 backdrop-blur-3xl border border-white/5 p-6 md:p-8 relative overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
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

type SortBy =
  | "rank"
  | "predictedActivity"
  | "predictedSelectivity"
  | "predictedStability"
  | "confidenceScore";
type SortDir = "asc" | "desc";
type SourceFilter = "all" | "generated" | "literature";

const METRIC_KEYS = [
  "predictedActivity",
  "predictedSelectivity",
  "predictedStability",
  "confidenceScore",
] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

function MetricBar({ label, value, color = "bg-primary" }: { label: string; value: number; color?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/50">
        <span>{label}</span>
        <span className="font-mono text-white/90">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
        <div
          className={cn("h-full rounded-full transition-all duration-700 shadow-[0_0_10px_currentColor]", color)}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 text-white/20" />;
  return dir === "asc" ? <ArrowUp className="w-3 h-3 text-white" /> : <ArrowDown className="w-3 h-3 text-white" />;
}

// ... [csv functions removed for brevity - assume they are kept identical] ...
function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCandidatesCsv(candidates: Candidate[], reactionId: number) {
  const headers = [
    "rank", "name", "formula", "source", "sourceDb", "candidateType", "routeType",
    "predictedActivity", "predictedSelectivity", "predictedStability", "confidenceScore",
    "feedstockFitScore", "costScore", "sustainabilityScore", "scalabilityScore", "uncertaintyScore",
    "molecularWeight", "logP", "tpsa", "evidenceText",
  ];
  const lines = [headers.join(",")];
  for (const c of candidates) {
    lines.push(
      [
        c.rank ?? "", c.name, c.formula, c.source, c.sourceDb ?? "", c.candidateType ?? "", c.routeType ?? "",
        c.predictedActivity, c.predictedSelectivity, c.predictedStability, c.confidenceScore,
        c.feedstockFitScore ?? "", c.costScore ?? "", c.sustainabilityScore ?? "", c.scalabilityScore ?? "", c.uncertaintyScore ?? "",
        c.molecularWeight ?? "", c.logP ?? "", c.tpsa ?? "", c.evidenceText ?? "",
      ].map(escapeCsv).join(","),
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reaction-${reactionId}-candidates.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function scoreValue(value: number | null | undefined) {
  return typeof value === "number" ? value : 0;
}

function AgentTrace({ isBio }: { isBio: boolean }) {
  const agents = [
    ["Orchestrator", "Interprets constraints"],
    ["Literature", "Retrieves known evidence"],
    ["Design", isBio ? "Proposes variants" : "Proposes active-sites"],
    ["Simulation", isBio ? "Estimates bottlenecks" : "Estimates energy profile"],
    ["Critique", "Checks scalability & cost"],
    ["Feedback", "Recalibrates rankings"],
  ];

  return (
    <GlassCard className="p-1 rounded-[2rem]">
      <div className="p-4 md:p-6 bg-[#1A1528]/80 backdrop-blur-3xl rounded-[calc(2rem-0.375rem)] border border-white/5">
        <div className="flex items-center gap-3 text-sm text-white font-bold uppercase tracking-widest mb-6">
          <BrainCircuit className="w-5 h-5 text-fuchsia-400" />
          Virtual Research Swarm
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {agents.map(([name, detail]) => (
            <div key={name} className="rounded-2xl border border-white/5 bg-black/40 p-4 shadow-inner flex flex-col items-center text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <div className="text-sm font-bold text-white mb-1">{name}</div>
              <div className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest font-bold">{detail}</div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

export default function ReactionDetail() {
  const { id } = useParams<{ id: string }>();
  const reactionId = Number(id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSummary, setSearchSummary] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sortBy, setSortBy] = useState<SortBy>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const candidatesParams: ListCandidatesForReactionParams = {
    sortBy,
    sortDir,
    ...(sourceFilter !== "all" ? { source: sourceFilter } : {}),
  };

  const { data: reaction, isLoading: rxnLoading } = useGetReaction(reactionId, {
    query: { queryKey: getGetReactionQueryKey(reactionId) },
  });

  const { data: candidates, isLoading: candLoading } = useListCandidatesForReaction(
    reactionId,
    candidatesParams,
    {
      query: { queryKey: getListCandidatesForReactionQueryKey(reactionId, candidatesParams) },
    },
  );

  const generateCandidates = useGenerateCandidates();
  const deleteReaction = useDeleteReaction();
  const searchCandidates = useSearchCandidates();

  const bestPerMetric = useMemo(() => {
    const best: Record<MetricKey, number> = {
      predictedActivity: -Infinity,
      predictedSelectivity: -Infinity,
      predictedStability: -Infinity,
      confidenceScore: -Infinity,
    };
    if (!candidates) return best;
    for (const c of candidates) {
      if (c.source === "literature") continue;
      for (const k of METRIC_KEYS) {
        const v = c[k];
        if (typeof v === "number" && v > best[k]) best[k] = v;
      }
    }
    return best;
  }, [candidates]);

  const handleGenerate = () => {
    setGenerating(true);
    generateCandidates.mutate(
      { id: reactionId, data: { count: 5 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCandidatesForReactionQueryKey(reactionId) });
          setGenerating(false);
        },
        onError: () => setGenerating(false),
      }
    );
  };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchSummary(null);
    searchCandidates.mutate(
      { id: reactionId, params: { query: q } },
      {
        onSuccess: (result) => {
          queryClient.invalidateQueries({
            queryKey: getListCandidatesForReactionQueryKey(reactionId),
          });
          const sources = result.sourcesQueried.join(" + ");
          setSearchSummary(
            result.candidates.length === 0
              ? `No matches in ${sources} for "${result.query}".`
              : `Imported ${result.candidates.length} reference compound${result.candidates.length === 1 ? "" : "s"} from ${sources}.`,
          );
          setSearchQuery("");
        },
        onError: () => {
          setSearchSummary("Search failed. Please try again.");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!confirm("Delete this reaction and all its candidates?")) return;
    deleteReaction.mutate(
      { id: reactionId },
      { onSuccess: () => setLocation("/reactions") }
    );
  };

  const toggleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir(column === "rank" ? "asc" : "desc");
    }
  };

  if (rxnLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64 bg-white/10 rounded-xl" />
        <Skeleton className="h-48 w-full bg-white/5 rounded-[2.5rem]" />
        <Skeleton className="h-96 w-full bg-white/5 rounded-[2.5rem]" />
      </div>
    );
  }

  if (!reaction) {
    return (
      <div className="text-center py-32">
        <Beaker className="w-16 h-16 mx-auto mb-6 text-white/20" />
        <h2 className="text-3xl font-serif font-bold text-white mb-2">Reaction Disconnected</h2>
        <p className="text-white/50 mb-8">This chemical pathway no longer exists in the registry.</p>
        <Link href="/reactions">
          <Button className="bg-white/10 text-white hover:bg-white/20 rounded-full px-8 py-6 font-bold border border-white/20">Return to Library</Button>
        </Link>
      </div>
    );
  }

  const isDomainBio = reaction.domain === "synthetic-biology";

  const sortableMetricColumns: { key: SortBy; label: string }[] = [
    { key: "predictedActivity", label: "Activity" },
    { key: "predictedSelectivity", label: "Selectivity" },
    { key: "predictedStability", label: "Stability" },
    { key: "confidenceScore", label: "Confidence" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } } as any} className="space-y-10 pb-20 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <motion.div variants={fadeUp as any} custom={0} className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-start gap-6">
          <Link href="/reactions">
            <Button variant="ghost" className="rounded-full w-12 h-12 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all shadow-lg p-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                {isDomainBio ? <Dna className="w-4 h-4 text-fuchsia-400" /> : <Beaker className="w-4 h-4 text-blue-400" />}
              </div>
              <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full", isDomainBio ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30" : "bg-blue-500/10 text-blue-400 border-blue-500/30")}>
                {isDomainBio ? "Synthetic Biology" : "Chemical Catalysis"}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-white/70 border-white/10">
                {reaction.type}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-white drop-shadow-lg">{reaction.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold h-12 px-6 shadow-lg"
            onClick={() => {
              const url = `${import.meta.env.BASE_URL}api/reactions/${reactionId}/export-candidates-csv`.replace(/\/+/g, "/");
              window.open(url, "_blank");
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="rounded-full w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all shadow-lg">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* Reaction Details */}
      <motion.div variants={fadeUp as any} custom={1}>
        <GlassCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
              <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">Reaction Equation</div>
                <div className="font-mono text-xl md:text-2xl font-black text-cyan-400 drop-shadow-md">
                  {reaction.equation}
                </div>
              </div>
              <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Target Product</div>
                <div className="text-lg font-bold text-white">{reaction.targetProduct}</div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">Thermodynamic Conditions</div>
                <div className="font-mono text-base font-bold text-orange-400 drop-shadow-md">
                  {reaction.conditions}
                </div>
              </div>
              <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner h-full">
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Notes</div>
                <div className="text-sm font-medium text-white/70 leading-relaxed">{reaction.description}</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeUp as any} custom={2}>
        <AgentTrace isBio={isDomainBio} />
      </motion.div>

      {/* Database Search & AI Generation */}
      <motion.div variants={fadeUp as any} custom={3} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Literature Search */}
        <GlassCard>
          <div className="flex flex-col justify-between h-full relative z-10">
            <div className="flex items-center gap-3 text-lg font-serif font-bold text-white mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              Literature Registry Search
            </div>
            
            <div className="space-y-4 bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !searchCandidates.isPending) handleSearch();
                  }}
                  placeholder="e.g. methanol, CHEMBL25"
                  className="h-14 rounded-2xl bg-white/5 border-white/10 font-mono text-white focus-visible:ring-blue-500 text-lg px-4"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searchCandidates.isPending || searchQuery.trim().length === 0}
                  className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
              {searchSummary && (
                <div className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-4 py-3 rounded-xl border border-blue-500/20">
                  {searchSummary}
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* AI Generation */}
        <GlassCard>
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex flex-col justify-between h-full relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-lg font-serif font-bold text-white">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-fuchsia-400" />
                </div>
                Agentic Candidate Design
              </div>
              <Badge variant="outline" className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30 font-mono text-[10px] tracking-widest uppercase py-1 px-3 rounded-full font-bold">
                Alpha Fold + LLMs
              </Badge>
            </div>
            
            <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner text-center flex flex-col items-center justify-center h-full min-h-[120px]">
              <Button
                onClick={handleGenerate}
                disabled={generating || generateCandidates.isPending}
                className="w-full max-w-sm h-14 rounded-full bg-gradient-to-r from-fuchsia-600 to-orange-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] hover:-translate-y-1 transition-all"
              >
                <Sparkles className="w-5 h-5 mr-3" />
                {generating || generateCandidates.isPending ? "Simulating Molecules..." : "Design New Candidates"}
              </Button>
            </div>
          </div>
        </GlassCard>

      </motion.div>

      {/* Candidates List */}
      <motion.div variants={fadeUp as any} custom={4} className="space-y-6">
        
        <div className="flex items-center justify-between bg-black/40 p-4 rounded-3xl border border-white/5 shadow-inner flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-serif font-bold text-white ml-2">Candidates</h2>
            {candidates && (
              <Badge className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-mono">
                {candidates.length} items
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "cards" | "table")} className="bg-white/5 p-1 rounded-xl border border-white/10">
              <ToggleGroupItem value="cards" className="rounded-lg data-[state=on]:bg-white/10 data-[state=on]:text-white text-white/50 px-4">
                <LayoutGrid className="w-4 h-4 mr-2" /> <span className="text-xs font-bold">Cards</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="table" className="rounded-lg data-[state=on]:bg-white/10 data-[state=on]:text-white text-white/50 px-4">
                <Rows3 className="w-4 h-4 mr-2" /> <span className="text-xs font-bold">Table</span>
              </ToggleGroupItem>
            </ToggleGroup>

            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
              <SelectTrigger className="w-40 h-10 rounded-xl bg-white/5 border-white/10 text-white font-medium focus:ring-fuchsia-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#110F1A] border-white/10 text-white rounded-xl">
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="generated">AI Generated</SelectItem>
                <SelectItem value="literature">Literature</SelectItem>
              </SelectContent>
            </Select>

            {viewMode === "cards" && (
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                  <SelectTrigger className="w-40 h-8 rounded-lg bg-transparent border-0 text-white font-medium focus:ring-0 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#110F1A] border-white/10 text-white rounded-xl">
                    <SelectItem value="rank">Rank</SelectItem>
                    <SelectItem value="predictedActivity">Activity</SelectItem>
                    <SelectItem value="predictedSelectivity">Selectivity</SelectItem>
                    <SelectItem value="predictedStability">Stability</SelectItem>
                    <SelectItem value="confidenceScore">Confidence</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white hover:bg-white/10" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
                  {sortDir === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        {candLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full bg-white/5 rounded-[2.5rem]" />)}
          </div>
        ) : !candidates || candidates.length === 0 ? (
          <GlassCard>
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-3">Registry Empty</h3>
              <p className="text-white/50 text-lg max-w-md mx-auto">
                {sourceFilter === "all"
                  ? "Generate new AI candidates or search the literature to populate this reaction."
                  : `No ${sourceFilter} candidates match your criteria.`}
              </p>
            </div>
          </GlassCard>
        ) : viewMode === "cards" ? (
          <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {candidates.map((candidate, i) => (
              <motion.div key={candidate.id} variants={staggerChild as any}>
                <Link href={`/candidates/${candidate.id}`}>
                  <div className="p-1.5 rounded-[2rem] bg-white/[0.04] border border-white/10 shadow-lg group hover:bg-gradient-to-br hover:from-fuchsia-500/20 hover:to-orange-500/20 transition-all duration-500 cursor-pointer hover:-translate-y-1">
                    <div className="h-full w-full rounded-[calc(2rem-0.375rem)] bg-[#1A1528]/95 border border-white/5 p-6 flex flex-col relative overflow-hidden">
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center font-mono font-black text-white/40 group-hover:text-fuchsia-400 group-hover:border-fuchsia-500/40 transition-colors shadow-inner text-xl">
                            {candidate.rank ?? i + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-xl font-bold text-white group-hover:text-white transition-colors">{candidate.name}</h4>
                              <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full", candidate.source === "generated" ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30")}>
                                {candidate.source}
                              </Badge>
                            </div>
                            <div className="font-mono text-sm text-white/50 tracking-tight font-bold">{candidate.formula}</div>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors flex-shrink-0">
                          <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                        <MetricBar label="Activity" value={candidate.predictedActivity} color="bg-fuchsia-500" />
                        <MetricBar label="Select" value={candidate.predictedSelectivity} color="bg-blue-500" />
                        <MetricBar label="Stab" value={candidate.predictedStability} color="bg-cyan-500" />
                        <MetricBar label="Conf" value={candidate.confidenceScore} color="bg-orange-500" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <GlassCard className="p-1 rounded-[2rem]">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#1A1528] overflow-hidden border border-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 bg-black/40 hover:bg-black/40">
                    <TableHead className="w-16 py-4">
                      <button type="button" onClick={() => toggleSort("rank")} className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/60 hover:text-white transition-colors">
                        Rank <SortIcon active={sortBy === "rank"} dir={sortDir} />
                      </button>
                    </TableHead>
                    <TableHead className="py-4">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Candidate</span>
                    </TableHead>
                    <TableHead className="py-4">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Source</span>
                    </TableHead>
                    {sortableMetricColumns.map((col) => (
                      <TableHead key={col.key} className="text-right py-4">
                        <button type="button" onClick={() => toggleSort(col.key)} className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/60 hover:text-white transition-colors w-full justify-end">
                          {col.label} <SortIcon active={sortBy === col.key} dir={sortDir} />
                        </button>
                      </TableHead>
                    ))}
                    <TableHead className="w-12 py-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((c, i) => (
                    <TableRow key={c.id} className="border-white/5 hover:bg-white/5 cursor-pointer group transition-colors">
                      <TableCell className="font-mono text-white/40 font-bold text-center">{c.rank ?? i + 1}</TableCell>
                      <TableCell>
                        <Link href={`/candidates/${c.id}`} className="block w-full h-full py-2">
                          <div className="font-bold text-white group-hover:text-fuchsia-300 transition-colors mb-1">{c.name}</div>
                          <div className="font-mono text-xs text-white/40">{c.formula}</div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md", c.source === "generated" ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30")}>
                          {c.source}
                        </Badge>
                      </TableCell>
                      {sortableMetricColumns.map((col) => {
                        const v = c[col.key as MetricKey] as number;
                        const isBestEligible = c.source !== "literature";
                        const isBest = isBestEligible && bestPerMetric[col.key as MetricKey] > -Infinity && v === bestPerMetric[col.key as MetricKey];
                        return (
                          <TableCell key={col.key} className={cn("text-right font-mono text-sm", isBest ? "text-fuchsia-400 font-black drop-shadow-md" : "text-white/70 font-medium")}>
                            <span className="inline-flex items-center gap-1.5 justify-end w-full">
                              {isBest && <Trophy className="w-3 h-3 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />}
                              {(v * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        <Link href={`/candidates/${c.id}`}>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-fuchsia-500/20 transition-colors ml-auto">
                            <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-fuchsia-400 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GlassCard>
        )}
      </motion.div>
    </motion.div>
  );
}
