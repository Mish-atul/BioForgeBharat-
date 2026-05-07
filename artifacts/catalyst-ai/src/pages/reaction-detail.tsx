import { useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetReaction,
  useListCandidatesForReaction,
  useGenerateCandidates,
  useDeleteReaction,
  useSearchCandidates,
  getGetReactionQueryKey,
  getListCandidatesForReactionQueryKey,
} from "@workspace/api-client-react";
import type {
  Candidate,
  ListCandidatesForReactionParams,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Beaker,
  Dna,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Download,
  Search,
  Database,
  LayoutGrid,
  Rows3,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Trophy,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";
import { useLocation } from "wouter";

type SortBy =
  | "rank"
  | "predictedActivity"
  | "predictedSelectivity"
  | "predictedStability"
  | "confidenceScore";
type SortDir = "asc" | "desc";
type SourceFilter = "all" | "generated" | "literature";

const METRIC_KEYS = [
  "predictedActivity",
  "predictedSelectivity",
  "predictedStability",
  "confidenceScore",
] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

function MetricBar({ label, value, color = "bg-primary" }: { label: string; value: number; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-bold">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
  return dir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
}

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCandidatesCsv(candidates: Candidate[], reactionId: number) {
  const headers = [
    "rank",
    "name",
    "formula",
    "source",
    "sourceDb",
    "candidateType",
    "routeType",
    "predictedActivity",
    "predictedSelectivity",
    "predictedStability",
    "confidenceScore",
    "feedstockFitScore",
    "costScore",
    "sustainabilityScore",
    "scalabilityScore",
    "uncertaintyScore",
    "molecularWeight",
    "logP",
    "tpsa",
    "evidenceText",
  ];
  const lines = [headers.join(",")];
  for (const c of candidates) {
    lines.push(
      [
        c.rank ?? "",
        c.name,
        c.formula,
        c.source,
        c.sourceDb ?? "",
        c.candidateType ?? "",
        c.routeType ?? "",
        c.predictedActivity,
        c.predictedSelectivity,
        c.predictedStability,
        c.confidenceScore,
        c.feedstockFitScore ?? "",
        c.costScore ?? "",
        c.sustainabilityScore ?? "",
        c.scalabilityScore ?? "",
        c.uncertaintyScore ?? "",
        c.molecularWeight ?? "",
        c.logP ?? "",
        c.tpsa ?? "",
        c.evidenceText ?? "",
      ]
        .map(escapeCsv)
        .join(","),
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reaction-${reactionId}-candidates.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function scoreValue(value: number | null | undefined) {
  return typeof value === "number" ? value : 0;
}

function AgentTrace({ isBio }: { isBio: boolean }) {
  const agents = [
    ["Orchestrator", "Interprets target, domain, feedstock, and route constraints"],
    ["Literature", "Retrieves known catalyst, compound, enzyme, and pathway evidence"],
    ["Design", isBio ? "Proposes strain, enzyme, gene-edit, and pathway variants" : "Proposes catalyst, promoter, support, and active-site variants"],
    ["Simulation", isBio ? "Estimates flux, bottlenecks, and yield proxies" : "Estimates activity, selectivity, stability, and energy profile"],
    ["Critique", "Checks scalability, cost, uncertainty, and human approval needs"],
    ["Feedback", "Uses logged lab results to recalibrate future rankings"],
  ];

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-3">
          <BrainCircuit className="w-3.5 h-3.5 text-primary" />
          Virtual Research Team
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {agents.map(([name, detail]) => (
            <div key={name} className="rounded border border-border bg-background p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                {name} Agent
              </div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{detail}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReactionDetail() {
  const { id } = useParams<{ id: string }>();
  const reactionId = Number(id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSummary, setSearchSummary] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sortBy, setSortBy] = useState<SortBy>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const candidatesParams: ListCandidatesForReactionParams = {
    sortBy,
    sortDir,
    ...(sourceFilter !== "all" ? { source: sourceFilter } : {}),
  };

  const { data: reaction, isLoading: rxnLoading } = useGetReaction(reactionId, {
    query: { queryKey: getGetReactionQueryKey(reactionId) },
  });

  const { data: candidates, isLoading: candLoading } = useListCandidatesForReaction(
    reactionId,
    candidatesParams,
    {
      query: { queryKey: getListCandidatesForReactionQueryKey(reactionId, candidatesParams) },
    },
  );

  const generateCandidates = useGenerateCandidates();
  const deleteReaction = useDeleteReaction();
  const searchCandidates = useSearchCandidates();

  const bestPerMetric = useMemo(() => {
    const best: Record<MetricKey, number> = {
      predictedActivity: -Infinity,
      predictedSelectivity: -Infinity,
      predictedStability: -Infinity,
      confidenceScore: -Infinity,
    };
    if (!candidates) return best;
    for (const c of candidates) {
      // Imported literature entries have all-zero predicted metrics; skip them
      // so the "best" highlight reflects real predictions instead of being
      // shared across every imported reference compound. Seeded "known"
      // catalysts have real metrics and are eligible to be best-in-class.
      if (c.source === "literature") continue;
      for (const k of METRIC_KEYS) {
        const v = c[k];
        if (typeof v === "number" && v > best[k]) best[k] = v;
      }
    }
    return best;
  }, [candidates]);

  const handleGenerate = () => {
    setGenerating(true);
    generateCandidates.mutate(
      { id: reactionId, data: { count: 5 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCandidatesForReactionQueryKey(reactionId) });
          setGenerating(false);
        },
        onError: () => setGenerating(false),
      }
    );
  };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchSummary(null);
    searchCandidates.mutate(
      { id: reactionId, params: { query: q } },
      {
        onSuccess: (result) => {
          queryClient.invalidateQueries({
            queryKey: getListCandidatesForReactionQueryKey(reactionId),
          });
          const sources = result.sourcesQueried.join(" + ");
          setSearchSummary(
            result.candidates.length === 0
              ? `No matches in ${sources} for "${result.query}".`
              : `Imported ${result.candidates.length} reference compound${result.candidates.length === 1 ? "" : "s"} from ${sources}.`,
          );
          setSearchQuery("");
        },
        onError: () => {
          setSearchSummary("Search failed. Please try again.");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!confirm("Delete this reaction and all its candidates?")) return;
    deleteReaction.mutate(
      { id: reactionId },
      { onSuccess: () => setLocation("/reactions") }
    );
  };

  const toggleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      // Numeric metrics: default to descending (best first). Rank: ascending.
      setSortDir(column === "rank" ? "asc" : "desc");
    }
  };

  if (rxnLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-card" />
        <Skeleton className="h-32 w-full bg-card" />
        <Skeleton className="h-64 w-full bg-card" />
      </div>
    );
  }

  if (!reaction) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Beaker className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Reaction not found.</p>
        <Link href="/reactions">
          <Button variant="ghost" className="mt-4">Back to Reactions</Button>
        </Link>
      </div>
    );
  }

  const isDomainBio = reaction.domain === "synthetic-biology";

  const sortableMetricColumns: { key: SortBy; label: string }[] = [
    { key: "predictedActivity", label: "Activity" },
    { key: "predictedSelectivity", label: "Selectivity" },
    { key: "predictedStability", label: "Stability" },
    { key: "confidenceScore", label: "Confidence" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/reactions">
            <Button variant="ghost" size="icon" className="mt-1" data-testid="btn-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              {isDomainBio ? <Dna className="w-5 h-5 text-accent" /> : <Beaker className="w-5 h-5 text-primary" />}
              <Badge variant="outline" className="text-xs font-mono">
                {isDomainBio ? "Synthetic Biology" : "Chemical Catalysis"}
              </Badge>
              <Badge variant="outline" className="text-xs font-mono">{reaction.type}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">{reaction.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border text-muted-foreground hover:text-foreground"
            onClick={() => {
              const url = `${import.meta.env.BASE_URL}api/reactions/${reactionId}/export-candidates-csv`.replace(/\/+/g, "/");
              window.open(url, "_blank");
            }}
            data-testid="btn-export-csv"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive" data-testid="btn-delete-reaction">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Reaction Details */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Equation</div>
              <div className="font-mono text-sm bg-background border border-border p-3 rounded">
                {reaction.equation}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Target Product</div>
              <div className="text-sm font-medium">{reaction.targetProduct}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Conditions</div>
              <div className="font-mono text-sm bg-background border border-border p-3 rounded">
                {reaction.conditions}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{reaction.description}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AgentTrace isBio={isDomainBio} />

      {/* Literature Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            Search Known Literature (PubChem &amp; ChEMBL)
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !searchCandidates.isPending) handleSearch();
              }}
              placeholder="e.g. methanol, aspirin, CHEMBL25, copper"
              className="font-mono text-sm bg-background"
              data-testid="input-literature-search"
            />
            <Button
              onClick={handleSearch}
              disabled={searchCandidates.isPending || searchQuery.trim().length === 0}
              variant="outline"
              className="gap-2"
              data-testid="btn-search-candidates"
            >
              <Search className="w-4 h-4" />
              {searchCandidates.isPending ? "Searching..." : "Search"}
            </Button>
          </div>
          {searchSummary && (
            <div className="text-xs text-muted-foreground" data-testid="text-search-summary">
              {searchSummary}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidates Section */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">
          AI Candidates
          {candidates && (
            <span className="ml-2 text-sm font-mono text-muted-foreground">({candidates.length} found)</span>
          )}
        </h2>
        <Button
          onClick={handleGenerate}
          disabled={generating || generateCandidates.isPending}
          className="gap-2"
          data-testid="btn-generate-candidates"
        >
          <Sparkles className="w-4 h-4" />
          {generating || generateCandidates.isPending ? "Generating..." : "Generate AI Candidates"}
        </Button>
      </div>

      {/* Comparison toolbar */}
      <Card className="bg-card border-border">
        <CardContent className="p-3 flex items-center gap-3 flex-wrap">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as "cards" | "table")}
            className="border border-border rounded-md"
          >
            <ToggleGroupItem value="cards" aria-label="Card view" data-testid="btn-view-cards" className="gap-2 px-3">
              <LayoutGrid className="w-4 h-4" />
              <span className="text-xs">Cards</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view" data-testid="btn-view-table" className="gap-2 px-3">
              <Rows3 className="w-4 h-4" />
              <span className="text-xs">Compare</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Source</span>
            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
              <SelectTrigger className="w-40 h-9" data-testid="select-source-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="generated">AI Generated</SelectItem>
                <SelectItem value="literature">Reference / Literature</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === "cards" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Sort</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger className="w-44 h-9" data-testid="select-sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Rank</SelectItem>
                  <SelectItem value="predictedActivity">Activity</SelectItem>
                  <SelectItem value="predictedSelectivity">Selectivity</SelectItem>
                  <SelectItem value="predictedStability">Stability</SelectItem>
                  <SelectItem value="confidenceScore">Confidence</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                data-testid="btn-toggle-sort-dir"
              >
                {sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span className="text-xs">{sortDir === "asc" ? "Asc" : "Desc"}</span>
              </Button>
            </div>
          )}

          {viewMode === "table" && candidates && candidates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 ml-auto"
              onClick={() => downloadCandidatesCsv(candidates, reactionId)}
              data-testid="btn-export-view-csv"
            >
              <Download className="w-4 h-4" />
              <span className="text-xs">Export current view</span>
            </Button>
          )}
        </CardContent>
      </Card>

      {candLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full bg-card" />
          ))}
        </div>
      ) : !candidates || candidates.length === 0 ? (
        <Card className="bg-card border-dashed border-border p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium">No Candidates Yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            {sourceFilter === "all"
              ? "Generate AI candidates to begin molecular discovery for this reaction."
              : `No ${sourceFilter} candidates match the current filter.`}
          </p>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="space-y-4">
          {candidates.map((candidate, i) => (
            <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
              <Card
                className="bg-card border-border hover:border-primary transition-all cursor-pointer group hover:-translate-y-0.5 duration-300"
                data-testid={`card-candidate-${candidate.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl font-mono font-bold text-muted-foreground/30 w-8 flex-shrink-0 mt-1">
                        {candidate.rank ?? i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-foreground">{candidate.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs font-mono ${candidate.source === "generated" ? "border-primary/50 text-primary" : "border-accent/50 text-accent"}`}
                          >
                            {candidate.source}
                          </Badge>
                        </div>
                        <div className="font-mono text-xs text-muted-foreground mb-3">{candidate.formula}</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <MetricBar label="Activity" value={candidate.predictedActivity} color="bg-primary" />
                          <MetricBar label="Selectivity" value={candidate.predictedSelectivity} color="bg-accent" />
                          <MetricBar label="Stability" value={candidate.predictedStability} color="bg-chart-3" />
                          <MetricBar label="Confidence" value={candidate.confidenceScore} color="bg-chart-4" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                          <MetricBar label="Feedstock Fit" value={scoreValue(candidate.feedstockFitScore)} color="bg-primary" />
                          <MetricBar label="Sustainability" value={scoreValue(candidate.sustainabilityScore)} color="bg-accent" />
                          <MetricBar label="Scalability" value={scoreValue(candidate.scalabilityScore)} color="bg-chart-3" />
                          <MetricBar label="Uncertainty" value={scoreValue(candidate.uncertaintyScore)} color="bg-destructive" />
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border" data-testid="table-candidate-comparison">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-12">
                    <button
                      type="button"
                      onClick={() => toggleSort("rank")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      data-testid="th-sort-rank"
                    >
                      #
                      <SortIcon active={sortBy === "rank"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Formula</TableHead>
                  {sortableMetricColumns.map((col) => (
                    <TableHead key={col.key} className="text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors w-full justify-end"
                        data-testid={`th-sort-${col.key}`}
                      >
                        {col.label}
                        <SortIcon active={sortBy === col.key} dir={sortDir} />
                      </button>
                    </TableHead>
                  ))}
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c, i) => (
                  <TableRow
                    key={c.id}
                    className="border-border"
                    data-testid={`row-candidate-${c.id}`}
                  >
                    <TableCell className="font-mono text-muted-foreground">{c.rank ?? i + 1}</TableCell>
                    <TableCell>
                      <Link href={`/candidates/${c.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs font-mono ${c.source === "generated" ? "border-primary/50 text-primary" : "border-accent/50 text-accent"}`}
                      >
                        {c.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{c.formula}</TableCell>
                    {sortableMetricColumns.map((col) => {
                      const v = c[col.key as MetricKey] as number;
                      const isBestEligible = c.source !== "literature";
                      const isBest =
                        isBestEligible &&
                        bestPerMetric[col.key as MetricKey] > -Infinity &&
                        v === bestPerMetric[col.key as MetricKey];
                      return (
                        <TableCell
                          key={col.key}
                          className={`text-right font-mono ${isBest ? "text-primary font-bold" : ""}`}
                          data-testid={`cell-${col.key}-${c.id}`}
                        >
                          <span className="inline-flex items-center gap-1 justify-end">
                            {isBest && <Trophy className="w-3 h-3" />}
                            {(v * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <Link href={`/candidates/${c.id}`}>
                        <ArrowRight className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
