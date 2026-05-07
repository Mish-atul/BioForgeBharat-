import { Router } from "express";
import { db } from "@workspace/db";
import {
  reactionsTable,
  candidatesTable,
  experimentsTable,
  annotationsTable,
  retrainingRunsTable,
} from "@workspace/db";
import { count, eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const [rxnCount] = await db.select({ count: count() }).from(reactionsTable);
    const [candCount] = await db.select({ count: count() }).from(candidatesTable);
    const [expCount] = await db.select({ count: count() }).from(experimentsTable);
    const [genCount] = await db
      .select({ count: count() })
      .from(candidatesTable)
      .where(eq(candidatesTable.source, "generated"));

    const experiments = await db
      .select({
        measuredActivity: experimentsTable.measuredActivity,
        predictedActivity: candidatesTable.predictedActivity,
      })
      .from(experimentsTable)
      .leftJoin(candidatesTable, eq(experimentsTable.candidateId, candidatesTable.id));

    let avgAccuracy = 0;
    if (experiments.length > 0) {
      const accuracySum = experiments.reduce((sum, e) => {
        const diff = Math.abs(e.measuredActivity - (e.predictedActivity ?? 0));
        return sum + (1 - diff);
      }, 0);
      avgAccuracy = accuracySum / experiments.length;
    }

    const recentAnnotations = await db
      .select({
        id: annotationsTable.id,
        author: annotationsTable.author,
        content: annotationsTable.content,
        createdAt: annotationsTable.createdAt,
      })
      .from(annotationsTable)
      .orderBy(desc(annotationsTable.createdAt))
      .limit(5);

    const recentExperiments = await db
      .select({
        id: experimentsTable.id,
        researcherName: experimentsTable.researcherName,
        measuredActivity: experimentsTable.measuredActivity,
        createdAt: experimentsTable.createdAt,
        candidateName: candidatesTable.name,
      })
      .from(experimentsTable)
      .leftJoin(candidatesTable, eq(experimentsTable.candidateId, candidatesTable.id))
      .orderBy(desc(experimentsTable.createdAt))
      .limit(5);

    const activityItems = [
      ...recentAnnotations.map((a) => ({
        id: a.id,
        type: "annotation",
        description: `${a.author} added annotation: "${a.content.slice(0, 60)}..."`,
        author: a.author,
        createdAt: a.createdAt.toISOString(),
      })),
      ...recentExperiments.map((e) => ({
        id: e.id + 10000,
        type: "experiment",
        description: `${e.researcherName} logged results for ${e.candidateName ?? "candidate"}: ${(e.measuredActivity * 100).toFixed(1)}% activity`,
        author: e.researcherName,
        createdAt: e.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

    const topCandidates = await db
      .select()
      .from(candidatesTable)
      .orderBy(desc(candidatesTable.predictedActivity))
      .limit(5);

    res.json({
      totalReactions: rxnCount?.count ?? 0,
      totalCandidates: candCount?.count ?? 0,
      totalExperiments: expCount?.count ?? 0,
      generatedCandidates: genCount?.count ?? 0,
      avgPredictionAccuracy: parseFloat(avgAccuracy.toFixed(4)),
      recentActivity: activityItems,
      topCandidates: topCandidates.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Failed to get dashboard stats" });
  }
});

export default router;
