import React, { useState } from "react";
import {
  useListRetrainingRuns,
  useTriggerRetrainingRun,
  getListRetrainingRunsQueryKey,
} from "@workspace/api-client-react";
import type { RetrainingRun } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings2, Plus, TrendingUp, Database, CheckCircle2, RefreshCcw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Glass Card Component ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/50 shadow-[0_0_40px_rgba(0,0,0,0.5)]", className)}>
    <div className="h-full w-full rounded-[calc(2.5rem-0.375rem)] bg-white/60 backdrop-blur-3xl border border-white/50 p-6 md:p-8 relative overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
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
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: "spring", bounce: 0.4 } },
};

const triggerSchema = z.object({
  triggeredBy: z.string().min(1, "Name is required"),
});

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

export default function Retraining() {
  const { data: runs, isLoading } = useListRetrainingRuns({
    query: { queryKey: getListRetrainingRunsQueryKey() },
  });
  const triggerRun = useTriggerRetrainingRun();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof triggerSchema>>({
    resolver: zodResolver(triggerSchema),
    defaultValues: { triggeredBy: "" },
  });

  const onSubmit = (values: z.infer<typeof triggerSchema>) => {
    triggerRun.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRetrainingRunsQueryKey() });
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  const chartData = runs
    ? [...runs].reverse().map((run: RetrainingRun, i: number) => ({
        run: `Run ${i + 1}`,
        Before: parseFloat(((run.accuracyBefore ?? 0) * 100).toFixed(1)),
        After: parseFloat(((run.accuracyAfter ?? 0) * 100).toFixed(1)),
      }))
    : [];

  const latestRun: RetrainingRun | undefined = runs?.[0];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold tracking-[0.25em] uppercase mb-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <RefreshCcw className="w-4 h-4 animate-spin-slow" />
            Machine Learning
          </div>
          <h1 className="text-5xl font-serif font-black tracking-tight text-slate-900 mb-2 drop-shadow-lg">Model Retraining</h1>
          <p className="text-lg text-slate-900/60 max-w-xl font-medium">Closed-loop learning from experimental feedback with provenance.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-500 text-slate-900 rounded-full px-8 py-6 font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all">
              <Settings2 className="w-5 h-5" />
              Trigger Retraining
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] bg-[#0F0C29]/95 backdrop-blur-3xl border-white/60 text-slate-900 rounded-[2rem] shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif font-bold text-slate-900 mb-2">Trigger Retraining</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <p className="text-sm font-medium text-slate-900/50 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/40">
                  This run recalibrates prediction weights based on newly logged experimental data and generates a human-reviewable audit trail.
                </p>
                <FormField
                  control={form.control}
                  name="triggeredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900/70">Authorized Supervisor</FormLabel>
                      <FormControl>
                        <Input className="bg-white/40 border-white/50 focus-visible:ring-cyan-500 rounded-xl px-4 py-6 text-lg" placeholder="Dr. Arjun Patel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={triggerRun.isPending} className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-bold rounded-full py-6 text-lg">
                    {triggerRun.isPending ? "Initializing Weights..." : "Commence Retraining"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      {latestRun && (
        <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div variants={staggerChild as any}>
            <GlassCard className="hover:scale-[1.02] transition-transform">
              <div className="text-[10px] text-slate-900/40 font-bold uppercase tracking-widest mb-4">Current Accuracy</div>
              <div className="text-5xl font-mono font-black text-cyan-400 drop-shadow-md mb-2">
                {((latestRun.accuracyAfter ?? 0) * 100).toFixed(1)}%
              </div>
              <div className="text-xs font-bold text-slate-900/30 uppercase tracking-widest">Latest run</div>
            </GlassCard>
          </motion.div>
          <motion.div variants={staggerChild as any}>
            <GlassCard className="hover:scale-[1.02] transition-transform">
              <div className="text-[10px] text-slate-900/40 font-bold uppercase tracking-widest mb-4">Improvement</div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-5xl font-mono font-black text-emerald-400 drop-shadow-md">
                  +{(((latestRun.accuracyAfter ?? 0) - (latestRun.accuracyBefore ?? 0)) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-xs font-bold text-slate-900/30 uppercase tracking-widest">vs. pre-training</div>
            </GlassCard>
          </motion.div>
          <motion.div variants={staggerChild as any}>
            <GlassCard className="hover:scale-[1.02] transition-transform">
              <div className="text-[10px] text-slate-900/40 font-bold uppercase tracking-widest mb-4">Data Points Used</div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-5xl font-mono font-black text-blue-400 drop-shadow-md">
                  {latestRun.dataPointsUsed}
                </div>
              </div>
              <div className="text-xs font-bold text-slate-900/30 uppercase tracking-widest">experimental results</div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Accuracy Trend Chart */}
        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <GlassCard className="h-full">
              <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 flex items-center gap-3 relative z-10">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                Accuracy Trend
              </h2>
              <div className="bg-white/40 p-6 rounded-3xl border border-white/40 relative z-10 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="run" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "bold", fontFamily: "monospace" }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={[60, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "bold", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Accuracy']} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 }} />
                    <ReferenceLine y={90} stroke="rgba(6,182,212,0.3)" strokeDasharray="4 4" label={{ value: "90% target", fill: "rgba(6,182,212,0.8)", fontSize: 10, fontWeight: "bold", position: "insideTopLeft", dy: -10 }} />
                    <Line type="monotone" dataKey="Before" stroke="rgba(255,255,255,0.2)" strokeWidth={3} dot={{ fill: "rgba(255,255,255,0.2)", r: 4 }} activeDot={{ r: 6 }} name="Pre-train" />
                    <Line type="monotone" dataKey="After" stroke="#22d3ee" strokeWidth={4} dot={{ fill: "#22d3ee", r: 6, stroke: "#080310", strokeWidth: 2 }} activeDot={{ r: 8, fill: "#fff" }} name="Post-train" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Retraining History */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex flex-col h-full">
          <GlassCard className="flex-1 flex flex-col">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-slate-900/50" />
              Run History
            </h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full bg-white/30 rounded-[2rem]" />)}
              </div>
            ) : !runs || runs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Settings2 className="w-12 h-12 text-slate-900/20 mb-4" />
                <p className="text-slate-900/40 font-medium">No Retraining Runs Yet</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[350px]">
                {runs.map((run: RetrainingRun, i: number) => (
                  <div key={run.id} className="p-5 rounded-2xl bg-white/40 border border-white/40 hover:bg-white/30 transition-colors group">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg">Run #{runs.length - i}</div>
                          <div className="text-[10px] uppercase tracking-widest text-slate-900/40 font-bold">
                            By {run.triggeredBy}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px] tracking-widest uppercase font-bold py-1 px-2 rounded-md">
                        {run.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between bg-[#050505] p-3 rounded-xl border border-white/40">
                      <div className="font-mono text-sm">
                        <span className="text-slate-900/40">{((run.accuracyBefore ?? 0) * 100).toFixed(1)}%</span>
                        <span className="text-slate-900/20 mx-2">→</span>
                        <span className="text-cyan-400 font-bold">{((run.accuracyAfter ?? 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-[10px] text-slate-900/30 font-mono font-bold uppercase tracking-widest">
                        {run.dataPointsUsed} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
