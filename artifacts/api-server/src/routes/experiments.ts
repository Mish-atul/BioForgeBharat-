import { Router } from "express";
import { db } from "@workspace/db";
import {
  experimentsTable,
  candidatesTable,
  reactionsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateExperimentBody, UpdateExperimentBody } from "@workspace/api-zod";
import { generateDiscrepancyHypothesis } from "../lib/discovery-ai";

const router = Router();

router.get("/experiments", async (req, res) => {
  try {
    const results = await db
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

    const mapped = results.map((r) => ({
      ...r,
      candidateName: r.candidateName ?? "",
      candidateFormula: r.candidateFormula ?? "",
      reactionName: r.reactionName ?? "",
      predictedActivity: r.predictedActivity ?? 0,
      predictedSelectivity: r.predictedSelectivity ?? 0,
    }));

    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to list experiments");
    res.status(500).json({ error: "Failed to list experiments" });
  }
});

router.post("/experiments", async (req, res) => {
  try {
    const parsed = CreateExperimentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const [experiment] = await db
      .insert(experimentsTable)
      .values({
        candidateId: parsed.data.candidateId,
        measuredActivity: parsed.data.measuredActivity,
        measuredSelectivity: parsed.data.measuredSelectivity,
        measuredYield: parsed.data.measuredYield,
        researcherName: parsed.data.researcherName,
        notes: parsed.data.notes ?? null,
      })
      .returning();

    res.status(201).json(experiment);
  } catch (err) {
    req.log.error({ err }, "Failed to create experiment");
    res.status(500).json({ error: "Failed to create experiment" });
  }
});

router.get("/experiments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [result] = await db
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
      .where(eq(experimentsTable.id, id));

    if (!result) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    res.json({
      ...result,
      candidateName: result.candidateName ?? "",
      candidateFormula: result.candidateFormula ?? "",
      reactionName: result.reactionName ?? "",
      predictedActivity: result.predictedActivity ?? 0,
      predictedSelectivity: result.predictedSelectivity ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get experiment");
    res.status(500).json({ error: "Failed to get experiment" });
  }
});

router.put("/experiments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = UpdateExperimentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const [existing] = await db
      .select()
      .from(experimentsTable)
      .where(eq(experimentsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    const updates: { notes?: string | null; status?: string } = {};
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;

    const [updated] = await db
      .update(experimentsTable)
      .set(updates)
      .where(eq(experimentsTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update experiment");
    res.status(500).json({ error: "Failed to update experiment" });
  }
});

router.delete("/experiments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db
      .select()
      .from(experimentsTable)
      .where(eq(experimentsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }
    await db.delete(experimentsTable).where(eq(experimentsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete experiment");
    res.status(500).json({ error: "Failed to delete experiment" });
  }
});

router.post("/experiments/:id/analyze-discrepancy", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [expResult] = await db
      .select({
        id: experimentsTable.id,
        candidateId: experimentsTable.candidateId,
        measuredActivity: experimentsTable.measuredActivity,
        measuredSelectivity: experimentsTable.measuredSelectivity,
        measuredYield: experimentsTable.measuredYield,
        notes: experimentsTable.notes,
        candidateName: candidatesTable.name,
        candidateFormula: candidatesTable.formula,
        predictedActivity: candidatesTable.predictedActivity,
        predictedSelectivity: candidatesTable.predictedSelectivity,
        mechanismText: candidatesTable.mechanismText,
        reactionName: reactionsTable.name,
        reactionEquation: reactionsTable.equation,
        conditions: reactionsTable.conditions,
      })
      .from(experimentsTable)
      .leftJoin(candidatesTable, eq(experimentsTable.candidateId, candidatesTable.id))
      .leftJoin(reactionsTable, eq(candidatesTable.reactionId, reactionsTable.id))
      .where(eq(experimentsTable.id, id));

    if (!expResult) {
      res.status(404).json({ error: "Experiment not found" });
      return;
    }

    const activityDiff = expResult.measuredActivity - (expResult.predictedActivity ?? 0);
    const selectivityDiff = expResult.measuredSelectivity - (expResult.predictedSelectivity ?? 0);
    const performance = activityDiff > 0.05 ? "exceeded" : activityDiff < -0.05 ? "underperformed" : "matched";

    req.log.info({ activityDiff, selectivityDiff, performance }, "Analyzing feedback discrepancy");

    const hypothesis = await generateDiscrepancyHypothesis({
      candidateName: expResult.candidateName ?? "candidate",
      candidateFormula: expResult.candidateFormula ?? "",
      reactionEquation: expResult.reactionEquation ?? "",
      conditions: expResult.conditions ?? "",
      mechanismText: expResult.mechanismText ?? "",
      predictedActivity: expResult.predictedActivity ?? 0,
      measuredActivity: expResult.measuredActivity,
      predictedSelectivity: expResult.predictedSelectivity ?? 0,
      measuredSelectivity: expResult.measuredSelectivity,
      measuredYield: expResult.measuredYield,
      notes: expResult.notes,
    });

    await db
      .update(experimentsTable)
      .set({ discrepancyHypothesis: hypothesis })
      .where(eq(experimentsTable.id, id));

    res.json({ experimentId: id, hypothesis });
  } catch (err) {
    req.log.error({ err }, "Failed to analyze discrepancy");
    res.status(500).json({ error: "Failed to analyze discrepancy" });
  }
});

export default router;
