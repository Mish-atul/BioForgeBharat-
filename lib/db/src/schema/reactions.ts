import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reactionsTable = pgTable("reactions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  equation: text("equation").notNull(),
  targetProduct: text("target_product").notNull(),
  conditions: text("conditions").notNull(),
  description: text("description").notNull(),
  domain: text("domain").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReactionSchema = createInsertSchema(reactionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactionsTable.$inferSelect;
