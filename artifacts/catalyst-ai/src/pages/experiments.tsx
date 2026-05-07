import { Link } from "wouter";
import { useListExperiments, getListExperimentsQueryKey } from "@workspace/api-client-react";
import type { ExperimentWithCandidate } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Plus, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

function DeltaBadge({ predicted, measured }: { predicted: number; measured: number }) {
  const delta = measured - predicted;
  const pct = (delta * 100).toFixed(1);
  if (Math.abs(delta) < 0.03) {
    return (
      <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
        <Minus className="w-3 h-3" /> {pct}%
      </span>
    );
  }
  if (delta > 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-mono text-accent">
        <TrendingUp className="w-3 h-3" /> +{pct}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-mono text-destructive">
      <TrendingDown className="w-3 h-3" /> {pct}%
    </span>
  );
}

export default function Experiments() {
  const { data: experiments, isLoading } = useListExperiments({
    query: { queryKey: getListExperimentsQueryKey() },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Experiments Log</h1>
          <p className="text-muted-foreground mt-2">Experimental validation results with predicted vs. measured comparison.</p>
        </div>
        <Link href="/experiments/new">
          <Button className="gap-2" data-testid="btn-new-experiment">
            <Plus className="w-4 h-4" />
            Log Experiment
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full bg-card" />)}
        </div>
      ) : !experiments || experiments.length === 0 ? (
        <Card className="bg-card border-dashed border-border p-12 text-center">
          <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium">No Experiments Logged</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Log your first experimental result to begin validating AI predictions.
          </p>
          <Link href="/experiments/new">
            <Button className="mt-6 gap-2">
              <Plus className="w-4 h-4" /> Log First Experiment
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {experiments.map((exp: ExperimentWithCandidate) => (
            <Link key={exp.id} href={`/experiments/${exp.id}`}>
              <Card
                className="bg-card border-border hover:border-primary transition-all cursor-pointer group hover:-translate-y-0.5 duration-300"
                data-testid={`card-experiment-${exp.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-foreground truncate">{exp.candidateName}</span>
                          <Badge variant="outline" className="text-xs font-mono flex-shrink-0">{exp.reactionName}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          by {exp.researcherName} · {new Date(exp.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="hidden md:grid grid-cols-3 gap-6 flex-shrink-0">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-0.5">Activity</div>
                          <div className="font-mono text-sm font-bold text-foreground">
                            {(exp.measuredActivity * 100).toFixed(1)}%
                          </div>
                          <DeltaBadge predicted={exp.predictedActivity} measured={exp.measuredActivity} />
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-0.5">Selectivity</div>
                          <div className="font-mono text-sm font-bold text-foreground">
                            {(exp.measuredSelectivity * 100).toFixed(1)}%
                          </div>
                          <DeltaBadge predicted={exp.predictedSelectivity} measured={exp.measuredSelectivity} />
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-0.5">Yield</div>
                          <div className="font-mono text-sm font-bold text-primary">
                            {(exp.measuredYield * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
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
