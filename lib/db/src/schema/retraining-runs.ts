import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const retrainingRunsTable = pgTable("retraining_runs", {
  id: serial("id").primaryKey(),
  triggeredBy: text("triggered_by").notNull(),
  status: text("status").notNull().default("pending"),
  accuracyBefore: real("accuracy_before"),
  accuracyAfter: real("accuracy_after"),
  dataPointsUsed: integer("data_points_used"),
  notes: text("notes"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRetrainingRunSchema = createInsertSchema(retrainingRunsTable).omit({ id: true, createdAt: true });
export type InsertRetrainingRun = z.infer<typeof insertRetrainingRunSchema>;
export type RetrainingRun = typeof retrainingRunsTable.$inferSelect;
