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
  FileText,
  RefreshCcw,
  Sparkles,
  Database,
  type LucideIcon,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// --- Framer Motion variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.32, 0.72, 0, 1] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] as const } },
};

// --- Components ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-1.5 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-2xl group", className)}>
    <div className="h-full w-full rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-6 md:p-8 relative overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
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
          <Skeleton className="h-10 w-64 bg-white/10 rounded-lg mb-2" />
          <Skeleton className="h-4 w-96 bg-white/5 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full bg-white/5 rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-12">
      
      {/* Header Section */}
      <motion.div variants={fadeUp} custom={0} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium tracking-[0.2em] uppercase mb-4 shadow-[0_0_24px_rgba(16,185,129,0.1)]">
            <Sparkles className="w-3 h-3" />
            Control Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
            Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-cyan-500">Overview</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl font-light">
            Monitor agentic molecular discovery metrics, experiments, and active synthesis pathways.
          </p>
        </div>
        
        <Button
          variant="outline"
          size="lg"
          className="gap-3 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-full px-6 active:scale-[0.98] transition-all duration-300"
          onClick={() => {
            const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
            window.open(`${apiBase}/api/export/session`, "_blank");
          }}
        >
          <Download className="w-4 h-4" />
          Export Session Data
        </Button>
      </motion.div>

      {/* Top Metrics Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={staggerChild}>
          <MetricCard title="Total Reactions" value={stats.totalReactions} icon={Beaker} glow="bg-emerald-500/20" />
        </motion.div>
        <motion.div variants={staggerChild}>
          <MetricCard title="Candidates Synthesized" value={stats.totalCandidates} icon={Network} glow="bg-cyan-500/20" />
        </motion.div>
        <motion.div variants={staggerChild}>
          <MetricCard title="Experiments Logged" value={stats.totalExperiments} icon={Activity} glow="bg-blue-500/20" />
        </motion.div>
        <motion.div variants={staggerChild}>
          <MetricCard title="Prediction Accuracy" value={`${(stats.avgPredictionAccuracy * 100).toFixed(1)}%`} icon={BrainCircuit} valueColor="text-emerald-400" glow="bg-purple-500/20" />
        </motion.div>
      </motion.div>

      {/* Workflow Pipeline */}
      <motion.div variants={fadeUp} custom={3}>
        <GlassCard>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <h2 className="text-xl font-semibold text-white mb-8 relative z-10 flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            AI Discovery Pipeline
          </h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {[
              { icon: Beaker, title: "Target Definition", detail: "CO₂, syngas, biomass to chemicals", delay: 0 },
              { icon: Database, title: "Knowledge Retrieval", detail: "Literature & Sandbox extraction", delay: 0.1 },
              { icon: BrainCircuit, title: "Generative Design", detail: "Agentic ranking & simulation", delay: 0.2 },
              { icon: RefreshCcw, title: "Feedback Loop", detail: "Continuous pipeline retraining", delay: 0.3 },
            ].map((step, i) => (
              <motion.div 
                key={i} 
                variants={staggerChild}
                whileHover={{ y: -4, scale: 1.02 }}
                className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-2">
                    {step.title}
                  </div>
                  <div className="text-xs text-white/40 leading-relaxed font-light">{step.detail}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        {/* Top Candidates */}
        <motion.div variants={fadeUp} custom={4} className="h-full">
          <GlassCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <Network className="w-5 h-5 text-cyan-400" />
                High-Confidence Candidates
              </h2>
            </div>
            
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3 relative z-10 flex-1">
              {stats.topCandidates.map((candidate, i) => (
                <motion.div key={candidate.id} variants={staggerChild}>
                  <Link href={`/candidates/${candidate.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/40 hover:bg-white/5 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono text-xs border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-mono text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">{candidate.formula}</div>
                          <div className="text-xs text-white/40 mt-1">{candidate.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Confidence</div>
                          <div className="font-mono text-sm text-emerald-400">{(candidate.confidenceScore * 100).toFixed(1)}%</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                          <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-emerald-400 transition-colors" />
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
        <motion.div variants={fadeUp} custom={5} className="h-full">
          <GlassCard className="h-full flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-8 relative z-10 flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400" />
              Agent Activity Log
            </h2>
            
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {stats.recentActivity.map((activity, i) => (
                <motion.div key={i} variants={staggerChild}>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:bg-white/[0.03] transition-colors duration-300 group">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-blue-400 font-mono uppercase tracking-widest mb-1">{activity.type}</div>
                      <div className="text-sm font-medium text-white/80 leading-relaxed group-hover:text-white transition-colors">{activity.description}</div>
                      <div className="text-xs text-white/30 mt-2 font-mono">{new Date(activity.createdAt).toLocaleString()}</div>
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

function MetricCard({ title, value, icon: Icon, valueColor = "text-white", glow = "bg-emerald-500/20" }: { title: string, value: string | number, icon: LucideIcon, valueColor?: string, glow?: string }) {
  return (
    <div className="p-1.5 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-xl group hover:-translate-y-1 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
      <div className="h-full w-full rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 p-6 relative overflow-hidden">
        <div className={cn("absolute -top-10 -right-10 w-32 h-32 blur-[40px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500", glow)} />
        <div className="relative z-10 flex flex-col justify-between h-full min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            </div>
          </div>
          <div className="mt-6">
            <p className={`text-4xl font-mono font-bold tracking-tight mb-2 ${valueColor}`}>{value}</p>
            <p className="text-sm font-medium text-white/40 uppercase tracking-wider">{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
