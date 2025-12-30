import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// ========== アイテムテーブル ==========
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

// ========== 定数管理テーブル ==========

// 除外アイテム管理
export const unavailableItems = pgTable('unavailable_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  riotId: text('riot_id').notNull().unique(),
  reason: text('reason'), // 除外理由（例: "重複したヒュプリス", "廃止アイテム"）
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 追加タグ管理
export const additionalTags = pgTable('additional_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  riotId: text('riot_id').notNull(),
  tag: text('tag').notNull(), // 例: "体力レシオ", "体力割合ダメージ"
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ロール分類管理
export const roleItems = pgTable('role_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: text('role').notNull(), // "fighter", "marksman", "mage"など
  riotId: text('riot_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========== 型定義 ==========

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

export type UnavailableItem = typeof unavailableItems.$inferSelect;
export type NewUnavailableItem = typeof unavailableItems.$inferInsert;

export type AdditionalTag = typeof additionalTags.$inferSelect;
export type NewAdditionalTag = typeof additionalTags.$inferInsert;

export type RoleItem = typeof roleItems.$inferSelect;
export type NewRoleItem = typeof roleItems.$inferInsert;
