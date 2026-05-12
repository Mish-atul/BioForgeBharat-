import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { reactionsTable } from "./reactions";
import { candidatesTable } from "./candidates";

export const discoveryRunsTable = pgTable("discovery_runs", {
  id: serial("id").primaryKey(),
  reactionId: integer("reaction_id")
    .notNull()
    .references(() => reactionsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("running"),
  summary: text("summary"),
  topCandidateId: integer("top_candidate_id").references(() => candidatesTable.id, {
    onDelete: "set null",
  }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
