import React from "react";
import { motion } from "framer-motion";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  Beaker, 
  Network, 
  BrainCircuit,
  ArrowUpRight,
  Download,
  CheckCircle2,
  Database,
  RefreshCcw,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// --- Framer Motion variants ---
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

// --- Components ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] group hover:bg-white/[0.06] transition-colors duration-500", className)}>
    <div className="h-full w-full rounded-[calc(2.5rem-0.375rem)] bg-[#080310]/90 backdrop-blur-3xl border border-white/10 p-6 md:p-8 relative overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
      {children}
    </div>
  </div>
);

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-12 w-80 bg-white/10 rounded-xl mb-3" />
          <Skeleton className="h-5 w-full max-w-xl bg-white/5 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full bg-white/5 rounded-[2.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-12">
      
      {/* Header Section */}
      <motion.div variants={fadeUp as any} custom={0} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 text-xs font-bold tracking-[0.25em] uppercase mb-5 shadow-[0_0_30px_rgba(217,70,239,0.2)]">
            <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
            Control Center
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-4 drop-shadow-lg">
            Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-rose-500 to-orange-500">Overview</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl font-medium leading-relaxed">
            Monitor agentic molecular discovery metrics, experiments, and active synthesis pathways.
          </p>
        </div>
        
        <Button
          variant="outline"
          size="lg"
          className="gap-3 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full px-8 py-6 text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.95] transition-all duration-300"
          onClick={() => {
            const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
            window.open(`${apiBase}/api/export/session`, "_blank");
          }}
        >
          <Download className="w-5 h-5" />
          Export Session Data
        </Button>
      </motion.div>

      {/* Top Metrics Grid */}
      <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <motion.div variants={staggerChild as any}>
          <MetricCard title="Total Reactions" value={stats.totalReactions} icon={Beaker} glow="bg-fuchsia-600/30" iconColor="text-fuchsia-400" />
        </motion.div>
        <motion.div variants={staggerChild as any}>
          <MetricCard title="Candidates Synthesized" value={stats.totalCandidates} icon={Network} glow="bg-blue-600/30" iconColor="text-blue-400" />
        </motion.div>
        <motion.div variants={staggerChild as any}>
          <MetricCard title="Experiments Logged" value={stats.totalExperiments} icon={Activity} glow="bg-orange-500/30" iconColor="text-orange-400" />
        </motion.div>
        <motion.div variants={staggerChild as any}>
          <MetricCard title="Prediction Accuracy" value={`${(stats.avgPredictionAccuracy * 100).toFixed(1)}%`} icon={BrainCircuit} valueColor="text-yellow-400" glow="bg-yellow-500/30" iconColor="text-yellow-400" />
        </motion.div>
      </motion.div>

      {/* Workflow Pipeline */}
      <motion.div variants={fadeUp as any} custom={3}>
        <GlassCard>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-rose-600/10 to-fuchsia-600/10 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <h2 className="text-3xl font-bold text-white mb-10 relative z-10 flex items-center gap-4">
            <Activity className="w-8 h-8 text-rose-400" />
            AI Discovery Pipeline
          </h2>
          <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {[
              { icon: Beaker, title: "Target Definition", detail: "CO₂, syngas, biomass to chemicals", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30" },
              { icon: Database, title: "Knowledge Retrieval", detail: "Literature & Sandbox extraction", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
              { icon: BrainCircuit, title: "Generative Design", detail: "Agentic ranking & simulation", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
              { icon: RefreshCcw, title: "Feedback Loop", detail: "Continuous pipeline retraining", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
            ].map((step, i) => (
              <motion.div 
                key={i} 
                variants={staggerChild as any}
                whileHover={{ y: -6, scale: 1.03 }}
                className={cn("flex flex-col gap-5 rounded-3xl border bg-black/40 p-8 transition-all duration-500 shadow-lg hover:shadow-2xl", step.border)}
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-white/10", step.bg, step.color)}>
                  <step.icon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-lg font-bold text-white mb-2">
                    {step.title}
                  </div>
                  <div className="text-sm text-white/60 leading-relaxed font-medium">{step.detail}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-16">
        {/* Top Candidates */}
        <motion.div variants={fadeUp as any} custom={4} className="h-full">
          <GlassCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Network className="w-6 h-6 text-cyan-400" />
                High-Confidence Candidates
              </h2>
            </div>
            
            <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="space-y-4 relative z-10 flex-1">
              {stats.topCandidates.map((candidate, i) => (
                <motion.div key={candidate.id} variants={staggerChild as any}>
                  <Link href={`/candidates/${candidate.id}`}>
                    <div className="flex items-center justify-between p-5 rounded-2xl border border-white/10 bg-black/60 hover:bg-white/10 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group shadow-md hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-sm border border-cyan-500/30 group-hover:scale-110 group-hover:bg-cyan-500/30 transition-all duration-300 shadow-[inset_0_0_10px_rgba(6,182,212,0.5)]">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-mono text-lg font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight">{candidate.formula}</div>
                          <div className="text-sm text-white/50 mt-1 font-medium">{candidate.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1">Confidence</div>
                          <div className="font-mono text-lg font-bold text-cyan-400">{(candidate.confidenceScore * 100).toFixed(1)}%</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors border border-white/5 group-hover:border-cyan-500/50">
                          <ArrowUpRight className="w-5 h-5 text-white/70 group-hover:text-cyan-300 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeUp as any} custom={5} className="h-full">
          <GlassCard className="h-full flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-8 relative z-10 flex items-center gap-3">
              <Activity className="w-6 h-6 text-orange-400" />
              Agent Activity Log
            </h2>
            
            <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="space-y-4 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {stats.recentActivity.map((activity, i) => (
                <motion.div key={i} variants={staggerChild as any}>
                  <div className="flex items-start gap-5 p-5 rounded-2xl bg-black/60 border border-white/10 hover:bg-white/[0.08] hover:border-orange-500/30 transition-all duration-300 group shadow-md">
                    <div className="w-3 h-3 mt-1.5 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,1)] flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <div>
                      <div className="text-xs text-orange-400 font-bold font-mono uppercase tracking-widest mb-2">{activity.type}</div>
                      <div className="text-base font-semibold text-white/90 leading-relaxed group-hover:text-white transition-colors">{activity.description}</div>
                      <div className="text-sm text-white/40 mt-3 font-mono font-medium">{new Date(activity.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, icon: Icon, valueColor = "text-white", glow = "bg-fuchsia-500/20", iconColor = "text-fuchsia-400" }: { title: string, value: string | number, icon: LucideIcon, valueColor?: string, glow?: string, iconColor?: string }) {
  return (
    <div className="p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-2xl group hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
      <div className="h-full w-full rounded-[calc(2.5rem-0.375rem)] bg-[#080310]/90 backdrop-blur-2xl border border-white/10 p-8 relative overflow-hidden">
        <div className={cn("absolute -top-12 -right-12 w-40 h-40 blur-[50px] rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700", glow)} />
        <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className={cn("w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500")}>
              <Icon className={cn("w-7 h-7 transition-colors", iconColor)} />
            </div>
          </div>
          <div className="mt-8">
            <p className={cn("text-5xl font-black font-mono tracking-tighter mb-2 drop-shadow-md", valueColor)}>{value}</p>
            <p className="text-sm font-bold text-white/60 uppercase tracking-widest">{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
