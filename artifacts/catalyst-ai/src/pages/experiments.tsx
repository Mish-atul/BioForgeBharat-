import React from "react";
import { Link } from "wouter";
import { useListExperiments, getListExperimentsQueryKey } from "@workspace/api-client-react";
import type { ExperimentWithCandidate } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Plus, TrendingUp, TrendingDown, Minus, ArrowRight, Network } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Glass Card Component ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] group hover:bg-white/[0.06] transition-colors duration-500", className)}>
    <div className="h-full w-full rounded-[calc(2.5rem-0.375rem)] bg-[#080310]/90 backdrop-blur-3xl border border-white/10 p-6 md:p-8 relative overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
      {children}
    </div>
  </div>
);

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: "spring", bounce: 0.4 } },
};

function DeltaBadge({ predicted, measured }: { predicted: number; measured: number }) {
  const delta = measured - predicted;
  const pct = (delta * 100).toFixed(1);
  if (Math.abs(delta) < 0.03) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
        <Minus className="w-3 h-3" /> {pct}%
      </span>
    );
  }
  if (delta > 0) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
        <TrendingUp className="w-3 h-3" /> +{pct}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
      <TrendingDown className="w-3 h-3" /> {pct}%
    </span>
  );
}

export default function Experiments() {
  const { data: experiments, isLoading } = useListExperiments({
    query: { queryKey: getListExperimentsQueryKey() },
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold tracking-[0.25em] uppercase mb-4 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
            <Network className="w-4 h-4 animate-pulse" />
            Validation
          </div>
          <h1 className="text-5xl font-serif font-black tracking-tight text-white mb-2 drop-shadow-lg">Experiments Log</h1>
          <p className="text-lg text-white/60 max-w-xl font-medium">Experimental validation results with predicted vs. measured comparison.</p>
        </div>
        <Link href="/experiments/new">
          <Button className="gap-2 bg-gradient-to-r from-orange-600 to-rose-500 text-white rounded-full px-8 py-6 font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] transition-all">
            <Plus className="w-5 h-5" />
            Log Experiment
          </Button>
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-[2.5rem]" />)}
        </div>
      ) : !experiments || experiments.length === 0 ? (
        <div className="p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/10">
          <div className="rounded-[calc(2.5rem-0.375rem)] bg-[#080310]/90 backdrop-blur-2xl p-16 text-center border border-white/5">
            <FlaskConical className="w-16 h-16 mx-auto text-orange-500/50 mb-6" />
            <h3 className="text-2xl font-serif font-bold text-white mb-2">No Experiments Logged</h3>
            <p className="text-white/50 max-w-sm mx-auto">
              Log your first experimental result to begin validating AI predictions.
            </p>
            <Link href="/experiments/new">
              <Button className="mt-8 bg-orange-600 hover:bg-orange-500 text-white rounded-full px-8 py-6 font-bold shadow-lg">
                <Plus className="w-5 h-5 mr-2" /> Log First Experiment
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="space-y-6">
          {experiments.map((exp: ExperimentWithCandidate) => (
            <Link key={exp.id} href={`/experiments/${exp.id}`}>
              <motion.div variants={staggerChild as any} whileHover={{ scale: 1.01 }}>
                <GlassCard className="cursor-pointer group hover:shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full group-hover:bg-orange-500/10 transition-colors duration-500 pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <FlaskConical className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black font-mono tracking-tight text-white group-hover:text-orange-300 transition-colors">
                            {exp.candidateName}
                          </h3>
                          <div className="text-sm font-medium text-white/50 mt-1">
                            by {exp.researcherName} · {new Date(exp.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2 bg-white/5 text-white/70 border-white/10 px-3 py-1 font-mono text-[10px] tracking-widest uppercase rounded-full">
                        {exp.reactionName}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 md:gap-8 bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Activity</div>
                        <div className="font-mono text-xl font-black text-white mb-2">
                          {(exp.measuredActivity * 100).toFixed(1)}%
                        </div>
                        <div className="flex justify-center"><DeltaBadge predicted={exp.predictedActivity} measured={exp.measuredActivity} /></div>
                      </div>
                      <div className="text-center border-l border-white/10 pl-4 md:pl-8">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Selectivity</div>
                        <div className="font-mono text-xl font-black text-white mb-2">
                          {(exp.measuredSelectivity * 100).toFixed(1)}%
                        </div>
                        <div className="flex justify-center"><DeltaBadge predicted={exp.predictedSelectivity} measured={exp.measuredSelectivity} /></div>
                      </div>
                      <div className="text-center border-l border-white/10 pl-4 md:pl-8">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Yield</div>
                        <div className="font-mono text-2xl font-black text-orange-400 drop-shadow-md">
                          {(exp.measuredYield * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden lg:flex w-12 h-12 rounded-full bg-white/5 border border-white/10 items-center justify-center group-hover:bg-orange-500/20 group-hover:border-orange-500/40 transition-all duration-300 flex-shrink-0">
                      <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}
