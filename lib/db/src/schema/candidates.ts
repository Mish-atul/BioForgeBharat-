import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { reactionsTable } from "./reactions";

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  reactionId: integer("reaction_id")
    .notNull()
    .references(() => reactionsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  formula: text("formula").notNull(),
  source: text("source").notNull(),
  sourceDb: text("source_db"),
  candidateType: text("candidate_type"),
  routeType: text("route_type"),
  predictedActivity: real("predicted_activity").notNull(),
  predictedSelectivity: real("predicted_selectivity").notNull(),
  predictedStability: real("predicted_stability").notNull(),
  confidenceScore: real("confidence_score").notNull(),
  feedstockFitScore: real("feedstock_fit_score"),
  costScore: real("cost_score"),
  sustainabilityScore: real("sustainability_score"),
  scalabilityScore: real("scalability_score"),
  uncertaintyScore: real("uncertainty_score"),
  mechanismText: text("mechanism_text").notNull(),
  structureData: text("structure_data").notNull(),
  evidenceText: text("evidence_text"),
  energyProfileData: text("energy_profile_data"),
  pathwayData: text("pathway_data"),
  rank: integer("rank"),
  pubchemCid: integer("pubchem_cid"),
  chemblId: text("chembl_id"),
  molecularWeight: real("molecular_weight"),
  logP: real("log_p"),
  tpsa: real("tpsa"),
  canonicalSmiles: text("canonical_smiles"),
  iupacName: text("iupac_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;
