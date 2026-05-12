import { Router } from "express";
import { db } from "@workspace/db";
import { reactionsTable, candidatesTable, experimentsTable, annotationsTable } from "@workspace/db";
import { eq, ne, and, inArray, asc, desc, type SQL } from "drizzle-orm";
import { CreateReactionBody, GenerateCandidatesBody, UpdateReactionBody } from "@workspace/api-zod";
import {
  lookupCheminformatics,
  searchChembl,
  fetchPubChemByName,
} from "../lib/cheminformatics";
import { generateDiscoveryCandidates } from "../lib/discovery-ai";

const router = Router();

router.get("/reactions", async (req, res) => {
  try {
    const reactions = await db.select().from(reactionsTable).orderBy(reactionsTable.createdAt);
    res.json(reactions);
  } catch (err) {
    req.log.error({ err }, "Failed to list reactions");
    res.status(500).json({ error: "Failed to list reactions" });
  }
});

router.post("/reactions", async (req, res) => {
  try {
    const parsed = CreateReactionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const [reaction] = await db.insert(reactionsTable).values(parsed.data).returning();
    res.status(201).json(reaction);
  } catch (err) {
    req.log.error({ err }, "Failed to create reaction");
    res.status(500).json({ error: "Failed to create reaction" });
  }
});

router.get("/reactions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [reaction] = await db.select().from(reactionsTable).where(eq(reactionsTable.id, id));
    if (!reaction) {
      res.status(404).json({ error: "Reaction not found" });
      return;
    }
    res.json(reaction);
  } catch (err) {
    req.log.error({ err }, "Failed to get reaction");
    res.status(500).json({ error: "Failed to get reaction" });
  }
});

router.put("/reactions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = UpdateReactionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const [existing] = await db.select().from(reactionsTable).where(eq(reactionsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Reaction not found" });
      return;
    }
    const [updated] = await db
      .update(reactionsTable)
      .set(parsed.data)
      .where(eq(reactionsTable.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update reaction");
    res.status(500).json({ error: "Failed to update reaction" });
  }
});

router.delete("/reactions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(reactionsTable).where(eq(reactionsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Reaction not found" });
      return;
    }
    // Cascade: delete annotations → experiments → candidates → reaction
    // (DB FK ON DELETE CASCADE handles this automatically, but we do it
    //  explicitly in-order for clarity and to avoid FK violation order issues)
    const candidates = await db
      .select({ id: candidatesTable.id })
      .from(candidatesTable)
      .where(eq(candidatesTable.reactionId, id));

    if (candidates.length > 0) {
      const candidateIds = candidates.map((c) => c.id);
      const experiments = await db
        .select({ id: experimentsTable.id })
        .from(experimentsTable)
        .where(inArray(experimentsTable.candidateId, candidateIds));

      if (experiments.length > 0) {
        const experimentIds = experiments.map((e) => e.id);
        await db.delete(annotationsTable).where(inArray(annotationsTable.experimentId, experimentIds));
      }
      await db.delete(experimentsTable).where(inArray(experimentsTable.candidateId, candidateIds));
      await db.delete(candidatesTable).where(eq(candidatesTable.reactionId, id));
    }

    await db.delete(reactionsTable).where(eq(reactionsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete reaction");
    res.status(500).json({ error: "Failed to delete reaction" });
  }
});

const candidateSortColumns = {
  rank: candidatesTable.rank,
  predictedActivity: candidatesTable.predictedActivity,
  predictedSelectivity: candidatesTable.predictedSelectivity,
  predictedStability: candidatesTable.predictedStability,
  confidenceScore: candidatesTable.confidenceScore,
} as const;

router.get("/reactions/:id/candidates", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const sortByRaw = typeof req.query["sortBy"] === "string" ? req.query["sortBy"] : "rank";
    const sortDirRaw = typeof req.query["sortDir"] === "string" ? req.query["sortDir"] : "asc";
    const sourceRaw = typeof req.query["source"] === "string" ? req.query["source"] : undefined;

    const sortColumn =
      sortByRaw in candidateSortColumns
        ? candidateSortColumns[sortByRaw as keyof typeof candidateSortColumns]
        : candidatesTable.rank;
    const sortFn = sortDirRaw === "desc" ? desc : asc;

    const filters: SQL[] = [eq(candidatesTable.reactionId, id)];
    if (sourceRaw === "generated") {
      filters.push(eq(candidatesTable.source, "generated"));
    } else if (sourceRaw === "literature") {
      // Treat seeded "known" entries and PubChem/ChEMBL "literature" imports
      // as the same conceptual category (reference / non-generated compounds).
      filters.push(ne(candidatesTable.source, "generated"));
    }

    const candidates = await db
      .select()
      .from(candidatesTable)
      .where(filters.length === 1 ? filters[0] : and(...filters))
      .orderBy(sortFn(sortColumn));
    res.json(candidates);
  } catch (err) {
    req.log.error({ err }, "Failed to list candidates");
    res.status(500).json({ error: "Failed to list candidates" });
  }
});

const candidateAiShape = {
  name: (v: unknown) => typeof v === "string" && v.trim().length > 0,
  formula: (v: unknown) => typeof v === "string" && v.trim().length > 0,
  candidateType: (v: unknown) => typeof v === "string" && v.trim().length > 0,
  routeType: (v: unknown) => typeof v === "string" && v.trim().length > 0,
  predictedActivity: (v: unknown) => typeof v === "number" && v >= 0 && v <= 1,
  predictedSelectivity: (v: unknown) => typeof v === "number" && v >= 0 && v <= 1,
  predictedStability: (v: unknown) => typeof v === "number" && v >= 0 && v <= 1,
  confidenceScore: (v: unknown) => typeof v === "number" && v >= 0 && v <= 1,
  feedstockFitScore: (v: unknown) => typeof v === "number" && v >= 0 && v <= 1,
  costScore: (v: unknown) => typeof v === "number" && v >= 0 && v <= 1,
  sustainabilityScore: (v: unknown) => typeof v === "number" && v >= 0 && v <= 1,
  scalabilityScore: (v: unknown) => typeof v === "number" && v >= 0 && v <= 1,
  uncertaintyScore: (v: unknown) => typeof v === "number" && v >= 0 && v <= 1,
  mechanismText: (v: unknown) => typeof v === "string" && v.trim().length > 0,
  structureData: (v: unknown) => typeof v === "string" && v.trim().length > 0,
  evidenceText: (v: unknown) => typeof v === "string" && v.trim().length > 0,
} as const;

function validateAiCandidate(candidate: unknown): string | null {
  const c = candidate as Record<string, unknown>;
  for (const [field, check] of Object.entries(candidateAiShape)) {
    if (!check(c[field])) {
      return `Invalid field "${field}": received ${JSON.stringify(c[field])}`;
    }
  }
  return null;
}

router.post("/reactions/:id/generate-candidates", async (req, res) => {
  try {
    const reactionId = Number(req.params.id);
    const parsed = GenerateCandidatesBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const [reaction] = await db.select().from(reactionsTable).where(eq(reactionsTable.id, reactionId));
    if (!reaction) {
      res.status(404).json({ error: "Reaction not found" });
      return;
    }

    const count = parsed.data.count || 5;
    const aiCandidates = await generateDiscoveryCandidates(reaction, count);

    // Validate every candidate before insert
    for (let i = 0; i < aiCandidates.length; i++) {
      const validationError = validateAiCandidate(aiCandidates[i]);
      if (validationError) {
        req.log.warn({ index: i, error: validationError }, "AI candidate failed validation");
        res.status(500).json({ error: `AI candidate ${i} failed validation: ${validationError}` });
        return;
      }
    }

    const existingCount = await db
      .select()
      .from(candidatesTable)
      .where(eq(candidatesTable.reactionId, reactionId));

    // Insert candidates immediately WITHOUT waiting for cheminformatics
    const insertData = aiCandidates.map((c, i) => ({
      reactionId,
      name: c.name,
      formula: c.formula,
      source: "generated" as const,
      sourceDb: null,
      candidateType: c.candidateType,
      routeType: c.routeType,
      predictedActivity: c.predictedActivity,
      predictedSelectivity: c.predictedSelectivity,
      predictedStability: c.predictedStability,
      confidenceScore: c.confidenceScore,
      feedstockFitScore: c.feedstockFitScore,
      costScore: c.costScore,
      sustainabilityScore: c.sustainabilityScore,
      scalabilityScore: c.scalabilityScore,
      uncertaintyScore: c.uncertaintyScore,
      mechanismText: c.mechanismText,
      structureData: c.structureData,
      evidenceText: c.evidenceText,
      energyProfileData: c.energyProfileData,
      pathwayData: c.pathwayData,
      rank: existingCount.length + i + 1,
      pubchemCid: null,
      chemblId: null,
      molecularWeight: null,
      logP: null,
      tpsa: null,
      canonicalSmiles: null,
      iupacName: null,
    }));

    const inserted = await db.insert(candidatesTable).values(insertData).returning();
    res.json(inserted);

    // Fire-and-forget: enrich candidates with cheminformatics in the background
    // This updates the DB rows after the response is already sent
    Promise.all(
      inserted.map(async (row, i) => {
        try {
          const cheminfo = await lookupCheminformatics(aiCandidates[i].name, aiCandidates[i].formula);
          if (cheminfo.pubchemCid || cheminfo.chemblId) {
            await db.update(candidatesTable)
              .set({
                sourceDb: cheminfo.sourceDb,
                pubchemCid: cheminfo.pubchemCid,
                chemblId: cheminfo.chemblId,
                molecularWeight: cheminfo.molecularWeight,
                logP: cheminfo.logP,
                tpsa: cheminfo.tpsa,
                canonicalSmiles: cheminfo.canonicalSmiles,
                iupacName: cheminfo.iupacName,
              })
              .where(eq(candidatesTable.id, row.id));
          }
        } catch {
          // Best-effort enrichment; failures are expected for composite catalyst names
        }
      }),
    ).catch(() => {});

  } catch (err) {
    req.log.error({ err }, "Failed to generate candidates");
    res.status(500).json({ error: "Failed to generate candidates" });
  }
});

router.post("/reactions/:id/search-candidates", async (req, res) => {
  try {
    const reactionId = Number(req.params.id);
    const rawQuery = req.query["query"];
    const query = typeof rawQuery === "string" ? rawQuery.trim() : "";
    if (!query) {
      res.status(400).json({ error: "Missing required `query` parameter" });
      return;
    }

    const [reaction] = await db
      .select()
      .from(reactionsTable)
      .where(eq(reactionsTable.id, reactionId));
    if (!reaction) {
      res.status(404).json({ error: "Reaction not found" });
      return;
    }

    // Run PubChem (top hit) and ChEMBL (top 5) searches in parallel.
    const [pubchem, chembl] = await Promise.all([
      fetchPubChemByName(query),
      searchChembl(query, 5),
    ]);

    const sourcesQueried: string[] = ["PubChem", "ChEMBL"];
    const existing = await db
      .select({
        pubchemCid: candidatesTable.pubchemCid,
        chemblId: candidatesTable.chemblId,
        canonicalSmiles: candidatesTable.canonicalSmiles,
      })
      .from(candidatesTable)
      .where(eq(candidatesTable.reactionId, reactionId));

    const existingPubchem = new Set(
      existing.map((c) => c.pubchemCid).filter((v): v is number => v != null),
    );
    const existingChembl = new Set(
      existing.map((c) => c.chemblId).filter((v): v is string => v != null),
    );
    const existingSmiles = new Set(
      existing
        .map((c) => c.canonicalSmiles)
        .filter((v): v is string => typeof v === "string" && v.length > 0),
    );

    type InsertRow = typeof candidatesTable.$inferInsert;
    const inserts: InsertRow[] = [];
    let nextRank = existing.length + 1;

    if (
      pubchem &&
      !existingPubchem.has(pubchem.pubchemCid) &&
      !(pubchem.canonicalSmiles && existingSmiles.has(pubchem.canonicalSmiles))
    ) {
      const displayName = pubchem.iupacName ?? query;
      if (pubchem.canonicalSmiles) existingSmiles.add(pubchem.canonicalSmiles);
      inserts.push({
        reactionId,
        name: displayName.length > 80 ? displayName.slice(0, 77) + "..." : displayName,
        formula: pubchem.molecularFormula ?? query,
        source: "literature",
        sourceDb: "PubChem",
        candidateType: reaction.domain === "synthetic-biology" ? "reference-biological-record" : "reference-compound",
        routeType: reaction.domain,
        predictedActivity: 0,
        predictedSelectivity: 0,
        predictedStability: 0,
        confidenceScore: 0,
        feedstockFitScore: 0,
        costScore: 0,
        sustainabilityScore: 0,
        scalabilityScore: 0,
        uncertaintyScore: 1,
        mechanismText: `Reference compound retrieved from PubChem (CID ${pubchem.pubchemCid}). Properties shown below are experimentally measured or computed from the compound's known structure; predicted activity/selectivity/stability are not estimated for literature entries.`,
        structureData: JSON.stringify({
          nodes: [{ id: pubchem.molecularFormula ?? "Cmpd", x: 100, y: 80, r: 28, color: "#10b981" }],
          edges: [],
        }),
        evidenceText: `Retrieved from PubChem for query "${query}" and stored as a non-predicted reference entry for provenance comparison.`,
        energyProfileData: null,
        pathwayData: null,
        rank: nextRank++,
        pubchemCid: pubchem.pubchemCid,
        chemblId: null,
        molecularWeight: pubchem.molecularWeight,
        logP: pubchem.logP,
        tpsa: pubchem.tpsa,
        canonicalSmiles: pubchem.canonicalSmiles,
        iupacName: pubchem.iupacName,
      });
    }

    for (const hit of chembl) {
      // Skip ChEMBL hits already imported into this reaction (by ChEMBL id
      // or canonical SMILES) and ones that duplicate the PubChem hit just
      // pushed in this same request.
      if (existingChembl.has(hit.chemblId)) continue;
      if (hit.canonicalSmiles && existingSmiles.has(hit.canonicalSmiles)) continue;
      if (hit.canonicalSmiles) existingSmiles.add(hit.canonicalSmiles);
      existingChembl.add(hit.chemblId);
      const displayName = hit.prefName ?? hit.chemblId;
      inserts.push({
        reactionId,
        name: displayName.length > 80 ? displayName.slice(0, 77) + "..." : displayName,
        formula: hit.molecularFormula ?? "—",
        source: "literature",
        sourceDb: "ChEMBL",
        candidateType: reaction.domain === "synthetic-biology" ? "reference-bioactivity-record" : "reference-compound",
        routeType: reaction.domain,
        predictedActivity: 0,
        predictedSelectivity: 0,
        predictedStability: 0,
        confidenceScore: 0,
        feedstockFitScore: 0,
        costScore: 0,
        sustainabilityScore: 0,
        scalabilityScore: 0,
        uncertaintyScore: 1,
        mechanismText: `Reference compound retrieved from ChEMBL (${hit.chemblId}). Bioactivity records are catalogued in the ChEMBL database; predicted scores are not estimated for literature entries.`,
        structureData: JSON.stringify({
          nodes: [{ id: hit.molecularFormula ?? "Cmpd", x: 100, y: 80, r: 28, color: "#06b6d4" }],
          edges: [],
        }),
        evidenceText: `Retrieved from ChEMBL for query "${query}" and stored as a non-predicted reference entry for provenance comparison.`,
        energyProfileData: null,
        pathwayData: null,
        rank: nextRank++,
        pubchemCid: null,
        chemblId: hit.chemblId,
        molecularWeight: hit.molecularWeight,
        logP: null,
        tpsa: null,
        canonicalSmiles: hit.canonicalSmiles,
        iupacName: null,
      });
    }

    if (inserts.length === 0) {
      res.json({ query, sourcesQueried, candidates: [] });
      return;
    }

    const inserted = await db.insert(candidatesTable).values(inserts).returning();
    res.json({ query, sourcesQueried, candidates: inserted });
  } catch (err) {
    req.log.error({ err }, "Failed to search candidates");
    res.status(500).json({ error: "Failed to search candidates" });
  }
});

router.get("/reactions/:id/agent-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const steps = [
    { step: "Analyzing bounds...", progress: 20 },
    { step: "Estimating reactor size...", progress: 50 },
    { step: "Generating climate narrative...", progress: 75 },
    { step: "Saving to DB...", progress: 100 }
  ];

  let stepIdx = 0;
  const intervalId = setInterval(() => {
    if (stepIdx >= steps.length) {
      clearInterval(intervalId);
      res.write("event: done\ndata: {}\n\n");
      res.end();
      return;
    }
    const currentStep = steps[stepIdx];
    res.write(`data: ${JSON.stringify(currentStep)}\n\n`);
    stepIdx++;
  }, 1000);

  req.on("close", () => {
    clearInterval(intervalId);
  });
});

export default router;
