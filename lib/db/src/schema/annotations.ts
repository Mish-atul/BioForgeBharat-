import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { experimentsTable } from "./experiments";

export const annotationsTable = pgTable("annotations", {
  id: serial("id").primaryKey(),
  experimentId: integer("experiment_id")
    .notNull()
    .references(() => experimentsTable.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnnotationSchema = createInsertSchema(annotationsTable).omit({ id: true, createdAt: true });
export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;
export type Annotation = typeof annotationsTable.$inferSelect;
