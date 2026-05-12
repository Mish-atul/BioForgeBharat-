import { Router } from "express";
import { db } from "@workspace/db";
import {
  reactionsTable,
  candidatesTable,
  experimentsTable,
  annotationsTable,
  discoveryRunsTable,
  discoveryEventsTable,
} from "@workspace/db";
import { eq, ne, and, inArray, asc, desc, type SQL } from "drizzle-orm";
import { CreateReactionBody, GenerateCandidatesBody, UpdateReactionBody } from "@workspace/api-zod";
import {
  lookupCheminformatics,
  searchChembl,
  fetchPubChemByName,
} from "../lib/cheminformatics";
import { generateDiscoveryCandidates } from "../lib/discovery-ai";
import { buildCandidateReadiness } from "../lib/sustainability";
import { runCrewRecommendation } from "../lib/crew-recommendation";

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
    const insertData = await Promise.all(
      aiCandidates.map(async (c, i) => ({
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
        ...(await buildCandidateReadiness(reaction, {
          name: c.name,
          formula: c.formula,
          candidateType: c.candidateType,
          predictedActivity: c.predictedActivity,
          predictedSelectivity: c.predictedSelectivity,
          predictedStability: c.predictedStability,
          sustainabilityScore: c.sustainabilityScore,
        })),
      })),
    );

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

    const enrichedInserts = await Promise.all(
      inserts.map(async (row) => ({
        ...row,
        ...(await buildCandidateReadiness(reaction, {
          name: row.name,
          formula: row.formula,
          candidateType: row.candidateType ?? null,
          predictedActivity: row.predictedActivity,
          predictedSelectivity: row.predictedSelectivity,
          predictedStability: row.predictedStability,
          sustainabilityScore: row.sustainabilityScore ?? null,
        })),
      })),
    );

    const inserted = await db.insert(candidatesTable).values(enrichedInserts).returning();
    res.json({ query, sourcesQueried, candidates: inserted });
  } catch (err) {
    req.log.error({ err }, "Failed to search candidates");
    res.status(500).json({ error: "Failed to search candidates" });
  }
});

router.get("/reactions/:id/agent-runs/latest", async (req, res) => {
  try {
    const reactionId = Number(req.params.id);
    const [run] = await db
      .select()
      .from(discoveryRunsTable)
      .where(eq(discoveryRunsTable.reactionId, reactionId))
      .orderBy(desc(discoveryRunsTable.startedAt))
      .limit(1);
    if (!run) {
      res.json(null);
      return;
    }
    const events = await db
      .select()
      .from(discoveryEventsTable)
      .where(eq(discoveryEventsTable.runId, run.id))
      .orderBy(discoveryEventsTable.createdAt);
    res.json({ run, events });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch latest discovery run");
    res.status(500).json({ error: "Failed to fetch discovery run" });
  }
});

router.post("/reactions/:id/agent-run", async (req, res) => {
  const writeEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let runId: number | null = null;
  try {
    const reactionId = Number(req.params.id);
    const [reaction] = await db.select().from(reactionsTable).where(eq(reactionsTable.id, reactionId));
    if (!reaction) {
      res.status(404).json({ error: "Reaction not found" });
      return;
    }
    const requestedCount = Number(req.body?.count ?? 5);
    const count = Number.isFinite(requestedCount) ? Math.min(Math.max(requestedCount, 3), 8) : 5;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const [run] = await db
      .insert(discoveryRunsTable)
      .values({ reactionId, status: "running" })
      .returning();
    runId = run.id;

    const emit = async (stage: string, message: string, payload?: unknown) => {
      const [event] = await db
        .insert(discoveryEventsTable)
        .values({
          runId: run.id,
          stage,
          message,
          payload: payload == null ? null : JSON.stringify(payload),
        })
        .returning();
      writeEvent("update", {
        id: event.id,
        runId: run.id,
        stage,
        message,
        payload: payload ?? null,
        createdAt: event.createdAt.toISOString(),
      });
    };

    await emit("context", "Loaded reaction context and feedstock constraints.", {
      reactionId,
      targetProduct: reaction.targetProduct,
      domain: reaction.domain,
    });

    const [pubchem, chembl] = await Promise.all([
      fetchPubChemByName(reaction.targetProduct),
      searchChembl(reaction.targetProduct, 3),
    ]);
    await emit("literature", "Retrieved live reference evidence from PubChem and ChEMBL.", {
      pubchemFound: Boolean(pubchem),
      chemblHits: chembl.length,
    });

    await emit("design", `Generating ${count} ranked candidate designs through the active discovery pipeline.`);

    const generated = await generateDiscoveryCandidates(reaction, count);
    const existing = await db.select().from(candidatesTable).where(eq(candidatesTable.reactionId, reactionId));
    const rows = await Promise.all(
      generated.map(async (candidate, index) => ({
        reactionId,
        name: candidate.name,
        formula: candidate.formula,
        source: "generated" as const,
        sourceDb: null,
        candidateType: candidate.candidateType,
        routeType: candidate.routeType,
        predictedActivity: candidate.predictedActivity,
        predictedSelectivity: candidate.predictedSelectivity,
        predictedStability: candidate.predictedStability,
        confidenceScore: candidate.confidenceScore,
        feedstockFitScore: candidate.feedstockFitScore,
        costScore: candidate.costScore,
        sustainabilityScore: candidate.sustainabilityScore,
        scalabilityScore: candidate.scalabilityScore,
        uncertaintyScore: candidate.uncertaintyScore,
        mechanismText: candidate.mechanismText,
        structureData: candidate.structureData,
        evidenceText: candidate.evidenceText,
        energyProfileData: candidate.energyProfileData,
        pathwayData: candidate.pathwayData,
        rank: existing.length + index + 1,
        ...(await buildCandidateReadiness(reaction, {
          name: candidate.name,
          formula: candidate.formula,
          candidateType: candidate.candidateType,
          predictedActivity: candidate.predictedActivity,
          predictedSelectivity: candidate.predictedSelectivity,
          predictedStability: candidate.predictedStability,
          sustainabilityScore: candidate.sustainabilityScore,
        })),
      })),
    );
    const inserted = await db.insert(candidatesTable).values(rows).returning();
    const topCandidate = [...inserted].sort(
      (a, b) => (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0),
    )[0];

    await emit("screening", "Scored climate impact, toxicity, recyclability, scale-up, and commercial readiness.", {
      created: inserted.length,
    });
    await emit("groq", "Asking Groq to select the strongest shortlist candidate from the evidence and scoring context.");

    const recommendation = await runCrewRecommendation({
      reaction,
      candidates: inserted,
      evidence: {
        pubchemFound: Boolean(pubchem),
        pubchemName: pubchem?.iupacName ?? null,
        chemblHits: chembl.length,
        chemblNames: chembl.map((hit) => hit.prefName ?? hit.chemblId),
      },
    });

    let chosenCandidate = inserted.find((candidate) => candidate.name === recommendation.winner_name) ?? null;
    const proposed = recommendation.proposed_candidate;
    if (!chosenCandidate && recommendation.reject_all && proposed?.name && proposed?.formula) {
      const score = (value: unknown, fallback: number) => {
        const n = typeof value === "number" ? value : Number(value);
        return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : fallback;
      };
      const proposedCandidate = {
        reactionId,
        name: proposed.name,
        formula: proposed.formula,
        source: "groq-recommended",
        sourceDb: "groq",
        candidateType: proposed.candidateType ?? (reaction.domain === "synthetic-biology" ? "microbial-pathway" : "heterogeneous-catalyst"),
        routeType: proposed.routeType ?? (reaction.domain === "synthetic-biology" ? "synthetic-biology" : "chemical-catalysis"),
        predictedActivity: score(proposed.predictedActivity, 0.78),
        predictedSelectivity: score(proposed.predictedSelectivity, 0.78),
        predictedStability: score(proposed.predictedStability, 0.74),
        confidenceScore: score(proposed.confidenceScore, 0.68),
        feedstockFitScore: score(proposed.feedstockFitScore, 0.75),
        costScore: score(proposed.costScore, 0.65),
        sustainabilityScore: score(proposed.sustainabilityScore, 0.78),
        scalabilityScore: score(proposed.scalabilityScore, 0.7),
        uncertaintyScore: score(proposed.uncertaintyScore, 0.28),
        mechanismText: proposed.mechanismText ?? recommendation.why_this_candidate,
        structureData: JSON.stringify({
          nodes: [
            { id: "mechanism", x: 40, y: 70 },
            { id: "active-site", x: 145, y: 70 },
            { id: "product", x: 250, y: 70 },
          ],
          edges: [
            { from: "mechanism", to: "active-site" },
            { from: "active-site", to: "product" },
          ],
        }),
        evidenceText: proposed.evidenceText ?? recommendation.recommendation,
        energyProfileData:
          reaction.domain === "synthetic-biology"
            ? null
            : JSON.stringify({
                steps: [
                  { label: "Reactants", energy: 0 },
                  { label: "Activated intermediate", energy: 0.34 },
                  { label: "Rate-limiting transition", energy: 0.58 },
                  { label: reaction.targetProduct, energy: -0.21 },
                ],
              }),
        pathwayData:
          reaction.domain === "synthetic-biology"
            ? JSON.stringify({
                nodes: [
                  { id: "feedstock", label: "Feedstock", flux: 100 },
                  { id: "pathway", label: "Engineered pathway", flux: 76 },
                  { id: "product", label: reaction.targetProduct, flux: 62 },
                ],
                edits: ["Mechanism-compatible route proposed by Groq"],
                bottlenecks: ["Needs experimental validation"],
              })
            : null,
        rank: existing.length + inserted.length + 1,
        ...(await buildCandidateReadiness(reaction, {
          name: proposed.name,
          formula: proposed.formula,
          candidateType: proposed.candidateType ?? null,
          predictedActivity: score(proposed.predictedActivity, 0.78),
          predictedSelectivity: score(proposed.predictedSelectivity, 0.78),
          predictedStability: score(proposed.predictedStability, 0.74),
          sustainabilityScore: score(proposed.sustainabilityScore, 0.78),
        })),
      };
      [chosenCandidate] = await db.insert(candidatesTable).values(proposedCandidate).returning();
    }
    chosenCandidate ??= topCandidate;

    await emit(
      "recommendation",
      recommendation.reject_all && proposed?.name
        ? `Groq proposed a mechanism-compatible catalyst: ${proposed.name}.`
        : recommendation.reject_all
        ? "Groq found no scientifically compatible catalyst in the current shortlist."
        : `Groq recommendation selected ${recommendation.winner_name}.`,
      recommendation,
    );

    const summary = recommendation.reject_all && proposed?.name
      ? `Created ${inserted.length} discovery candidates. Groq proposed mechanism-compatible winner: ${proposed.name} (${recommendation.confidence} confidence).`
      : recommendation.reject_all
      ? `Created ${inserted.length} discovery candidates. Groq rejected the shortlist as mechanistically incompatible.`
      : `Created ${inserted.length} discovery candidates. Groq winner: ${recommendation.winner_name} (${recommendation.confidence} confidence).`;
    await db
      .update(discoveryRunsTable)
      .set({
        status: "completed",
        topCandidateId: chosenCandidate?.id ?? null,
        summary,
        completedAt: new Date(),
      })
      .where(eq(discoveryRunsTable.id, run.id));

    writeEvent("complete", {
      runId: run.id,
      reactionId,
      summary,
      created: inserted.length,
      topCandidateId: chosenCandidate?.id ?? null,
      topCandidateName: chosenCandidate?.name ?? recommendation.winner_name,
      recommendation,
    });
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to run discovery agent");
    const errorMessage = err instanceof Error ? err.message : "Discovery run failed before completion.";
    if (runId != null) {
      await db
        .update(discoveryRunsTable)
        .set({ status: "failed", summary: errorMessage.slice(0, 500), completedAt: new Date() })
        .where(eq(discoveryRunsTable.id, runId))
        .catch(() => undefined);
    }
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to run discovery agent" });
      return;
    }
    writeEvent("error", { message: errorMessage });
    res.end();
  }
});

export default router;
