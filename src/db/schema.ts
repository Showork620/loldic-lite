import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import type { AbilityNumericParam } from '../types/abilityStats';

// ========== アイテムテーブル ==========
export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),
  riotId: text('riot_id').notNull().unique(),
  nameJa: text('name_ja').notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  abilities: jsonb('abilities').notNull().default([]),
  plaintextJa: text('plaintext_ja').notNull(),
  priceTotal: integer('price_total').notNull().default(0),
  priceSell: integer('price_sell').notNull().default(0),
  imagePath: text('image_path').notNull(),
  patchStatus: text('patch_status'),
  searchTags: text('search_tags').array().notNull().default([]), // 検索タグ
  roleCategories: text('role_categories').array(), // ロール分類
  popularChampions: text('popular_champions').array(), // よく使うチャンピオン
  maps: integer('maps').array().notNull().default([]), // 11=通常SR, 12=ARAM
  basicStats: jsonb('basic_stats').notNull().default({}), // 基本スタッツ
  abilityStats: jsonb('ability_stats').$type<AbilityNumericParam[]>().notNull().default([]), // アビリティ内の数値パラメータ
  buildFrom: text('build_from').array().notNull().default([]),
  buildInto: text('build_into').array().notNull().default([]),
  updatedPatch: text('updated_patch'), // 更新した最後のパッチバージョン
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ========== 定数管理テーブル ==========

// 手動設定アイテム管理
export const itemManualSettings = pgTable('item_manual_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  riotId: text('riot_id').notNull().unique(),
  isAvailable: boolean('is_available').notNull(), // true=手動で有効化, false=手動で除外
  reason: text('reason'), // 理由（主に除外時に使用）
  updatedPatch: text('updated_patch'), // 更新した最後のパッチバージョン
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 追加タグ管理
export const additionalTags = pgTable('additional_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  riotId: text('riot_id').notNull(),
  tag: text('tag').notNull(), // 例: "体力レシオ", "体力割合ダメージ"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ロール分類管理
export const roleCategories = pgTable('role_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: text('role').notNull(), // "fighter", "marksman", "mage"など
  riotId: text('riot_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ========== 型定義 ==========

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

export type ItemManualSetting = typeof itemManualSettings.$inferSelect;
export type NewItemManualSetting = typeof itemManualSettings.$inferInsert;

export type AdditionalTag = typeof additionalTags.$inferSelect;
export type NewAdditionalTag = typeof additionalTags.$inferInsert;

export type RoleCategoryRecord = typeof roleCategories.$inferSelect;
export type NewRoleCategoryRecord = typeof roleCategories.$inferInsert;
