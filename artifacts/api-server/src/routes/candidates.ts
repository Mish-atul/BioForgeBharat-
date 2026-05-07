import { Router } from "express";
import { db } from "@workspace/db";
import { candidatesTable, experimentsTable, annotationsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { UpdateCandidateBody } from "@workspace/api-zod";

const router = Router();

router.get("/candidates/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [candidate] = await db
      .select()
      .from(candidatesTable)
      .where(eq(candidatesTable.id, id));

    if (!candidate) {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }

    const experiments = await db
      .select()
      .from(experimentsTable)
      .where(eq(experimentsTable.candidateId, id))
      .orderBy(experimentsTable.createdAt);

    res.json({ candidate, experiments });
  } catch (err) {
    req.log.error({ err }, "Failed to get candidate");
    res.status(500).json({ error: "Failed to get candidate" });
  }
});

router.put("/candidates/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = UpdateCandidateBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const [existing] = await db
      .select()
      .from(candidatesTable)
      .where(eq(candidatesTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }

    const updates: Partial<typeof parsed.data> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.mechanismText !== undefined) updates.mechanismText = parsed.data.mechanismText;
    if (parsed.data.predictedActivity !== undefined) updates.predictedActivity = parsed.data.predictedActivity;
    if (parsed.data.predictedSelectivity !== undefined) updates.predictedSelectivity = parsed.data.predictedSelectivity;
    if (parsed.data.predictedStability !== undefined) updates.predictedStability = parsed.data.predictedStability;
    if (parsed.data.confidenceScore !== undefined) updates.confidenceScore = parsed.data.confidenceScore;
    if (parsed.data.rank !== undefined) updates.rank = parsed.data.rank;

    const [updated] = await db
      .update(candidatesTable)
      .set(updates)
      .where(eq(candidatesTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update candidate");
    res.status(500).json({ error: "Failed to update candidate" });
  }
});

router.delete("/candidates/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db
      .select()
      .from(candidatesTable)
      .where(eq(candidatesTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }

    // Cascade: delete annotations tied to this candidate's experiments first
    const experiments = await db
      .select({ id: experimentsTable.id })
      .from(experimentsTable)
      .where(eq(experimentsTable.candidateId, id));

    if (experiments.length > 0) {
      const experimentIds = experiments.map((e) => e.id);
      await db.delete(annotationsTable).where(inArray(annotationsTable.experimentId, experimentIds));
      await db.delete(experimentsTable).where(inArray(experimentsTable.id, experimentIds));
    }

    await db.delete(candidatesTable).where(eq(candidatesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete candidate");
    res.status(500).json({ error: "Failed to delete candidate" });
  }
});

export default router;
