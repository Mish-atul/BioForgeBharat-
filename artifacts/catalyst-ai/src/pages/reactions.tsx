import React, { useState } from "react";
import { Link } from "wouter";
import { useListReactions, useCreateReaction, getListReactionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Beaker, Plus, Dna, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Glass Card Component ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] group hover:bg-white/[0.06] transition-colors duration-500", className)}>
    <div className="h-full w-full rounded-[calc(2.5rem-0.375rem)] bg-[#080310]/90 backdrop-blur-3xl border border-white/10 p-6 relative overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
      {children}
    </div>
  </div>
);

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: "spring", bounce: 0.5 } },
};

const createReactionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  equation: z.string().min(1, "Equation is required"),
  targetProduct: z.string().min(1, "Target product is required"),
  conditions: z.string(),
  description: z.string(),
  domain: z.enum(["chemical-catalysis", "synthetic-biology"]),
});

export default function Reactions() {
  const { data: reactions, isLoading } = useListReactions();
  const createReaction = useCreateReaction();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof createReactionSchema>>({
    resolver: zodResolver(createReactionSchema),
    defaultValues: {
      name: "",
      type: "",
      equation: "",
      targetProduct: "",
      conditions: "",
      description: "",
      domain: "chemical-catalysis",
    },
  });

  const onSubmit = (values: z.infer<typeof createReactionSchema>) => {
    createReaction.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListReactionsQueryKey() });
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold tracking-[0.25em] uppercase mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Beaker className="w-4 h-4" />
            Library
          </div>
          <h1 className="text-5xl font-serif font-black tracking-tight text-white mb-2 drop-shadow-lg">Reactions</h1>
          <p className="text-lg text-white/60 max-w-xl font-medium">Manage sustainable fuel routes across catalysis and synthetic biology.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full px-6 py-6 font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all">
              <Plus className="w-5 h-5" />
              New Reaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-[#0F0C29]/95 backdrop-blur-3xl border-white/20 text-white rounded-[2rem] shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif font-bold text-white mb-2">Initialize New Reaction</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Reaction Name</FormLabel>
                      <FormControl>
                        <Input className="bg-black/40 border-white/10 focus-visible:ring-blue-500" placeholder="e.g. CO2 Hydrogenation to Methanol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Domain</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/40 border-white/10 focus:ring-blue-500">
                              <SelectValue placeholder="Select domain" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#0F0C29] border-white/10 text-white">
                            <SelectItem value="chemical-catalysis">Chemical Catalysis</SelectItem>
                            <SelectItem value="synthetic-biology">Synthetic Biology</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Reaction Type</FormLabel>
                        <FormControl>
                          <Input className="bg-black/40 border-white/10 focus-visible:ring-blue-500" placeholder="e.g. Heterogeneous catalysis" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="equation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Chemical Equation</FormLabel>
                      <FormControl>
                        <Input className="bg-black/40 border-white/10 focus-visible:ring-blue-500 font-mono text-blue-400" placeholder="CO2 + 3H2 -> CH3OH + H2O" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetProduct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Target Product</FormLabel>
                      <FormControl>
                        <Input className="bg-black/40 border-white/10 focus-visible:ring-blue-500" placeholder="e.g. Green methanol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Conditions</FormLabel>
                        <FormControl>
                          <Input className="bg-black/40 border-white/10 focus-visible:ring-blue-500" placeholder="e.g. 80°C, basic aqueous" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Description</FormLabel>
                      <FormControl>
                        <Textarea className="bg-black/40 border-white/10 focus-visible:ring-blue-500 resize-none min-h-[100px]" placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-6 border-t border-white/10">
                  <Button type="submit" disabled={createReaction.isPending} className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6">
                    {createReaction.isPending ? "Initializing..." : "Initialize Reaction"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-64 w-full bg-white/5 rounded-[2.5rem]" />)}
        </div>
      ) : !reactions || reactions.length === 0 ? (
        <div className="p-1.5 rounded-[2.5rem] bg-white/[0.04] border border-white/10">
          <div className="rounded-[calc(2.5rem-0.375rem)] bg-[#080310]/90 backdrop-blur-2xl p-16 text-center border border-white/5">
            <Beaker className="w-16 h-16 mx-auto text-blue-500/50 mb-6" />
            <h3 className="text-2xl font-serif font-bold text-white mb-2">No Reactions Found</h3>
            <p className="text-white/50 max-w-sm mx-auto">
              The library is empty. Initialize a new reaction to begin generating AI candidates.
            </p>
          </div>
        </div>
      ) : (
        <motion.div variants={staggerContainer as any} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reactions.map((reaction, i) => (
            <motion.div key={reaction.id} variants={staggerChild as any} className="h-full">
              <Link href={`/reactions/${reaction.id}`}>
                <GlassCard className="h-full flex flex-col group cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500">
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-serif font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">{reaction.name}</h3>
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 ml-4 group-hover:bg-blue-500/20 transition-colors">
                        {reaction.domain === "chemical-catalysis" ? (
                          <Beaker className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Dna className="w-5 h-5 text-fuchsia-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-black/50 text-white/70 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
                        {reaction.type}
                      </span>
                      <span className="px-3 py-1 bg-black/50 text-white/70 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
                        {reaction.domain === "chemical-catalysis" ? "Chem" : "Bio"}
                      </span>
                    </div>

                    <div className="space-y-4 mt-auto">
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">Equation</div>
                        <div className="font-mono text-sm text-blue-400 truncate font-bold">
                          {reaction.equation}
                        </div>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-bold">Target</div>
                        <div className="text-sm text-white/90 font-medium">{reaction.targetProduct}</div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <div className="flex items-center text-xs text-blue-400 font-bold uppercase tracking-widest group-hover:text-blue-300 transition-colors">
                        View Details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
