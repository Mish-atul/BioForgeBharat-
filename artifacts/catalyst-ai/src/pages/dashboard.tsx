import React from "react";
import { motion } from "framer-motion";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  type LucideIcon,
} from "lucide-react";
import { Link } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full bg-card" />
          <Skeleton className="h-32 w-full bg-card" />
          <Skeleton className="h-32 w-full bg-card" />
          <Skeleton className="h-32 w-full bg-card" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} custom={0} className="flex justify-between items-end gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">BioForgeBharat Overview</h1>
          <p className="text-muted-foreground mt-2">
            Agentic molecular discovery for sustainable fuels, catalysis, and synthetic biology.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border text-muted-foreground hover:text-foreground"
          onClick={() => {
            const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
            window.open(`${apiBase}/api/export/session`, "_blank");
          }}
          data-testid="btn-export-session"
        >
          <Download className="w-4 h-4" />
          Export Session JSON
        </Button>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={staggerChild}>
          <MetricCard title="Total Reactions" value={stats.totalReactions} icon={Beaker} />
        </motion.div>
        <motion.div variants={staggerChild}>
          <MetricCard title="Candidates" value={stats.totalCandidates} icon={Network} />
        </motion.div>
        <motion.div variants={staggerChild}>
          <MetricCard title="Experiments" value={stats.totalExperiments} icon={Activity} />
        </motion.div>
        <motion.div variants={staggerChild}>
          <MetricCard title="Avg Accuracy" value={`${(stats.avgPredictionAccuracy * 100).toFixed(1)}%`} icon={BrainCircuit} valueColor="text-accent" />
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp} custom={3}>
        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-5">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { icon: Beaker, title: "Target Reaction", detail: "CO2, syngas, ethanol-to-jet, biomass routes" },
                { icon: DatabaseIcon, title: "Knowledge Retrieval", detail: "Public databases plus seeded sandbox evidence" },
                { icon: BrainCircuit, title: "AI Design + Ranking", detail: "Gemini when configured, deterministic fallback otherwise" },
                { icon: RefreshCcw, title: "Feedback Learning", detail: "Experiment logs recalibrate prediction confidence" },
              ].map((step, i) => (
                <motion.div key={i} variants={staggerChild}>
                  <WorkflowStep icon={step.icon} title={step.title} detail={step.detail} />
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={staggerChild}>
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Top Ranked Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                {stats.topCandidates.map((candidate, i) => (
                  <motion.div key={candidate.id} variants={staggerChild}>
                    <Link href={`/candidates/${candidate.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:border-primary hover:shadow-[0_0_12px_rgba(34,197,94,0.08)] transition-all duration-300 cursor-pointer group">
                        <div>
                          <div className="font-mono text-sm font-bold text-foreground">{candidate.formula}</div>
                          <div className="text-xs text-muted-foreground">{candidate.name}</div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Confidence</div>
                            <div className="font-mono text-accent">{(candidate.confidenceScore * 100).toFixed(1)}%</div>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                {stats.recentActivity.map((activity, i) => (
                  <motion.div key={i} variants={staggerChild}>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors duration-300">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                      <div>
                        <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{activity.type}</div>
                        <div className="text-sm font-medium mt-0.5">{activity.description}</div>
                        <div className="text-xs text-muted-foreground mt-1 font-mono">{new Date(activity.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const DatabaseIcon = FileText;

function WorkflowStep({ title, detail, icon: Icon }: { title: string; detail: string; icon: LucideIcon }) {
  return (
    <div className="flex items-start gap-3 rounded border border-border bg-background p-3 hover:border-primary/40 transition-colors duration-300">
      <div className="mt-0.5 rounded bg-primary/10 p-2 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
          {title}
        </div>
        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{detail}</div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, valueColor = "text-foreground" }: { title: string, value: string | number, icon: LucideIcon, valueColor?: string }) {
  return (
    <Card className="bg-card border-border hover:border-primary/40 hover:shadow-[0_0_16px_rgba(34,197,94,0.06)] transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-mono font-bold ${valueColor}`}>{value}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors duration-300">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
