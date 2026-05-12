import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { discoveryRunsTable } from "./discovery-runs";

export const discoveryEventsTable = pgTable("discovery_events", {
  id: serial("id").primaryKey(),
  runId: integer("run_id")
    .notNull()
    .references(() => discoveryRunsTable.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(),
  message: text("message").notNull(),
  payload: text("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
