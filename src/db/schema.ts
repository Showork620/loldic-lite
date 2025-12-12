import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),
  riotId: text('riot_id').notNull().unique(),
  nameJa: text('name_ja').notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  abilities: jsonb('abilities').notNull().default([]),
  plaintextJa: text('plaintext_ja').notNull(),
  priceTotal: integer('price_total').notNull(),
  priceSell: integer('price_sell').notNull(),
  imagePath: text('image_path').notNull(),
  patchStatus: text('patch_status'),
  searchTags: text('search_tags').array().notNull().default([]),
  roleCategories: text('role_categories').array(),
  popularChampions: text('popular_champions').array(),
  stats: jsonb('stats').notNull().default({}),
  buildFrom: text('build_from').array().notNull().default([]),
  buildInto: text('build_into').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
