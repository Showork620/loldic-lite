import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import type { AbilityNumericParam } from '../types/domain/abilityStats';
import type { ItemStateData, Provenance } from '../types/domain/itemState';
import type { ChangeEntry } from '../types/domain/itemChange';
import type { ParsedChange } from '../types/domain/patchnote';

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

// ========== パッチ管理テーブル ==========

// 現在適用中のパッチバージョン管理（単一レコード）
export const patchVersions = pgTable('patch_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  currentPatch: text('current_patch').notNull(),
  lastCheckedAt: timestamp('last_checked_at').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========== パッチマスタ（Layer 1・他テーブルのFK先） ==========

/**
 * ゲームパッチの全順序管理。
 * version はゲームパッチ名（例 "26.1", hotfixは "26.1b"）。
 * DDragonバージョン（例 "16.1.1"）とは命名体系が異なるため別カラムで持つ。
 * hotfix は DDragon に現れないため ddragonVersion = null。
 */
export const patches = pgTable('patches', {
  version: text('version').primaryKey(),
  kind: text('kind', { enum: ['major', 'hotfix'] }).notNull().default('major'),
  ddragonVersion: text('ddragon_version'),
  patchnoteUrl: text('patchnote_url'),
  releasedAt: timestamp('released_at'),
  status: text('status', { enum: ['draft', 'ingested', 'reviewed', 'published'] })
    .notNull()
    .default('draft'),
  sortKey: integer('sort_key').notNull(), // 例: 26.1=26010, 26.1b=26011, 26.2=26020
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ========== Layer 0: 生データ（append-only、書き換え禁止） ==========

/** DDragon item.json の1エントリそのまま。パーサー修正時の再導出の源泉 */
export const ddragonSnapshots = pgTable(
  'ddragon_snapshots',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    patchVersion: text('patch_version')
      .notNull()
      .references(() => patches.version),
    riotId: text('riot_id').notNull(),
    raw: jsonb('raw').notNull(),
    fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('ux_snapshots_patch_riot').on(t.patchVersion, t.riotId),
    index('ix_snapshots_riot').on(t.riotId),
  ]
);

/** パッチノートの生HTML。DOM構造が変わってもパーサー修正→再抽出できる */
export const patchnoteDocuments = pgTable(
  'patchnote_documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    patchVersion: text('patch_version')
      .notNull()
      .references(() => patches.version),
    url: text('url').notNull(),
    rawHtml: text('raw_html').notNull(),
    fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('ux_patchnote_doc').on(t.patchVersion, t.url)]
);

/** パッチノート解析結果。riotId=null は名前解決失敗（レビューUIで手動紐付け） */
export const patchnoteExtracts = pgTable(
  'patchnote_extracts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => patchnoteDocuments.id),
    patchVersion: text('patch_version')
      .notNull()
      .references(() => patches.version),
    riotId: text('riot_id'),
    itemName: text('item_name').notNull(),
    quotedText: text('quoted_text').notNull(),
    parsedChanges: jsonb('parsed_changes').$type<ParsedChange[]>().notNull().default([]),
    confidence: real('confidence').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('ix_extracts_patch').on(t.patchVersion),
    index('ix_extracts_riot').on(t.riotId),
  ]
);

// ========== Layer 1: 正規状態 ==========

/**
 * パッチごとのアイテムの確定した姿。
 * mergeItemState（純粋関数）で Layer 0 ＋ overrides から再導出可能。
 */
export const itemStates = pgTable(
  'item_states',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    riotId: text('riot_id').notNull(),
    patchVersion: text('patch_version')
      .notNull()
      .references(() => patches.version),
    data: jsonb('data').$type<ItemStateData>().notNull(),
    provenance: jsonb('provenance').$type<Provenance>().notNull().default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('ux_states_riot_patch').on(t.riotId, t.patchVersion),
    index('ix_states_patch').on(t.patchVersion),
  ]
);

/**
 * フィールド単位・パッチ範囲付きの手動修正。
 * 再同期で消えず、「26.10〜26.12の間だけ正しい値」も表現できる。
 * effectiveToPatch = null は「現在まで有効」。
 */
export const manualOverrides = pgTable(
  'manual_overrides',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    riotId: text('riot_id').notNull(),
    fieldPath: text('field_path').notNull(),
    value: jsonb('value').notNull(),
    effectiveFromPatch: text('effective_from_patch')
      .notNull()
      .references(() => patches.version),
    effectiveToPatch: text('effective_to_patch'),
    reason: text('reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('ix_overrides_riot').on(t.riotId, t.effectiveFromPatch)]
);

// ========== Layer 2: 変更イベント ==========

/**
 * パッチごとのアイテム変更。自動生成は review_status='pending' で、
 * 人間の承認（approved）を経て公開タイムラインに表示される。
 */
export const itemChanges = pgTable(
  'item_changes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    riotId: text('riot_id').notNull(),
    patchVersion: text('patch_version')
      .notNull()
      .references(() => patches.version),
    changeType: text('change_type', {
      enum: ['buff', 'nerf', 'adjusted', 'rework', 'new', 'removed'],
    }).notNull(),
    changes: jsonb('changes').$type<ChangeEntry[]>().notNull().default([]),
    patchnoteQuote: text('patchnote_quote'),
    reviewStatus: text('review_status', { enum: ['pending', 'approved', 'rejected'] })
      .notNull()
      .default('pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('ux_changes_riot_patch').on(t.riotId, t.patchVersion),
    index('ix_changes_patch_status').on(t.patchVersion, t.reviewStatus),
    index('ix_changes_riot_status').on(t.riotId, t.reviewStatus),
  ]
);

// ========== 型定義 ==========

export type Patch = typeof patches.$inferSelect;
export type NewPatch = typeof patches.$inferInsert;

export type DdragonSnapshot = typeof ddragonSnapshots.$inferSelect;
export type NewDdragonSnapshot = typeof ddragonSnapshots.$inferInsert;

export type PatchnoteDocument = typeof patchnoteDocuments.$inferSelect;
export type NewPatchnoteDocument = typeof patchnoteDocuments.$inferInsert;

export type PatchnoteExtract = typeof patchnoteExtracts.$inferSelect;
export type NewPatchnoteExtract = typeof patchnoteExtracts.$inferInsert;

export type ItemState = typeof itemStates.$inferSelect;
export type NewItemState = typeof itemStates.$inferInsert;

export type ManualOverride = typeof manualOverrides.$inferSelect;
export type NewManualOverride = typeof manualOverrides.$inferInsert;

export type ItemChange = typeof itemChanges.$inferSelect;
export type NewItemChange = typeof itemChanges.$inferInsert;

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

export type ItemManualSetting = typeof itemManualSettings.$inferSelect;
export type NewItemManualSetting = typeof itemManualSettings.$inferInsert;

export type AdditionalTag = typeof additionalTags.$inferSelect;
export type NewAdditionalTag = typeof additionalTags.$inferInsert;

export type RoleCategoryRecord = typeof roleCategories.$inferSelect;
export type NewRoleCategoryRecord = typeof roleCategories.$inferInsert;

export type PatchVersion = typeof patchVersions.$inferSelect;
export type NewPatchVersion = typeof patchVersions.$inferInsert;
