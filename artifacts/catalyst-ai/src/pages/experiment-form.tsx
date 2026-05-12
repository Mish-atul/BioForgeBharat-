import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  useCreateExperiment,
  useListCandidatesForReaction,
  useListReactions,
  getListExperimentsQueryKey,
} from "@workspace/api-client-react";
import type { Reaction, Candidate, Experiment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, FlaskConical, Beaker, Network } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Glass Card Component ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/50 shadow-[0_0_40px_rgba(0,0,0,0.5)] group", className)}>
    <div className="h-full w-full rounded-[calc(2.5rem-0.375rem)] bg-white/60 backdrop-blur-3xl border border-white/40 p-8 relative overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
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

const formSchema = z.object({
  reactionId: z.string().min(1, "Select a reaction"),
  candidateId: z.string().min(1, "Select a candidate"),
  measuredActivity: z.coerce.number().min(0).max(1),
  measuredSelectivity: z.coerce.number().min(0).max(1),
  measuredYield: z.coerce.number().min(0).max(1),
  researcherName: z.string().min(1, "Researcher name is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ExperimentForm() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedReactionId, setSelectedReactionId] = useState<number | null>(null);

  const { data: reactions } = useListReactions();
  const { data: candidates } = useListCandidatesForReaction(
    selectedReactionId ?? 0,
    undefined,
    {
      query: {
        enabled: !!selectedReactionId,
        queryKey: ["candidates-for-reaction", selectedReactionId],
      },
    },
  );
  const createExperiment = useCreateExperiment();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reactionId: "",
      candidateId: "",
      measuredActivity: 0,
      measuredSelectivity: 0,
      measuredYield: 0,
      researcherName: "",
      notes: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createExperiment.mutate(
      {
        data: {
          candidateId: Number(values.candidateId),
          measuredActivity: values.measuredActivity,
          measuredSelectivity: values.measuredSelectivity,
          measuredYield: values.measuredYield,
          researcherName: values.researcherName,
          notes: values.notes,
        },
      },
      {
        onSuccess: (exp: Experiment) => {
          queryClient.invalidateQueries({ queryKey: getListExperimentsQueryKey() });
          setLocation(`/experiments/${exp.id}`);
        },
      }
    );
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } } as any} className="space-y-10 max-w-3xl mx-auto pb-20">
      
      {/* Header */}
      <motion.div variants={fadeUp as any} custom={0} className="flex items-start gap-6">
        <Link href="/experiments">
          <Button variant="ghost" className="rounded-full w-12 h-12 bg-white/30 border border-white/50 hover:bg-white/10 hover:text-slate-900 transition-all shadow-lg p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold tracking-[0.25em] uppercase mb-4 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
            <FlaskConical className="w-4 h-4 animate-pulse" />
            Lab Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-slate-900 drop-shadow-lg mb-2">Log Experiment</h1>
          <p className="text-lg text-slate-900/50 font-medium">Record in-vitro validation results for an AI-generated candidate.</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp as any} custom={1}>
        <GlassCard>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 relative z-10 flex items-center gap-3">
            <Network className="w-6 h-6 text-orange-400" />
            Experimental Results
          </h2>

          <div className="relative z-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/40 p-6 rounded-3xl border border-white/40 shadow-inner">
                  <FormField
                    control={form.control}
                    name="reactionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900/60 font-bold uppercase tracking-widest text-[10px]">Target Reaction</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            setSelectedReactionId(Number(val));
                            form.setValue("candidateId", "");
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/30 border-white/50 h-14 rounded-2xl focus:ring-orange-500 text-slate-900 font-medium">
                              <SelectValue placeholder="Select reaction..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#0F0C29] border-white/50 text-slate-900 rounded-2xl">
                            {reactions?.map((r: Reaction) => (
                              <SelectItem key={r.id} value={String(r.id)} className="focus:bg-white/10">{r.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="candidateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900/60 font-bold uppercase tracking-widest text-[10px]">Candidate Model</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedReactionId || !candidates?.length}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/30 border-white/50 h-14 rounded-2xl focus:ring-orange-500 text-slate-900 font-medium">
                              <SelectValue placeholder={selectedReactionId ? "Select candidate..." : "Select reaction first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#0F0C29] border-white/50 text-slate-900 rounded-2xl">
                            {candidates?.map((c: Candidate) => (
                              <SelectItem key={c.id} value={String(c.id)} className="focus:bg-white/10">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-white/40 p-6 rounded-3xl border border-white/40 shadow-inner">
                  <FormField
                    control={form.control}
                    name="researcherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900/60 font-bold uppercase tracking-widest text-[10px]">Lead Researcher</FormLabel>
                        <FormControl>
                          <Input className="bg-white/30 border-white/50 h-14 rounded-2xl focus-visible:ring-orange-500 text-slate-900 font-medium text-lg px-4" placeholder="e.g., Dr. Priya Sharma" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/40 p-6 rounded-3xl border border-white/40 shadow-inner">
                  <FormField
                    control={form.control}
                    name="measuredActivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900/60 font-bold uppercase tracking-widest text-[10px]">Activity (0–1)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            placeholder="0.85"
                            className="font-mono bg-white/30 border-white/50 h-14 rounded-2xl focus-visible:ring-orange-500 text-cyan-400 font-bold text-xl px-4 text-center"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="measuredSelectivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900/60 font-bold uppercase tracking-widest text-[10px]">Selectivity (0–1)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            placeholder="0.78"
                            className="font-mono bg-white/30 border-white/50 h-14 rounded-2xl focus-visible:ring-orange-500 text-fuchsia-400 font-bold text-xl px-4 text-center"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="measuredYield"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900/60 font-bold uppercase tracking-widest text-[10px]">Yield (0–1)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            placeholder="0.72"
                            className="font-mono bg-white/30 border-white/50 h-14 rounded-2xl focus-visible:ring-orange-500 text-orange-400 font-bold text-xl px-4 text-center"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-white/40 p-6 rounded-3xl border border-white/40 shadow-inner">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900/60 font-bold uppercase tracking-widest text-[10px]">Observations & Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed conditions, anomalies, synthesis challenges..."
                            className="min-h-[140px] resize-none bg-white/30 border-white/50 rounded-2xl focus-visible:ring-orange-500 text-slate-900 font-medium p-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6 flex justify-end">
                  <Button type="submit" disabled={createExperiment.isPending} className="w-full md:w-auto bg-gradient-to-r from-orange-600 to-rose-500 text-slate-900 font-bold rounded-full px-10 py-7 text-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:-translate-y-1 transition-all duration-300">
                    <FlaskConical className="w-5 h-5 mr-3" />
                    {createExperiment.isPending ? "Syncing to LIMS..." : "Commit Results to Registry"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeUp as any} custom={2}>
        <div className="p-6 rounded-3xl border border-blue-500/20 bg-blue-500/5 flex gap-4 items-start shadow-inner">
          <Beaker className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <p className="text-sm text-blue-200/70 font-medium leading-relaxed">
            <strong className="text-blue-400 block mb-1">Architecture Integration Note:</strong> 
            For the hackathon sandbox, researchers log results manually via this UI. In a production GPS Renewables pilot, this pipeline automatically ingests structured outputs from robotic synthesis platforms (LIMS) via REST, securely matching <code className="text-xs bg-blue-500/20 px-1 py-0.5 rounded">candidateId</code> to physical assay results to trigger immediate model retraining.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
