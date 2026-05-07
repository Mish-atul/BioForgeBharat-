import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { candidatesTable } from "./candidates";

export const experimentsTable = pgTable("experiments", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id")
    .notNull()
    .references(() => candidatesTable.id, { onDelete: "cascade" }),
  measuredActivity: real("measured_activity").notNull(),
  measuredSelectivity: real("measured_selectivity").notNull(),
  measuredYield: real("measured_yield").notNull(),
  researcherName: text("researcher_name").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("completed"),
  discrepancyHypothesis: text("discrepancy_hypothesis"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertExperimentSchema = createInsertSchema(experimentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertExperiment = z.infer<typeof insertExperimentSchema>;
export type Experiment = typeof experimentsTable.$inferSelect;
