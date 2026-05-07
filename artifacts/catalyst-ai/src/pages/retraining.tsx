import { useState } from "react";
import {
  useListRetrainingRuns,
  useTriggerRetrainingRun,
  getListRetrainingRunsQueryKey,
} from "@workspace/api-client-react";
import type { RetrainingRun } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings2, Plus, TrendingUp, Database, CheckCircle2, Clock } from "lucide-react";
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

const triggerSchema = z.object({
  triggeredBy: z.string().min(1, "Name is required"),
});

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(222 47% 8%)",
  border: "1px solid hsl(215 30% 18%)",
  borderRadius: 4,
  color: "hsl(210 40% 98%)",
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Model Retraining</h1>
          <p className="text-muted-foreground mt-2">Closed-loop learning from experimental feedback with provenance and human review.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="btn-trigger-retraining">
              <Plus className="w-4 h-4" />
              Trigger Retraining
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-primary">Trigger Model Retraining</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This sandbox run recalibrates scores from logged experimental data and records a human-reviewable audit trail.
                </p>
                <FormField
                  control={form.control}
                  name="triggeredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Triggered By</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Arjun Patel" {...field} data-testid="input-triggered-by" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit" disabled={triggerRun.isPending} className="gap-2" data-testid="btn-submit-retraining">
                    <Settings2 className="w-4 h-4" />
                    {triggerRun.isPending ? "Retraining..." : "Start Retraining"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {latestRun && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current Accuracy</div>
              <div className="text-3xl font-mono font-bold text-accent">
                {((latestRun.accuracyAfter ?? 0) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Latest run</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Improvement</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <div className="text-3xl font-mono font-bold text-accent">
                  +{(((latestRun.accuracyAfter ?? 0) - (latestRun.accuracyBefore ?? 0)) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">vs. pre-training</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Data Points Used</div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                <div className="text-3xl font-mono font-bold text-primary">
                  {latestRun.dataPointsUsed}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">experimental results</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accuracy Trend Chart */}
      {chartData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Accuracy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 30% 18%)" />
                <XAxis dataKey="run" tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | string) => `${v}%`} />
                <ReferenceLine y={90} stroke="hsl(150 100% 45% / 0.3)" strokeDasharray="4 2" label={{ value: "90% target", fill: "hsl(150 100% 45%)", fontSize: 10 }} />
                <Line type="monotone" dataKey="Before" stroke="hsl(215 20% 50%)" strokeWidth={2} dot={{ fill: "hsl(215 20% 50%)" }} name="Before" />
                <Line type="monotone" dataKey="After" stroke="hsl(180 100% 40%)" strokeWidth={2} dot={{ fill: "hsl(180 100% 40%)" }} name="After" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Retraining History */}
      <div>
        <h2 className="text-lg font-bold mb-4">Retraining History</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full bg-card" />)}
          </div>
        ) : !runs || runs.length === 0 ? (
          <Card className="bg-card border-dashed border-border p-12 text-center">
            <Settings2 className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-medium">No Retraining Runs Yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Trigger a retraining run to improve AI prediction accuracy using experimental data.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {runs.map((run: RetrainingRun, i: number) => (
              <Card
                key={run.id}
                className="bg-card border-border"
                data-testid={`card-run-${run.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium">Run #{runs.length - i}</span>
                          <Badge variant="outline" className="text-xs font-mono border-accent/30 text-accent">
                            {run.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Triggered by {run.triggeredBy} · {new Date(run.createdAt).toLocaleString()}
                        </div>
                        {run.notes && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{run.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                      <div className="font-mono text-sm">
                        <span className="text-muted-foreground">{((run.accuracyBefore ?? 0) * 100).toFixed(1)}%</span>
                        <span className="text-muted-foreground mx-2">→</span>
                        <span className="text-accent font-bold">{((run.accuracyAfter ?? 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {run.dataPointsUsed} data points
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
