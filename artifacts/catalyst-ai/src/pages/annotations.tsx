import React, { useState } from "react";
import {
  useListAnnotations,
  useCreateAnnotation,
  useDeleteAnnotation,
  getListAnnotationsQueryKey,
} from "@workspace/api-client-react";
import type { Annotation, ExperimentWithCandidate } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Database, Plus, Search, User, FlaskConical, Trash2 } from "lucide-react";
import { useListExperiments } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Glass Card Component ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-1.5 rounded-[2rem] bg-white/[0.04] border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] group", className)}>
    <div className="h-full w-full rounded-[calc(2rem-0.375rem)] bg-[#080310]/90 backdrop-blur-3xl border border-white/10 p-6 relative overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
      {children}
    </div>
  </div>
);

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: "spring", bounce: 0.4 } },
};

const annotationSchema = z.object({
  experimentId: z.coerce.number().min(1, "Select an experiment"),
  author: z.string().min(1, "Author name is required"),
  content: z.string().min(5, "Annotation must be at least 5 characters"),
});

export default function Annotations() {
  const { data: annotations, isLoading } = useListAnnotations({
    query: { queryKey: getListAnnotationsQueryKey() },
  });
  const { data: experiments } = useListExperiments();
  const createAnnotation = useCreateAnnotation();
  const deleteAnnotation = useDeleteAnnotation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleDelete = (id: number) => {
    if (!confirm("Delete this annotation?")) return;
    deleteAnnotation.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAnnotationsQueryKey() }) }
    );
  };

  const form = useForm<z.infer<typeof annotationSchema>>({
    resolver: zodResolver(annotationSchema),
    defaultValues: { experimentId: 0, author: "", content: "" },
  });

  const onSubmit = (values: z.infer<typeof annotationSchema>) => {
    createAnnotation.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAnnotationsQueryKey() });
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  const filtered = annotations?.filter(
    (a: Annotation) =>
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase()) ||
      a.candidateName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-xs font-bold tracking-[0.25em] uppercase mb-4 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <Database className="w-4 h-4 animate-pulse" />
            Knowledge Base
          </div>
          <h1 className="text-5xl font-serif font-black tracking-tight text-white mb-2 drop-shadow-lg">Annotations</h1>
          <p className="text-lg text-white/60 max-w-xl font-medium">Team knowledge base — observations, hypotheses, and insights.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-yellow-600 to-orange-500 text-white rounded-full px-8 py-6 font-bold shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] transition-all text-black">
              <Plus className="w-5 h-5 text-black" />
              Add Annotation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#0F0C29]/95 backdrop-blur-3xl border-white/20 text-white rounded-[2rem] shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif font-bold text-white mb-2">New Annotation</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="experimentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Experiment</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full rounded-xl border border-white/10 bg-black/40 text-white px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                        >
                          <option value={0} className="bg-[#0F0C29]">Select an experiment...</option>
                          {experiments?.map((e: ExperimentWithCandidate) => (
                            <option key={e.id} value={e.id} className="bg-[#0F0C29]">
                              {e.candidateName} — {e.researcherName}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Author</FormLabel>
                      <FormControl>
                        <Input className="bg-black/40 border-white/10 focus-visible:ring-yellow-500 rounded-xl px-4 py-6" placeholder="Dr. Priya Sharma" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Annotation</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Key insight, recommendation, or observation..."
                          className="min-h-[140px] resize-none bg-black/40 border-white/10 focus-visible:ring-yellow-500 rounded-xl p-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-6 border-t border-white/10">
                  <Button type="submit" disabled={createAnnotation.isPending} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full px-8 py-6">
                    {createAnnotation.isPending ? "Saving..." : "Save Annotation"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-white/40" />
        </div>
        <Input
          placeholder="Search observations, authors, or candidates..."
          className="pl-14 py-8 bg-white/5 border-white/10 rounded-full text-lg focus-visible:ring-yellow-500 text-white placeholder:text-white/30 shadow-inner"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-[2rem]" />)}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/10">
          <div className="rounded-[calc(2.5rem-0.375rem)] bg-[#080310]/90 backdrop-blur-2xl p-16 text-center border border-white/5">
            <Database className="w-16 h-16 mx-auto text-yellow-500/50 mb-6" />
            <h3 className="text-2xl font-serif font-bold text-white mb-2">{search ? "No matching annotations" : "No Annotations Yet"}</h3>
            <p className="text-white/50 max-w-sm mx-auto">
              {search ? "Try a different search term." : "Add your first annotation to build the team knowledge base."}
            </p>
          </div>
        </div>
      ) : (
        <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="columns-1 md:columns-2 gap-6 space-y-6">
          {filtered.map((annotation: Annotation) => (
            <motion.div key={annotation.id} variants={staggerChild as any} className="break-inside-avoid">
              <GlassCard className="hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] transition-all">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-[2px] flex-shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                    <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-bold text-lg text-white">{annotation.author}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs font-mono font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                            <FlaskConical className="w-3 h-3" />
                            {annotation.candidateName}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-widest">
                          {new Date(annotation.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDelete(annotation.id)}
                          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                          title="Delete annotation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl mb-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                      <p className="text-base text-white/90 leading-relaxed font-medium pl-2">{annotation.content}</p>
                    </div>
                    <div className="text-xs text-white/40 font-medium italic border-t border-white/5 pt-3">
                      "{annotation.experimentSummary}"
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
