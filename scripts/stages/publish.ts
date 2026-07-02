/**
 * Stage 5: 公開（items テーブルへの materialize）
 *
 * 指定パッチ時点の有効状態（各アイテムの最新 item_states）を
 * 既存UIが読む items テーブルへ反映する。
 *
 * - is_available は 手動設定（item_manual_settings） > 自動除外ルール の順で決定
 * - patch_status は承認済み item_changes の change_type から
 * - search_tags は 自動タグ ＋ additional_tags のマージ
 * - role_categories / popular_champions（手動フィールド）には触れない
 * - このパッチに存在しないアイテムは is_available=false にする（行は消さない）
 */

import { eq, lte, desc, and, sql } from 'drizzle-orm'
import type { Db } from '../lib/db'
import { schema } from '../lib/db'
import { getUnavailableItemIds } from '../../src/lib/riot/riotApi'
import type { RawRiotItemData } from '../../src/types/domain/item'
import type { ItemStateData } from '../../src/types/domain/itemState'
import type { AbilityNumericParam } from '../../src/types/domain/abilityStats'

export interface PublishOptions {
  patch: string
}

export async function runPublish(db: Db, opts: PublishOptions): Promise<void> {
  const { patch } = opts
  console.log(`🚀 publish: patch=${patch}`)

  const patchRows = await db
    .select()
    .from(schema.patches)
    .where(eq(schema.patches.version, patch))
  if (!patchRows.length) throw new Error(`パッチ ${patch} が未登録です`)
  const patchRow = patchRows[0]

  // このパッチ以前の最新majorパッチ = 「存在するアイテム」の基準
  const baseMajor = await db
    .select()
    .from(schema.patches)
    .where(
      and(lte(schema.patches.sortKey, patchRow.sortKey), eq(schema.patches.kind, 'major'))
    )
    .orderBy(desc(schema.patches.sortKey))
    .limit(1)
  if (!baseMajor.length) throw new Error('majorパッチのデータがありません')

  const snapshots = await db
    .select({ riotId: schema.ddragonSnapshots.riotId, raw: schema.ddragonSnapshots.raw })
    .from(schema.ddragonSnapshots)
    .where(eq(schema.ddragonSnapshots.patchVersion, baseMajor[0].version))
  const rawByRiotId = new Map(snapshots.map((s) => [s.riotId, s.raw as RawRiotItemData]))

  // 有効状態（このパッチ時点の各アイテム最新state）
  const statesResult = await db.execute(sql`
    SELECT DISTINCT ON (s.riot_id) s.riot_id, s.data
    FROM item_states s
    JOIN patches p ON p.version = s.patch_version
    WHERE p.sort_key <= ${patchRow.sortKey}
    ORDER BY s.riot_id, p.sort_key DESC
  `)
  const stateByRiotId = new Map<string, ItemStateData>()
  for (const row of statesResult.rows as Array<{ riot_id: string; data: ItemStateData }>) {
    if (rawByRiotId.has(row.riot_id)) stateByRiotId.set(row.riot_id, row.data)
  }

  // 可用性: 自動除外ルール ＋ 手動設定
  const autoExcluded = new Set(
    getUnavailableItemIds(Object.fromEntries(rawByRiotId)).map((r) => r.riotId)
  )
  const manualSettings = await db.select().from(schema.itemManualSettings)
  const manualByRiotId = new Map(manualSettings.map((m) => [m.riotId, m.isAvailable]))

  // 承認済み変更（patch_status用）
  const approvedChanges = await db
    .select({ riotId: schema.itemChanges.riotId, changeType: schema.itemChanges.changeType })
    .from(schema.itemChanges)
    .where(
      and(
        eq(schema.itemChanges.patchVersion, patch),
        eq(schema.itemChanges.reviewStatus, 'approved')
      )
    )
  const changeTypeByRiotId = new Map(approvedChanges.map((c) => [c.riotId, c.changeType]))

  // 追加タグ
  const additionalTags = await db.select().from(schema.additionalTags)
  const additionalTagsByRiotId = new Map<string, string[]>()
  for (const t of additionalTags) {
    additionalTagsByRiotId.set(t.riotId, [
      ...(additionalTagsByRiotId.get(t.riotId) ?? []),
      t.tag,
    ])
  }

  // ロール分類
  const roleRows = await db.select().from(schema.roleCategories)
  const rolesByRiotId = new Map<string, string[]>()
  for (const r of roleRows) {
    rolesByRiotId.set(r.riotId, [...(rolesByRiotId.get(r.riotId) ?? []), r.role])
  }

  let upserted = 0
  for (const [riotId, state] of stateByRiotId) {
    const isAvailable = manualByRiotId.get(riotId) ?? !autoExcluded.has(riotId)
    const searchTags = [
      ...new Set([...state.tags, ...(additionalTagsByRiotId.get(riotId) ?? [])]),
    ].sort()
    const abilityStats: AbilityNumericParam[] = state.abilities.flatMap((a) =>
      Object.values(a.params)
    )

    const values = {
      riotId,
      nameJa: state.nameJa,
      isAvailable,
      abilities: state.abilities,
      plaintextJa: state.plaintextJa,
      priceTotal: state.priceTotal,
      priceSell: state.priceSell,
      imagePath: `${riotId}.webp`,
      patchStatus: changeTypeByRiotId.get(riotId) ?? null,
      searchTags,
      roleCategories: rolesByRiotId.get(riotId) ?? [],
      maps: state.maps,
      basicStats: state.basicStats,
      abilityStats,
      buildFrom: state.buildFrom,
      buildInto: state.buildInto,
      updatedPatch: patch,
    }
    await db
      .insert(schema.items)
      .values(values)
      .onConflictDoUpdate({
        target: schema.items.riotId,
        set: { ...values, updatedAt: new Date() },
      })
    upserted++
  }

  // このパッチに存在しないアイテムは非公開化（手動データ保持のため行は残す）
  const removed = await db
    .update(schema.items)
    .set({ isAvailable: false, updatedAt: new Date() })
    .where(
      sql`${schema.items.riotId} NOT IN (SELECT riot_id FROM ddragon_snapshots WHERE patch_version = ${baseMajor[0].version})`
    )
    .returning({ riotId: schema.items.riotId })

  // パッチ状態の更新＋既存バナー互換（patch_versions）
  await db
    .update(schema.patches)
    .set({ status: 'published', updatedAt: new Date() })
    .where(eq(schema.patches.version, patch))

  const ddragonVersion = patchRow.ddragonVersion ?? baseMajor[0].ddragonVersion
  if (ddragonVersion) {
    await db.delete(schema.patchVersions)
    await db.insert(schema.patchVersions).values({
      currentPatch: ddragonVersion,
      lastCheckedAt: new Date(),
    })
  }

  console.log(`✅ publish 完了: items ${upserted} 件 upsert / 非公開化 ${removed.length} 件`)
}
