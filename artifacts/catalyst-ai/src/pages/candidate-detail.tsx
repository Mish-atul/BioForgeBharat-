import { useParams, Link } from "wouter";
import { useGetCandidate, getGetCandidateQueryKey } from "@workspace/api-client-react";
import type { Experiment } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Atom,
  FlaskConical,
  Clock,
  Database,
  ExternalLink,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface StructureNode {
  id: string;
  x: number;
  y: number;
  r?: number;
  color?: string;
}
interface StructureEdge {
  from: string;
  to: string;
}
interface StructureData {
  nodes: StructureNode[];
  edges: StructureEdge[];
}

function MoleculeViz({ structureData }: { structureData: string }) {
  let data: StructureData | null = null;
  try {
    data = JSON.parse(structureData) as StructureData;
  } catch {
    return <div className="text-xs text-muted-foreground italic">Structure data unavailable</div>;
  }
  if (!data || !data.nodes) return null;

  const nodeMap = Object.fromEntries(data.nodes.map((n) => [n.id, n]));
  const w = 200;
  const h = 160;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40 rounded bg-background/50 border border-border">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {data.edges?.map((edge, i) => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return null;
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="hsl(180 100% 40% / 0.5)"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
        );
      })}
      {data.nodes.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r ?? 18}
            fill={`${node.color ?? "#00cccc"}22`}
            stroke={node.color ?? "#00cccc"}
            strokeWidth={1.5}
            filter="url(#glow)"
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#e2e8f0"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {node.id}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface MolecularPropertiesCandidate {
  pubchemCid?: number | null;
  chemblId?: string | null;
  molecularWeight?: number | null;
  logP?: number | null;
  tpsa?: number | null;
  canonicalSmiles?: string | null;
  iupacName?: string | null;
  sourceDb?: string | null;
}

function MolecularPropertiesCard({ candidate }: { candidate: MolecularPropertiesCandidate }) {
  const hasAnyProp =
    candidate.molecularWeight != null ||
    candidate.logP != null ||
    candidate.tpsa != null ||
    candidate.canonicalSmiles != null ||
    candidate.iupacName != null ||
    candidate.pubchemCid != null ||
    candidate.chemblId != null;

  return (
    <Card className="bg-card border-border" data-testid="card-molecular-properties">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Database className="w-3.5 h-3.5" />
          Molecular Properties
          {candidate.sourceDb && (
            <Badge
              variant="outline"
              className="ml-auto text-[10px] font-mono border-chart-3/50 text-chart-3"
              data-testid="badge-source-db"
            >
              {candidate.sourceDb}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {!hasAnyProp ? (
          <div className="text-muted-foreground italic py-2">
            No matching record in PubChem or ChEMBL for this structure.
          </div>
        ) : (
          <>
            {candidate.iupacName && (
              <div>
                <div className="text-muted-foreground uppercase tracking-wider text-[10px] mb-0.5">
                  IUPAC Name
                </div>
                <div className="font-mono text-[11px] leading-snug break-words" data-testid="text-iupac-name">
                  {candidate.iupacName}
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <PropCell label="MW (g/mol)" value={candidate.molecularWeight?.toFixed(2)} testid="prop-mw" />
              <PropCell label="logP" value={candidate.logP?.toFixed(2)} testid="prop-logp" />
              <PropCell label="TPSA (Å²)" value={candidate.tpsa?.toFixed(1)} testid="prop-tpsa" />
            </div>
            {candidate.canonicalSmiles && (
              <div>
                <div className="text-muted-foreground uppercase tracking-wider text-[10px] mb-0.5">
                  Canonical SMILES
                </div>
                <div
                  className="font-mono text-[10px] leading-snug break-all bg-background/60 border border-border rounded p-2"
                  data-testid="text-smiles"
                >
                  {candidate.canonicalSmiles}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {candidate.pubchemCid != null && (
                <a
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${candidate.pubchemCid}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-primary hover:underline"
                  data-testid="link-pubchem"
                >
                  PubChem CID {candidate.pubchemCid}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {candidate.chemblId && (
                <a
                  href={`https://www.ebi.ac.uk/chembl/compound_report_card/${candidate.chemblId}/`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-accent hover:underline"
                  data-testid="link-chembl"
                >
                  {candidate.chemblId}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PropCell({
  label,
  value,
  testid,
}: {
  label: string;
  value: string | undefined;
  testid: string;
}) {
  return (
    <div
      className="rounded border border-border bg-background/40 p-2"
      data-testid={testid}
    >
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-bold text-foreground/90 mt-0.5">
        {value ?? "—"}
      </div>
    </div>
  );
}

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(222 47% 8%)",
  border: "1px solid hsl(215 30% 18%)",
  borderRadius: 4,
  color: "hsl(210 40% 98%)",
};

function parseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function ExtendedScoreGrid({ candidate }: { candidate: {
  feedstockFitScore?: number | null;
  costScore?: number | null;
  sustainabilityScore?: number | null;
  scalabilityScore?: number | null;
  uncertaintyScore?: number | null;
} }) {
  const items = [
    ["Feedstock Fit", candidate.feedstockFitScore, "text-primary"],
    ["Cost Fit", candidate.costScore, "text-chart-3"],
    ["Sustainability", candidate.sustainabilityScore, "text-accent"],
    ["Scalability", candidate.scalabilityScore, "text-chart-4"],
    ["Uncertainty", candidate.uncertaintyScore, "text-destructive"],
  ] as const;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Feasibility Scores</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {items.map(([label, value, color]) => (
          <div key={label} className="rounded border border-border bg-background/50 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className={`font-mono text-lg font-bold mt-1 ${color}`}>
              {typeof value === "number" ? `${(value * 100).toFixed(0)}%` : "—"}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SimulationPanel({ candidate }: { candidate: {
  energyProfileData?: string | null;
  pathwayData?: string | null;
  evidenceText?: string | null;
} }) {
  const energy = parseJson<{ steps?: Array<{ label: string; energy: number }> }>(candidate.energyProfileData);
  const pathway = parseJson<{ nodes?: Array<{ id: string; label: string; flux: number }>; edits?: string[]; bottlenecks?: string[] }>(candidate.pathwayData);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
          Simulation Evidence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {candidate.evidenceText && (
          <p className="text-sm leading-relaxed text-foreground/90">{candidate.evidenceText}</p>
        )}
        {energy?.steps && (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={energy.steps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 30% 18%)" />
              <XAxis dataKey="label" tick={{ fill: "hsl(215 20% 65%)", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="energy" stroke="hsl(180 100% 40%)" strokeWidth={2} dot={{ r: 4 }} name="Energy proxy" />
            </LineChart>
          </ResponsiveContainer>
        )}
        {pathway?.nodes && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {pathway.nodes.map((node) => (
                <div key={node.id} className="rounded border border-border bg-background p-3">
                  <div className="text-sm font-semibold">{node.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">Flux proxy</div>
                  <div className="font-mono text-lg text-accent">{node.flux}%</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="rounded border border-border bg-background p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Gene / Enzyme Edits</div>
                {(pathway.edits ?? []).map((edit) => <div key={edit}>• {edit}</div>)}
              </div>
              <div className="rounded border border-border bg-background p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Bottlenecks</div>
                {(pathway.bottlenecks ?? []).map((bottleneck) => <div key={bottleneck}>• {bottleneck}</div>)}
              </div>
            </div>
          </div>
        )}
        {!candidate.evidenceText && !energy?.steps && !pathway?.nodes && (
          <div className="text-sm text-muted-foreground">No simulation evidence attached to this candidate.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const candidateId = Number(id);

  const { data, isLoading } = useGetCandidate(candidateId, {
    query: { queryKey: getGetCandidateQueryKey(candidateId) },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-card" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 bg-card" />
          <Skeleton className="h-64 bg-card lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { candidate, experiments } = data;

  const radarData = [
    { metric: "Activity", predicted: candidate.predictedActivity * 100, measured: null },
    { metric: "Selectivity", predicted: candidate.predictedSelectivity * 100, measured: null },
    { metric: "Stability", predicted: candidate.predictedStability * 100, measured: null },
    { metric: "Confidence", predicted: candidate.confidenceScore * 100, measured: null },
  ];

  const comparisonData = experiments.length > 0
    ? [
        {
          name: "Activity",
          Predicted: parseFloat((candidate.predictedActivity * 100).toFixed(1)),
          Measured: parseFloat((experiments[0].measuredActivity * 100).toFixed(1)),
        },
        {
          name: "Selectivity",
          Predicted: parseFloat((candidate.predictedSelectivity * 100).toFixed(1)),
          Measured: parseFloat((experiments[0].measuredSelectivity * 100).toFixed(1)),
        },
      ]
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href={`/reactions/${candidate.reactionId}`}>
          <Button variant="ghost" size="icon" className="mt-1" data-testid="btn-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Atom className="w-5 h-5 text-primary" />
            <Badge
              variant="outline"
              className={`text-xs font-mono ${candidate.source === "generated" ? "border-primary/50 text-primary" : "border-accent/50 text-accent"}`}
            >
              {candidate.source}
            </Badge>
            {candidate.rank && (
              <Badge variant="outline" className="text-xs font-mono border-chart-4/50 text-chart-4">
                Rank #{candidate.rank}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{candidate.name}</h1>
          <div className="font-mono text-sm text-muted-foreground mt-1">{candidate.formula}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Molecular Structure */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Molecular Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <MoleculeViz structureData={candidate.structureData} />
            </CardContent>
          </Card>

          {/* Predicted Metrics */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Predicted Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Activity", value: candidate.predictedActivity, color: "bg-primary" },
                { label: "Selectivity", value: candidate.predictedSelectivity, color: "bg-accent" },
                { label: "Stability", value: candidate.predictedStability, color: "bg-chart-3" },
                { label: "Confidence", value: candidate.confidenceScore, color: "bg-chart-4" },
              ].map(({ label, value, color }) => (
                <div key={label} className="space-y-1">
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
              ))}
            </CardContent>
          </Card>

          {/* Cheminformatics: real molecular properties from PubChem/ChEMBL */}
          <MolecularPropertiesCard candidate={candidate} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mechanism */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Proposed Mechanism</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90">{candidate.mechanismText}</p>
            </CardContent>
          </Card>

          <ExtendedScoreGrid candidate={candidate} />

          <SimulationPanel candidate={candidate} />

          {/* Radar Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Performance Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(215 30% 18%)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} />
                  <Radar
                    name="Predicted"
                    dataKey="predicted"
                    stroke="hsl(180 100% 40%)"
                    fill="hsl(180 100% 40%)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Experiments */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                Experimental Validation
                <span className="ml-2 font-mono text-xs">({experiments.length})</span>
              </CardTitle>
              <Link href="/experiments/new">
                <Button size="sm" variant="outline" className="text-xs h-7" data-testid="btn-log-experiment">
                  <FlaskConical className="w-3 h-3 mr-1" />
                  Log Experiment
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {experiments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No experiments logged yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comparisonData.length > 0 && (
                    <div className="mb-4">
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 30% 18%)" />
                          <XAxis dataKey="name" tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
                          <Legend />
                          <Bar dataKey="Predicted" fill="hsl(180 100% 40%)" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
                          <Bar dataKey="Measured" fill="hsl(150 100% 45%)" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {experiments.map((exp: Experiment) => (
                    <Link key={exp.id} href={`/experiments/${exp.id}`}>
                      <div className="flex items-center justify-between p-3 rounded border border-border hover:border-primary transition-colors cursor-pointer bg-background">
                        <div>
                          <div className="text-xs text-muted-foreground font-mono">{exp.researcherName}</div>
                          <div className="text-sm mt-0.5">
                            Activity: <span className="font-mono text-accent">{(exp.measuredActivity * 100).toFixed(1)}%</span>
                            {" · "}
                            Yield: <span className="font-mono text-primary">{(exp.measuredYield * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(exp.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
