import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),
  riotId: text('riot_id').notNull().unique(),
  nameJa: text('name_ja').notNull(),
  descriptionJa: text('description_ja').notNull(),
  plaintextJa: text('plaintext_ja').notNull(),
  priceTotal: integer('price_total').notNull(),
  priceSell: integer('price_sell').notNull(),
  isLegendary: boolean('is_legendary').default(false).notNull(),
  imagePath: text('image_path').notNull(),
  tags: text('tags').array().notNull().default([]),
  stats: jsonb('stats').notNull().default({}),
  buildFrom: text('build_from').array().notNull().default([]),
  buildInto: text('build_into').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
