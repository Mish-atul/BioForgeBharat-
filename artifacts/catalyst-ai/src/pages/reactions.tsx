import React, { useState } from "react";
import { Link } from "wouter";
import { useListReactions, useCreateReaction, getListReactionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Reactions Library</h1>
          <p className="text-muted-foreground mt-2">Manage sustainable fuel routes across catalysis and synthetic biology.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Reaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-primary">Initialize New Reaction</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reaction Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CO2 Hydrogenation to Methanol" {...field} />
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
                        <FormLabel>Domain</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select domain" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                        <FormLabel>Reaction Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Heterogeneous catalysis" {...field} />
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
                      <FormLabel>Chemical Equation</FormLabel>
                      <FormControl>
                        <Input placeholder="CO2 + 3H2 -> CH3OH + H2O" className="font-mono" {...field} />
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
                      <FormLabel>Target Product</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Green methanol" {...field} />
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
                        <FormLabel>Conditions</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 80°C, basic aqueous" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit" disabled={createReaction.isPending}>
                    {createReaction.isPending ? "Initializing..." : "Initialize Reaction"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full bg-card" />
          <Skeleton className="h-24 w-full bg-card" />
          <Skeleton className="h-24 w-full bg-card" />
        </div>
      ) : !reactions || reactions.length === 0 ? (
        <Card className="bg-card border-dashed border-border p-12 text-center">
          <Beaker className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium">No Reactions Found</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            The library is empty. Initialize a new reaction to begin generating AI candidates.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reactions.map((reaction, i) => (
            <Link key={reaction.id} href={`/reactions/${reaction.id}`}>
              <Card className="bg-card border-border hover:border-primary transition-all cursor-pointer group h-full flex flex-col hover:-translate-y-1 duration-300 shadow-md">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-primary group-hover:text-accent transition-colors">{reaction.name}</CardTitle>
                    {reaction.domain === "chemical-catalysis" ? (
                      <Beaker className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Dna className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-secondary rounded-full border border-border">
                      {reaction.type}
                    </span>
                    <span className="px-2 py-0.5 bg-secondary rounded-full border border-border">
                      {reaction.domain === "chemical-catalysis" ? "Chem" : "Bio"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Equation</div>
                      <div className="font-mono text-sm bg-background border border-border p-2 rounded truncate">
                        {reaction.equation}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Target</div>
                      <div className="text-sm">{reaction.targetProduct}</div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <div className="flex items-center text-xs text-muted-foreground group-hover:text-primary transition-colors font-medium tracking-wide">
                      VIEW DETAILS <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
