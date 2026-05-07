import { Router } from "express";
import { db } from "@workspace/db";
import { annotationsTable, experimentsTable, candidatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateAnnotationBody } from "@workspace/api-zod";

const router = Router();

router.get("/annotations", async (req, res) => {
  try {
    const results = await db
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
      .orderBy(annotationsTable.createdAt);

    const mapped = results.map((r) => ({
      id: r.id,
      experimentId: r.experimentId,
      author: r.author,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      candidateName: r.candidateName ?? "Unknown",
      experimentSummary: `Activity: ${((r.measuredActivity ?? 0) * 100).toFixed(1)}%, Yield: ${((r.measuredYield ?? 0) * 100).toFixed(1)}%`,
    }));

    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to list annotations");
    res.status(500).json({ error: "Failed to list annotations" });
  }
});

router.post("/annotations", async (req, res) => {
  try {
    const parsed = CreateAnnotationBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const [annotation] = await db.insert(annotationsTable).values(parsed.data).returning();

    const [result] = await db
      .select({
        candidateName: candidatesTable.name,
        measuredActivity: experimentsTable.measuredActivity,
        measuredYield: experimentsTable.measuredYield,
      })
      .from(experimentsTable)
      .leftJoin(candidatesTable, eq(experimentsTable.candidateId, candidatesTable.id))
      .where(eq(experimentsTable.id, annotation.experimentId));

    res.status(201).json({
      id: annotation.id,
      experimentId: annotation.experimentId,
      author: annotation.author,
      content: annotation.content,
      createdAt: annotation.createdAt.toISOString(),
      candidateName: result?.candidateName ?? "Unknown",
      experimentSummary: `Activity: ${(((result?.measuredActivity ?? 0)) * 100).toFixed(1)}%, Yield: ${(((result?.measuredYield ?? 0)) * 100).toFixed(1)}%`,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create annotation");
    res.status(500).json({ error: "Failed to create annotation" });
  }
});

router.delete("/annotations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db
      .select()
      .from(annotationsTable)
      .where(eq(annotationsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Annotation not found" });
      return;
    }
    await db.delete(annotationsTable).where(eq(annotationsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete annotation");
    res.status(500).json({ error: "Failed to delete annotation" });
  }
});

export default router;
