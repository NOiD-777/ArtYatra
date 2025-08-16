import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const artStyles = pgTable("art_styles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  originLocation: jsonb("origin_location").notNull(), // {lat: number, lng: number}
  description: text("description").notNull(),
  funFacts: jsonb("fun_facts").notNull(), // string[]
  imageUrl: text("image_url"),
  culturalSignificance: text("cultural_significance").notNull(),
  state: text("state").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const classifications = pgTable("classifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  artStyleId: uuid("art_style_id").notNull().references(() => artStyles.id),
  imageData: text("image_data").notNull(), // base64 encoded image
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const artStylesRelations = relations(artStyles, ({ many }) => ({
  classifications: many(classifications),
}));

export const classificationsRelations = relations(classifications, ({ one }) => ({
  artStyle: one(artStyles, {
    fields: [classifications.artStyleId],
    references: [artStyles.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertArtStyleSchema = createInsertSchema(artStyles).omit({
  id: true,
  createdAt: true,
});

export const insertClassificationSchema = createInsertSchema(classifications).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertArtStyle = z.infer<typeof insertArtStyleSchema>;
export type ArtStyle = typeof artStyles.$inferSelect;

export type InsertClassification = z.infer<typeof insertClassificationSchema>;
export type Classification = typeof classifications.$inferSelect;
