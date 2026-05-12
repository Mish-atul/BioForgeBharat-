import React from "react";
import { useParams, Link } from "wouter";
import {
  useGetExperiment,
  useAnalyzeDiscrepancy,
  getGetExperimentQueryKey,
  getListExperimentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Brain, TrendingUp, TrendingDown, Minus, FlaskConical, User, FileText, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
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

function DeltaIndicator({ predicted, measured, label }: { predicted: number; measured: number; label: string }) {
  const delta = measured - predicted;
  const pct = (Math.abs(delta) * 100).toFixed(1);
  const isMatch = Math.abs(delta) < 0.03;
  const isUp = delta > 0 && !isMatch;
  const color = isMatch ? "text-slate-900/50" : isUp ? "text-emerald-400" : "text-rose-400";
  const Icon = isMatch ? Minus : isUp ? TrendingUp : TrendingDown;
  const sign = isUp ? "+" : !isMatch ? "-" : "";

  return (
    <div className="flex flex-col justify-center items-center p-6 rounded-3xl bg-white/40 border border-white/40 shadow-inner">
      <div className="text-[10px] text-slate-900/40 uppercase tracking-widest font-bold mb-3">{label}</div>
      <div className="flex items-center gap-4">
        <div className="text-4xl font-mono font-black text-slate-900 drop-shadow-md">{(measured * 100).toFixed(1)}%</div>
        <div className={cn("flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-white/30 border border-white/50 shadow-inner", color)}>
          <Icon className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-mono font-bold">{sign}{pct}%</span>
        </div>
      </div>
      <div className="text-xs text-slate-900/30 font-mono mt-3">
        Predicted: <span className="font-bold text-slate-900/50">{(predicted * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>();
  const experimentId = Number(id);
  const queryClient = useQueryClient();

  const { data: experiment, isLoading } = useGetExperiment(experimentId, {
    query: { queryKey: getGetExperimentQueryKey(experimentId) },
  });

  const analyzeDiscrepancy = useAnalyzeDiscrepancy();

  const handleAnalyze = () => {
    analyzeDiscrepancy.mutate(
      { id: experimentId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetExperimentQueryKey(experimentId) });
          queryClient.invalidateQueries({ queryKey: getListExperimentsQueryKey() });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-80 bg-white/10 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 bg-white/30 rounded-[2.5rem]" />)}
        </div>
        <Skeleton className="h-80 bg-white/30 rounded-[2.5rem]" />
      </div>
    );
  }

  if (!experiment) return null;

  const chartData = [
    {
      name: "Activity",
      Predicted: parseFloat((experiment.predictedActivity * 100).toFixed(1)),
      Measured: parseFloat((experiment.measuredActivity * 100).toFixed(1)),
    },
    {
      name: "Selectivity",
      Predicted: parseFloat((experiment.predictedSelectivity * 100).toFixed(1)),
      Measured: parseFloat((experiment.measuredSelectivity * 100).toFixed(1)),
    },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer as any} className="space-y-8 pb-20">
      
      {/* Header */}
      <motion.div variants={fadeUp as any} custom={0} className="flex items-start gap-6">
        <Link href="/experiments">
          <Button variant="ghost" className="rounded-full w-12 h-12 bg-white/30 border border-white/50 hover:bg-white/10 hover:text-slate-900 transition-all shadow-lg p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <FlaskConical className="w-5 h-5 text-orange-400" />
            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-[10px] tracking-widest uppercase font-bold py-1 px-3 rounded-full">
              {experiment.reactionName}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-slate-900 drop-shadow-lg mb-2">
            {experiment.candidateName}
          </h1>
          <div className="font-mono text-lg text-orange-300 font-bold tracking-tight">{experiment.candidateFormula}</div>
        </div>
        <div className="text-right text-xs text-slate-900/50 font-medium">
          <div className="flex items-center justify-end gap-2 mb-2 bg-white/30 px-3 py-1.5 rounded-full border border-white/50">
            <User className="w-3 h-3 text-orange-400" />
            <span className="text-slate-900 font-bold">{experiment.researcherName}</span>
          </div>
          <div className="font-mono tracking-widest uppercase">
            {new Date(experiment.createdAt).toLocaleString()}
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div variants={staggerContainer as any} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={staggerChild as any}>
          <GlassCard className="h-full">
            <DeltaIndicator predicted={experiment.predictedActivity} measured={experiment.measuredActivity} label="Measured Activity" />
          </GlassCard>
        </motion.div>
        <motion.div variants={staggerChild as any}>
          <GlassCard className="h-full">
            <DeltaIndicator predicted={experiment.predictedSelectivity} measured={experiment.measuredSelectivity} label="Measured Selectivity" />
          </GlassCard>
        </motion.div>
        <motion.div variants={staggerChild as any}>
          <GlassCard className="h-full">
            <div className="flex flex-col justify-center items-center p-6 rounded-3xl bg-white/40 border border-white/40 shadow-inner h-full">
              <div className="text-[10px] text-slate-900/40 uppercase tracking-widest font-bold mb-3">Measured Yield</div>
              <div className="text-5xl font-mono font-black text-orange-400 drop-shadow-lg">
                {(experiment.measuredYield * 100).toFixed(1)}%
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comparison Chart */}
        <motion.div variants={fadeUp as any} custom={3}>
          <GlassCard className="h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 relative z-10 flex items-center gap-3">
              <Activity className="w-6 h-6 text-orange-400" />
              Predicted vs. Measured
            </h2>
            <div className="bg-white/40 p-6 rounded-3xl border border-white/40 relative z-10 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "bold", fontFamily: "monospace" }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "bold", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'sans-serif' }} />
                  <Bar dataKey="Predicted" fill="#d946ef" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Measured" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Discrepancy & Notes */}
        <motion.div variants={fadeUp as any} custom={4} className="space-y-8 flex flex-col">
          <GlassCard className="flex-1">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
                <Brain className="w-6 h-6 text-fuchsia-400" />
                AI Discrepancy Analysis
              </h2>
              <Button
                onClick={handleAnalyze}
                disabled={analyzeDiscrepancy.isPending}
                className="gap-2 bg-gradient-to-r from-fuchsia-600 to-rose-500 text-slate-900 rounded-full px-6 py-5 font-bold shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all"
              >
                <Brain className="w-4 h-4" />
                {analyzeDiscrepancy.isPending ? "Analyzing..." : "Analyze Model Gap"}
              </Button>
            </div>
            
            <div className="relative z-10 flex-1">
              {experiment.discrepancyHypothesis ? (
                <div className="p-6 rounded-3xl border border-fuchsia-500/30 bg-fuchsia-500/10 shadow-inner">
                  <div className="text-[10px] text-fuchsia-400 uppercase tracking-widest font-bold mb-3">Model Hypothesis</div>
                  <p className="text-base leading-relaxed text-slate-900/90 font-medium">{experiment.discrepancyHypothesis}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-white/40 rounded-3xl border border-white/40">
                  <Brain className="w-12 h-12 text-slate-900/20 mb-4" />
                  <p className="text-slate-900/50 font-medium max-w-sm">
                    Click "Analyze Model Gap" to generate a scientific hypothesis explaining the variance between predictive modeling and physical lab results.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          {experiment.notes && (
            <GlassCard>
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-6 relative z-10 flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-900/50" />
                Researcher Notes
              </h2>
              <div className="relative z-10 bg-white/40 border border-white/40 rounded-3xl p-6 shadow-inner">
                <p className="text-base leading-relaxed text-slate-900/80 font-medium">{experiment.notes}</p>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
