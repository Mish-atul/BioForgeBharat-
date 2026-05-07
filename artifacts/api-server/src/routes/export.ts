import { Router } from "express";
import { db } from "@workspace/db";
import {
  reactionsTable,
  candidatesTable,
  experimentsTable,
  annotationsTable,
  retrainingRunsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/reactions/:id/export-candidates-csv", async (req, res) => {
  try {
    const reactionId = Number(req.params.id);

    const [reaction] = await db
      .select()
      .from(reactionsTable)
      .where(eq(reactionsTable.id, reactionId));

    if (!reaction) {
      res.status(404).json({ error: "Reaction not found" });
      return;
    }

    const candidates = await db
      .select()
      .from(candidatesTable)
      .where(eq(candidatesTable.reactionId, reactionId))
      .orderBy(candidatesTable.rank);

    const header = [
      "ID",
      "Name",
      "Formula",
      "Source",
      "Candidate Type",
      "Route Type",
      "Rank",
      "Predicted Activity (%)",
      "Predicted Selectivity (%)",
      "Predicted Stability (%)",
      "Confidence Score (%)",
      "Feedstock Fit (%)",
      "Cost Fit (%)",
      "Sustainability (%)",
      "Scalability (%)",
      "Uncertainty (%)",
      "Evidence",
      "Mechanism",
      "Created At",
    ].join(",");

    const rows = candidates.map((c) =>
      [
        c.id,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.formula.replace(/"/g, '""')}"`,
        c.source,
        c.candidateType ?? "",
        c.routeType ?? "",
        c.rank ?? "",
        (c.predictedActivity * 100).toFixed(1),
        (c.predictedSelectivity * 100).toFixed(1),
        (c.predictedStability * 100).toFixed(1),
        (c.confidenceScore * 100).toFixed(1),
        c.feedstockFitScore == null ? "" : (c.feedstockFitScore * 100).toFixed(1),
        c.costScore == null ? "" : (c.costScore * 100).toFixed(1),
        c.sustainabilityScore == null ? "" : (c.sustainabilityScore * 100).toFixed(1),
        c.scalabilityScore == null ? "" : (c.scalabilityScore * 100).toFixed(1),
        c.uncertaintyScore == null ? "" : (c.uncertaintyScore * 100).toFixed(1),
        `"${(c.evidenceText ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        `"${c.mechanismText.replace(/"/g, '""').replace(/\n/g, " ")}"`,
        c.createdAt.toISOString(),
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");
    const filename = `${reaction.name.replace(/[^a-zA-Z0-9]/g, "_")}_candidates.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    req.log.error({ err }, "Failed to export candidates CSV");
    res.status(500).json({ error: "Failed to export candidates" });
  }
});

router.get("/export/session", async (req, res) => {
  try {
    const [reactions, candidateRows, annotationRows, retrainingRuns] = await Promise.all([
      db.select().from(reactionsTable).orderBy(reactionsTable.createdAt),
      db.select().from(candidatesTable).orderBy(candidatesTable.reactionId, candidatesTable.rank),
      db
        .select({
          id: annotationsTable.id,
          experimentId: annotationsTable.experimentId,
          author: annotationsTable.author,
          content: annotationsTable.content,
          createdAt: annotationsTable.createdAt,
          candidateName: candidatesTable.name,
          measuredActivity: experimentsTable.measuredActivity,
          measuredYield: experimentsTable.measuredYield,
        })
        .from(annotationsTable)
        .leftJoin(experimentsTable, eq(annotationsTable.experimentId, experimentsTable.id))
        .leftJoin(candidatesTable, eq(experimentsTable.candidateId, candidatesTable.id))
        .orderBy(annotationsTable.createdAt),
      db.select().from(retrainingRunsTable).orderBy(retrainingRunsTable.createdAt),
    ]);

    const experimentRows = await db
      .select({
        id: experimentsTable.id,
        candidateId: experimentsTable.candidateId,
        measuredActivity: experimentsTable.measuredActivity,
        measuredSelectivity: experimentsTable.measuredSelectivity,
        measuredYield: experimentsTable.measuredYield,
        researcherName: experimentsTable.researcherName,
        notes: experimentsTable.notes,
        status: experimentsTable.status,
        discrepancyHypothesis: experimentsTable.discrepancyHypothesis,
        createdAt: experimentsTable.createdAt,
        updatedAt: experimentsTable.updatedAt,
        candidateName: candidatesTable.name,
        candidateFormula: candidatesTable.formula,
        reactionName: reactionsTable.name,
        predictedActivity: candidatesTable.predictedActivity,
        predictedSelectivity: candidatesTable.predictedSelectivity,
      })
      .from(experimentsTable)
      .leftJoin(candidatesTable, eq(experimentsTable.candidateId, candidatesTable.id))
      .leftJoin(reactionsTable, eq(candidatesTable.reactionId, reactionsTable.id))
      .orderBy(experimentsTable.createdAt);

    const annotations = annotationRows.map((r) => ({
      id: r.id,
      experimentId: r.experimentId,
      author: r.author,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      candidateName: r.candidateName ?? "Unknown",
      experimentSummary: `Activity: ${((r.measuredActivity ?? 0) * 100).toFixed(1)}%, Yield: ${((r.measuredYield ?? 0) * 100).toFixed(1)}%`,
    }));

    const experiments = experimentRows.map((r) => ({
      ...r,
      candidateName: r.candidateName ?? "",
      candidateFormula: r.candidateFormula ?? "",
      reactionName: r.reactionName ?? "",
      predictedActivity: r.predictedActivity ?? 0,
      predictedSelectivity: r.predictedSelectivity ?? 0,
    }));

    res.setHeader("Content-Disposition", `attachment; filename="bioforgebharat_session_${new Date().toISOString().split("T")[0]}.json"`);
    res.json({
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      reactions,
      candidates: candidateRows,
      experiments,
      annotations,
      retrainingRuns,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to export session");
    res.status(500).json({ error: "Failed to export session" });
  }
});

export default router;
