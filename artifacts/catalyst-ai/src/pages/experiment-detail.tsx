import { useParams, Link } from "wouter";
import {
  useGetExperiment,
  useAnalyzeDiscrepancy,
  getGetExperimentQueryKey,
  getListExperimentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Brain, TrendingUp, TrendingDown, Minus, FlaskConical, User, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(222 47% 8%)",
  border: "1px solid hsl(215 30% 18%)",
  borderRadius: 4,
  color: "hsl(210 40% 98%)",
};

function DeltaIndicator({ predicted, measured, label }: { predicted: number; measured: number; label: string }) {
  const delta = measured - predicted;
  const pct = (Math.abs(delta) * 100).toFixed(1);
  const color = Math.abs(delta) < 0.03 ? "text-muted-foreground" : delta > 0 ? "text-accent" : "text-destructive";
  const Icon = Math.abs(delta) < 0.03 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="flex items-end gap-2">
        <div className="text-2xl font-mono font-bold">{(measured * 100).toFixed(1)}%</div>
        <div className={`flex items-center gap-1 text-xs font-mono pb-0.5 ${color}`}>
          <Icon className="w-3 h-3" />
          {sign}{pct}%
        </div>
      </div>
      <div className="text-xs text-muted-foreground font-mono">
        Predicted: {(predicted * 100).toFixed(1)}%
      </div>
    </div>
  );
}

export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>();
  const experimentId = Number(id);
  const queryClient = useQueryClient();

  const { data: experiment, isLoading } = useGetExperiment(experimentId, {
    query: { queryKey: getGetExperimentQueryKey(experimentId) },
  });

  const analyzeDiscrepancy = useAnalyzeDiscrepancy();

  const handleAnalyze = () => {
    analyzeDiscrepancy.mutate(
      { id: experimentId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetExperimentQueryKey(experimentId) });
          queryClient.invalidateQueries({ queryKey: getListExperimentsQueryKey() });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-card" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 bg-card" />)}
        </div>
        <Skeleton className="h-48 bg-card" />
      </div>
    );
  }

  if (!experiment) return null;

  const chartData = [
    {
      name: "Activity",
      Predicted: parseFloat((experiment.predictedActivity * 100).toFixed(1)),
      Measured: parseFloat((experiment.measuredActivity * 100).toFixed(1)),
    },
    {
      name: "Selectivity",
      Predicted: parseFloat((experiment.predictedSelectivity * 100).toFixed(1)),
      Measured: parseFloat((experiment.measuredSelectivity * 100).toFixed(1)),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/experiments">
          <Button variant="ghost" size="icon" className="mt-1" data-testid="btn-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <FlaskConical className="w-5 h-5 text-primary" />
            <Badge variant="outline" className="text-xs font-mono">{experiment.reactionName}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{experiment.candidateName}</h1>
          <div className="font-mono text-sm text-muted-foreground mt-1">{experiment.candidateFormula}</div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="flex items-center gap-1 justify-end mb-1">
            <User className="w-3 h-3" />
            {experiment.researcherName}
          </div>
          {new Date(experiment.createdAt).toLocaleString()}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <DeltaIndicator
              predicted={experiment.predictedActivity}
              measured={experiment.measuredActivity}
              label="Measured Activity"
            />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <DeltaIndicator
              predicted={experiment.predictedSelectivity}
              measured={experiment.measuredSelectivity}
              label="Measured Selectivity"
            />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Measured Yield</div>
              <div className="text-2xl font-mono font-bold text-primary">
                {(experiment.measuredYield * 100).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Predicted vs. Measured</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 30% 18%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              <Bar dataKey="Predicted" fill="hsl(180 100% 40%)" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Measured" fill="hsl(150 100% 45%)" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Notes */}
      {experiment.notes && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
              <FileText className="w-4 h-4" /> Researcher Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">{experiment.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* AI Discrepancy Analysis */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
            <Brain className="w-4 h-4 text-primary" /> AI Discrepancy Analysis
          </CardTitle>
          <Button
            size="sm"
            onClick={handleAnalyze}
            disabled={analyzeDiscrepancy.isPending}
            variant="outline"
            className="gap-2 h-8"
            data-testid="btn-analyze-discrepancy"
          >
            <Brain className="w-3 h-3" />
            {analyzeDiscrepancy.isPending ? "Analyzing..." : "Analyze with AI"}
          </Button>
        </CardHeader>
        <CardContent>
          {experiment.discrepancyHypothesis ? (
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <p className="text-sm leading-relaxed text-foreground/90">{experiment.discrepancyHypothesis}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Click "Analyze with AI" to generate a scientific hypothesis explaining the prediction-measurement gap.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
