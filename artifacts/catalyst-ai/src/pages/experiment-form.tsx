import { useLocation } from "wouter";
import { Link } from "wouter";
import {
  useCreateExperiment,
  useListCandidatesForReaction,
  useListReactions,
  getListExperimentsQueryKey,
} from "@workspace/api-client-react";
import type { Reaction, Candidate, Experiment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { useState } from "react";

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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/experiments">
          <Button variant="ghost" size="icon" data-testid="btn-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Log Experiment</h1>
          <p className="text-muted-foreground mt-1">Record experimental validation results for a candidate.</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FlaskConical className="w-5 h-5 text-primary" />
            Experimental Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reaction</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          setSelectedReactionId(Number(val));
                          form.setValue("candidateId", "");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-reaction">
                            <SelectValue placeholder="Select reaction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reactions?.map((r: Reaction) => (
                            <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
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
                      <FormLabel>Candidate</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedReactionId || !candidates?.length}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-candidate">
                            <SelectValue placeholder={selectedReactionId ? "Select candidate" : "Select reaction first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {candidates?.map((c: Candidate) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="researcherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Researcher Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Priya Sharma" {...field} data-testid="input-researcher" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="measuredActivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity (0–1)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          placeholder="0.85"
                          className="font-mono"
                          {...field}
                          data-testid="input-activity"
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
                      <FormLabel>Selectivity (0–1)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          placeholder="0.78"
                          className="font-mono"
                          {...field}
                          data-testid="input-selectivity"
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
                      <FormLabel>Yield (0–1)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          placeholder="0.72"
                          className="font-mono"
                          {...field}
                          data-testid="input-yield"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observations, conditions, anomalies..."
                        className="min-h-[100px] resize-none"
                        {...field}
                        data-testid="textarea-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" disabled={createExperiment.isPending} className="gap-2" data-testid="btn-submit-experiment">
                  <FlaskConical className="w-4 h-4" />
                  {createExperiment.isPending ? "Logging..." : "Log Results"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4 text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Lab integration strategy:</span> for the hackathon sandbox,
          researchers log results manually from deterministic synthetic data. In a GPS Renewables pilot, this same schema
          can ingest CSV exports from bench sheets or LIMS systems with candidate ID, yield, selectivity, activity,
          deactivation rate, researcher attribution, and notes.
        </CardContent>
      </Card>
    </div>
  );
}
