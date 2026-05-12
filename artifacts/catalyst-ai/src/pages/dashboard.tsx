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
  Database,
  RefreshCcw,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// --- Framer Motion variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 60, filter: "blur(20px)", scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { delay: i * 0.1, duration: 1, type: "spring", bounce: 0.4 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 40, scale: 0.85, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.8, type: "spring", bounce: 0.5 } },
};

// --- Abstract Asymmetric Component ---
const AbstractCard = ({ children, className, variant = 0, hoverGlow }: { children: React.ReactNode, className?: string, variant?: number, hoverGlow?: string }) => {
  const shapes = [
    "rounded-[2.5rem_5rem_2.5rem_5rem]",
    "rounded-[5rem_2.5rem_5rem_2.5rem]",
    "rounded-[4rem_1.5rem_4rem_1.5rem]",
    "rounded-[1.5rem_4rem_1.5rem_4rem]",
  ];
  const innerShapes = [
    "rounded-[calc(2.5rem-0.2rem)_calc(5rem-0.2rem)_calc(2.5rem-0.2rem)_calc(5rem-0.2rem)]",
    "rounded-[calc(5rem-0.2rem)_calc(2.5rem-0.2rem)_calc(5rem-0.2rem)_calc(2.5rem-0.2rem)]",
    "rounded-[calc(4rem-0.2rem)_calc(1.5rem-0.2rem)_calc(4rem-0.2rem)_calc(1.5rem-0.2rem)]",
    "rounded-[calc(1.5rem-0.2rem)_calc(4rem-0.2rem)_calc(1.5rem-0.2rem)_calc(4rem-0.2rem)]",
  ];
  
  const shape = shapes[variant % shapes.length];
  const innerShape = innerShapes[variant % innerShapes.length];

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.5 }}
      className={cn(`p-1.5 bg-white/[0.02] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] group relative overflow-hidden ${shape}`, className)}
    >
      {hoverGlow && (
        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px] pointer-events-none z-0", hoverGlow)} />
      )}
      <div className={cn(`h-full w-full bg-[#1A1528]/85 backdrop-blur-3xl border border-white/5 p-8 relative flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] z-10 ${innerShape}`)}>
        {children}
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-10">
        <div>
          <Skeleton className="h-14 w-96 bg-white/10 rounded-2xl mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl bg-white/5 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-56 w-full bg-white/5 rounded-[3rem_1rem_3rem_1rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-16">
      
      {/* Header Section */}
      <motion.div variants={fadeUp as any} custom={0} className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="relative">
          <div className="absolute -inset-10 bg-fuchsia-600/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-[1rem_0.5rem_1rem_0.5rem] bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-black tracking-[0.3em] uppercase mb-6 shadow-[0_0_40px_rgba(99,102,241,0.25)]">
              <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
              Core Engine Online
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter text-white mb-6 drop-shadow-2xl leading-[0.9]">
              Computational <br/>
              <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-rose-500 to-orange-500 animate-[gradient_4s_ease_infinite] bg-[length:200%_auto]">
                Alchemy
              </span>
            </h1>
            <p className="text-2xl text-white/50 max-w-2xl font-sans font-medium leading-relaxed">
              Real-time monitoring of agentic molecular discovery and validation telemetry.
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="lg"
          className="relative z-10 gap-3 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] px-8 py-7 text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.05)] active:scale-[0.95] transition-all duration-300"
          onClick={() => {
            const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
            window.open(`${apiBase}/api/export/session`, "_blank");
          }}
        >
          <Download className="w-5 h-5" />
          Export Telemetry
        </Button>
      </motion.div>

      {/* Top Abstract Metrics Grid */}
      <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <motion.div variants={staggerChild as any}>
          <MetricCard title="Reactions Analyzed" value={stats.totalReactions} icon={Beaker} glow="bg-fuchsia-600/30" iconColor="text-fuchsia-400" variant={0} />
        </motion.div>
        <motion.div variants={staggerChild as any}>
          <MetricCard title="Molecules Synthesized" value={stats.totalCandidates} icon={Network} glow="bg-blue-600/30" iconColor="text-blue-400" variant={1} />
        </motion.div>
        <motion.div variants={staggerChild as any}>
          <MetricCard title="Validation Assays" value={stats.totalExperiments} icon={Activity} glow="bg-orange-500/30" iconColor="text-orange-400" variant={2} />
        </motion.div>
        <motion.div variants={staggerChild as any}>
          <MetricCard title="Model Precision" value={`${(stats.avgPredictionAccuracy * 100).toFixed(1)}%`} icon={BrainCircuit} valueColor="text-yellow-400" glow="bg-yellow-500/30" iconColor="text-yellow-400" variant={3} />
        </motion.div>
      </motion.div>

      {/* Workflow Pipeline */}
      <motion.div variants={fadeUp as any} custom={3}>
        <AbstractCard variant={0} className="rounded-[3rem_6rem_3rem_6rem]" hoverGlow="bg-rose-600/10">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-rose-600/10 to-transparent blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none z-0" />
          <h2 className="text-4xl font-serif font-black text-white mb-12 relative z-10 flex items-center gap-4">
            <Activity className="w-8 h-8 text-rose-400" />
            AI Synthesis Pipeline
          </h2>
          <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {[
              { icon: Beaker, title: "Target Formulation", detail: "CO₂, syngas, biomass to chemicals", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30", shape: "rounded-[2rem_1rem_2rem_1rem]" },
              { icon: Database, title: "Knowledge Extraction", detail: "Literature & Sandbox parsing", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", shape: "rounded-[1rem_2rem_1rem_2rem]" },
              { icon: BrainCircuit, title: "Generative Architecture", detail: "Agentic ranking & spatial simulation", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", shape: "rounded-[2rem_1rem_1rem_2rem]" },
              { icon: RefreshCcw, title: "Telemetry Feedback", detail: "Continuous neural recalibration", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", shape: "rounded-[1rem_2rem_2rem_1rem]" },
            ].map((step, i) => (
              <motion.div 
                key={i} 
                variants={staggerChild as any}
                whileHover={{ y: -8, scale: 1.05 }}
                className={cn("flex flex-col gap-6 border bg-black/50 p-8 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-2xl backdrop-blur-md", step.border, step.shape)}
              >
                <div className={cn("w-16 h-16 flex items-center justify-center shadow-inner border border-white/20", step.bg, step.color, step.shape)}>
                  <step.icon className="w-8 h-8" />
                </div>
                <div>
                  <div className="font-sans text-xl font-bold text-white mb-3 tracking-tight">
                    {step.title}
                  </div>
                  <div className="text-sm text-white/50 leading-relaxed font-medium">{step.detail}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AbstractCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-16">
        {/* Top Candidates */}
        <motion.div variants={fadeUp as any} custom={4} className="h-full">
          <AbstractCard variant={1} className="h-full" hoverGlow="bg-cyan-600/10">
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h2 className="text-3xl font-serif font-black text-white flex items-center gap-4">
                <Network className="w-8 h-8 text-cyan-400" />
                High-Confidence Candidates
              </h2>
            </div>
            
            <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="space-y-6 relative z-10 flex-1">
              {stats.topCandidates.map((candidate, i) => (
                <motion.div key={candidate.id} variants={staggerChild as any}>
                  <Link href={`/candidates/${candidate.id}`}>
                    <div className="flex items-center justify-between p-6 rounded-[2rem_1rem_2rem_1rem] border border-white/10 bg-black/60 hover:bg-white/10 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-[1rem_0.5rem_1rem_0.5rem] bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-mono font-black text-lg border border-cyan-500/30 group-hover:scale-110 group-hover:bg-cyan-500/30 transition-all duration-300 shadow-[inset_0_0_15px_rgba(6,182,212,0.4)]">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-mono text-xl font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight">{candidate.formula}</div>
                          <div className="text-sm text-white/40 mt-1 font-sans font-semibold">{candidate.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Confidence</div>
                          <div className="font-mono text-xl font-black text-cyan-400 drop-shadow-md">{(candidate.confidenceScore * 100).toFixed(1)}%</div>
                        </div>
                        <div className="w-12 h-12 rounded-[1rem_0.5rem_1rem_0.5rem] bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors border border-white/10 group-hover:border-cyan-500/50">
                          <ArrowUpRight className="w-5 h-5 text-white/50 group-hover:text-cyan-300 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AbstractCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeUp as any} custom={5} className="h-full">
          <AbstractCard variant={2} className="h-full flex flex-col" hoverGlow="bg-orange-600/10">
            <h2 className="text-3xl font-serif font-black text-white mb-10 relative z-10 flex items-center gap-4">
              <Activity className="w-8 h-8 text-orange-400" />
              Agent Telemetry Stream
            </h2>
            
            <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="space-y-6 relative z-10 flex-1 overflow-y-auto pr-4 custom-scrollbar">
              {stats.recentActivity.map((activity, i) => (
                <motion.div key={i} variants={staggerChild as any}>
                  <div className="flex items-start gap-6 p-6 rounded-[1rem_2rem_1rem_2rem] bg-black/60 border border-white/10 hover:bg-white/[0.08] hover:border-orange-500/40 transition-all duration-300 group shadow-lg">
                    <div className="w-4 h-4 mt-1.5 rounded-sm rotate-45 bg-gradient-to-br from-orange-400 to-rose-600 shadow-[0_0_20px_rgba(249,115,22,0.8)] flex-shrink-0 group-hover:scale-125 transition-transform duration-500" />
                    <div>
                      <div className="text-[11px] text-orange-400 font-bold font-mono uppercase tracking-widest mb-2">{activity.type}</div>
                      <div className="text-lg font-bold font-sans text-white/80 leading-relaxed group-hover:text-white transition-colors">{activity.description}</div>
                      <div className="text-xs text-white/30 mt-3 font-mono font-bold tracking-widest uppercase">{new Date(activity.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AbstractCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, icon: Icon, valueColor = "text-white", glow = "bg-fuchsia-500/20", iconColor = "text-fuchsia-400", variant }: { title: string, value: string | number, icon: LucideIcon, valueColor?: string, glow?: string, iconColor?: string, variant: number }) {
  return (
    <AbstractCard variant={variant} hoverGlow={glow}>
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
        <div className="flex justify-between items-start">
          <div className={cn("w-16 h-16 rounded-[1.2rem_0.6rem_1.2rem_0.6rem] bg-white/5 border border-white/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500 ease-[0.22,1,0.36,1]")}>
            <Icon className={cn("w-8 h-8 transition-colors duration-500", iconColor)} />
          </div>
        </div>
        <div className="mt-8">
          <p className={cn("text-6xl font-black font-mono tracking-tighter mb-3 drop-shadow-xl", valueColor)}>{value}</p>
          <p className="text-sm font-bold font-sans text-white/50 uppercase tracking-[0.2em]">{title}</p>
        </div>
      </div>
    </AbstractCard>
  );
}
