/**
 * Stage 4: 正規状態の構築＋変更提案の生成
 *
 * 全アイテムについて mergeItemState（manual > patchnote > ddragon）で
 * item_states を構築し、前パッチとのdiff＋パッチノート抽出から
 * item_changes を review_status='pending' で提案する。
 *
 * 不変条件:
 * - approved / rejected の item_changes は --force なしでは上書きしない
 * - 最初のパッチ（前パッチが存在しない）は基準データ扱いで changes を作らない
 * - hotfixパッチの item_states は抽出/オーバーライドがあるアイテムのみ（疎）
 */

import { eq, lt, desc, sql } from 'drizzle-orm'
import type { Db } from '../lib/db'
import { schema } from '../lib/db'
import { mergeItemState } from '../../src/core/merge/mergeItemState'
import { proposeChanges } from '../../src/core/changes/proposeChanges'
import { CONFIDENCE_THRESHOLD } from '../../src/core/patchnote/confidence'
import type { RawRiotItemData } from '../../src/types/domain/item'
import type { ItemStateData } from '../../src/types/domain/itemState'
import type { ParsedChange } from '../../src/types/domain/patchnote'
import { toSortKey } from '../lib/patchVersion'

export interface ProposeOptions {
  patch: string
  /** approved/rejected 済みの item_changes も上書きする */
  force?: boolean
}

interface ExtractRow {
  id: string
  riotId: string | null
  itemName: string
  quotedText: string
  parsedChanges: ParsedChange[]
  confidence: number
}

/** 各riotIdの「このsortKey以前で最新の正規状態」を取得 */
async function loadEffectiveStates(
  db: Db,
  maxSortKey: number
): Promise<Map<string, ItemStateData>> {
  const result = await db.execute(sql`
    SELECT DISTINCT ON (s.riot_id) s.riot_id, s.data
    FROM item_states s
    JOIN patches p ON p.version = s.patch_version
    WHERE p.sort_key <= ${maxSortKey}
    ORDER BY s.riot_id, p.sort_key DESC
  `)
  const map = new Map<string, ItemStateData>()
  for (const row of result.rows as Array<{ riot_id: string; data: ItemStateData }>) {
    map.set(row.riot_id, row.data)
  }
  return map
}

export async function runPropose(db: Db, opts: ProposeOptions): Promise<void> {
  const { patch } = opts
  console.log(`⚙️ propose: patch=${patch}`)

  const patchRows = await db
    .select()
    .from(schema.patches)
    .where(eq(schema.patches.version, patch))
  if (!patchRows.length) throw new Error(`パッチ ${patch} が未登録です`)
  const patchRow = patchRows[0]
  const isHotfix = patchRow.kind === 'hotfix'

  // 直前パッチ（kind問わず）
  const prevPatch = await db
    .select()
    .from(schema.patches)
    .where(lt(schema.patches.sortKey, patchRow.sortKey))
    .orderBy(desc(schema.patches.sortKey))
    .limit(1)
  const isBaseline = prevPatch.length === 0
  if (isBaseline) {
    console.log('   前パッチなし → 基準データとして states のみ構築（changes は生成しない）')
  }

  // このパッチのsnapshot
  const snapshots = await db
    .select({ riotId: schema.ddragonSnapshots.riotId, raw: schema.ddragonSnapshots.raw })
    .from(schema.ddragonSnapshots)
    .where(eq(schema.ddragonSnapshots.patchVersion, patch))
  const rawByRiotId = new Map(snapshots.map((s) => [s.riotId, s.raw as RawRiotItemData]))
  if (!isHotfix && rawByRiotId.size === 0) {
    throw new Error(`パッチ ${patch} のsnapshotがありません。先にingestを実行してください`)
  }

  // 直前パッチ時点の有効状態
  const prevStates = isBaseline
    ? new Map<string, ItemStateData>()
    : await loadEffectiveStates(db, prevPatch[0].sortKey)

  // このパッチのパッチノート抽出（riotId解決済みのみ）
  const extractRows = (await db
    .select()
    .from(schema.patchnoteExtracts)
    .where(eq(schema.patchnoteExtracts.patchVersion, patch))) as ExtractRow[]
  const extractsByRiotId = new Map<string, ExtractRow[]>()
  for (const ex of extractRows) {
    if (!ex.riotId) continue
    extractsByRiotId.set(ex.riotId, [...(extractsByRiotId.get(ex.riotId) ?? []), ex])
  }

  // このパッチで有効な手動オーバーライド
  const allOverrides = await db.select().from(schema.manualOverrides)
  const overridesByRiotId = new Map<string, typeof allOverrides>()
  for (const ov of allOverrides) {
    const from = toSortKey(ov.effectiveFromPatch)
    const to = ov.effectiveToPatch ? toSortKey(ov.effectiveToPatch) : Infinity
    if (patchRow.sortKey < from || patchRow.sortKey > to) continue
    overridesByRiotId.set(ov.riotId, [...(overridesByRiotId.get(ov.riotId) ?? []), ov])
  }

  // 既存のitem_changes（承認済み保護）
  const existingChanges = await db
    .select({ riotId: schema.itemChanges.riotId, reviewStatus: schema.itemChanges.reviewStatus })
    .from(schema.itemChanges)
    .where(eq(schema.itemChanges.patchVersion, patch))
  const reviewedIds = new Set(
    existingChanges.filter((c) => c.reviewStatus !== 'pending').map((c) => c.riotId)
  )

  const riotIds = new Set([
    ...rawByRiotId.keys(),
    ...prevStates.keys(),
    ...extractsByRiotId.keys(),
  ])

  let statesUpserted = 0
  let changesProposed = 0
  let protectedCount = 0

  for (const riotId of riotIds) {
    const snapshot = rawByRiotId.get(riotId) ?? null
    const prev = prevStates.get(riotId) ?? null
    const extracts = extractsByRiotId.get(riotId) ?? []
    const overrides = overridesByRiotId.get(riotId) ?? []

    let after: ItemStateData | null = null

    if (snapshot) {
      // 通常パッチ: ddragonから再構築
      const merged = mergeItemState({
        riotId,
        snapshot,
        previousState: prev,
        extracts: extracts
          .filter((e) => e.confidence >= CONFIDENCE_THRESHOLD)
          .map((e) => ({ id: e.id, parsedChanges: e.parsedChanges, confidence: e.confidence })),
        overrides: overrides.map((o) => ({ id: o.id, fieldPath: o.fieldPath, value: o.value })),
      })
      after = merged.data
      await db
        .insert(schema.itemStates)
        .values({ riotId, patchVersion: patch, data: merged.data, provenance: merged.provenance })
        .onConflictDoUpdate({
          target: [schema.itemStates.riotId, schema.itemStates.patchVersion],
          set: { data: merged.data, provenance: merged.provenance, updatedAt: new Date() },
        })
      statesUpserted++
    } else if (isHotfix && prev && (extracts.length > 0 || overrides.length > 0)) {
      // hotfix: 抽出/オーバーライドがあるアイテムのみ疎に状態を作る
      const merged = mergeItemState({
        riotId,
        snapshot: null,
        previousState: prev,
        extracts: extracts
          .filter((e) => e.confidence >= CONFIDENCE_THRESHOLD)
          .map((e) => ({ id: e.id, parsedChanges: e.parsedChanges, confidence: e.confidence })),
        overrides: overrides.map((o) => ({ id: o.id, fieldPath: o.fieldPath, value: o.value })),
      })
      after = merged.data
      await db
        .insert(schema.itemStates)
        .values({ riotId, patchVersion: patch, data: merged.data, provenance: merged.provenance })
        .onConflictDoUpdate({
          target: [schema.itemStates.riotId, schema.itemStates.patchVersion],
          set: { data: merged.data, provenance: merged.provenance, updatedAt: new Date() },
        })
      statesUpserted++
    } else if (isHotfix) {
      continue // hotfixで変更がないアイテムはスキップ
    }
    // majorでsnapshotが無い場合は after=null（削除）として提案する

    if (isBaseline) continue

    const proposed = proposeChanges({
      riotId,
      before: prev,
      after,
      extracts: extracts.map((e) => ({
        id: e.id,
        itemName: e.itemName,
        quotedText: e.quotedText,
        parsedChanges: e.parsedChanges,
        confidence: e.confidence,
      })),
    })
    if (!proposed) continue

    if (reviewedIds.has(riotId) && !opts.force) {
      protectedCount++
      continue
    }

    await db
      .insert(schema.itemChanges)
      .values({
        riotId,
        patchVersion: patch,
        changeType: proposed.changeType,
        changes: proposed.changes,
        patchnoteQuote: proposed.patchnoteQuote,
        reviewStatus: 'pending',
      })
      .onConflictDoUpdate({
        target: [schema.itemChanges.riotId, schema.itemChanges.patchVersion],
        set: {
          changeType: proposed.changeType,
          changes: proposed.changes,
          patchnoteQuote: proposed.patchnoteQuote,
          reviewStatus: 'pending',
          updatedAt: new Date(),
        },
      })
    changesProposed++
  }

  console.log(
    `✅ propose 完了: states ${statesUpserted} 件 / changes ${changesProposed} 件` +
      (protectedCount ? ` / レビュー済み保護 ${protectedCount} 件` : '')
  )
}
