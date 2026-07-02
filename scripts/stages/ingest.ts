/**
 * Stage 1: DDragon取り込み
 *
 * patches 行を upsert し、item.json(ja_JP) の全アイテムを
 * ddragon_snapshots に保存（前パッチとraw同一ならスキップ）、
 * 新規アイテムの画像を Storage にアップロードする。
 */

import { eq, lt, desc, and, inArray } from 'drizzle-orm'
import type { Db } from '../lib/db'
import { schema } from '../lib/db'
import { fetchVersions, fetchItemJson, fetchItemImage } from '../lib/ddragon'
import { createStorageClient, uploadItemImage } from '../lib/storage'
import { toSortKey, resolveDdragonVersion, isHotfixVersion } from '../lib/patchVersion'

const IMAGE_CONCURRENCY = 5

export interface IngestOptions {
  patch: string
  ddragonVersion?: string
  skipImages?: boolean
  /** 既存アイテムの画像も再アップロードする */
  forceImages?: boolean
}

export async function runIngest(db: Db, opts: IngestOptions): Promise<void> {
  const { patch } = opts
  if (isHotfixVersion(patch)) {
    throw new Error(
      `hotfixパッチ（${patch}）はDDragonに存在しません。fetch-patchnote --hotfix で登録してください`
    )
  }

  const ddragonVersion =
    opts.ddragonVersion ?? resolveDdragonVersion(patch, await fetchVersions())
  console.log(`📥 ingest: patch=${patch} ddragon=${ddragonVersion}`)

  // patches 行を upsert
  await db
    .insert(schema.patches)
    .values({
      version: patch,
      kind: 'major',
      ddragonVersion,
      status: 'ingested',
      sortKey: toSortKey(patch),
    })
    .onConflictDoUpdate({
      target: schema.patches.version,
      set: { ddragonVersion, status: 'ingested', updatedAt: new Date() },
    })

  // 直前のmajorパッチ（画像アップロード対象の判定用）
  const prevPatch = await db
    .select({ version: schema.patches.version })
    .from(schema.patches)
    .where(
      and(
        lt(schema.patches.sortKey, toSortKey(patch)),
        eq(schema.patches.kind, 'major')
      )
    )
    .orderBy(desc(schema.patches.sortKey))
    .limit(1)

  // 既存snapshot（このパッチ）を確認して冪等に
  const existing = await db
    .select({ riotId: schema.ddragonSnapshots.riotId })
    .from(schema.ddragonSnapshots)
    .where(eq(schema.ddragonSnapshots.patchVersion, patch))
  const existingIds = new Set(existing.map((r) => r.riotId))

  const itemJson = await fetchItemJson(ddragonVersion)
  const entries = Object.entries(itemJson.data)
  console.log(`   アイテム数: ${entries.length}`)

  // Layer 0 は「パッチごとに全アイテム」を完全に持つ
  // （1パッチ約2MB。スプライト座標が毎パッチ変わるためdedupの効果は薄く、
  //   completeness を優先する）
  const rows = entries
    .filter(([riotId]) => !existingIds.has(riotId))
    .map(([riotId, raw]) => ({ patchVersion: patch, riotId, raw }))
  let inserted = 0
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500)
    await db.insert(schema.ddragonSnapshots).values(chunk).onConflictDoNothing()
    inserted += chunk.length
  }
  console.log(`   snapshots: +${inserted} 件（既存 ${existingIds.size} 件）`)

  // 画像アップロード（デフォルトは「過去パッチに存在しなかったアイテム」のみ）
  if (!opts.skipImages) {
    const knownIds = opts.forceImages
      ? new Set<string>()
      : new Set(
          (
            await db
              .selectDistinct({ riotId: schema.ddragonSnapshots.riotId })
              .from(schema.ddragonSnapshots)
              .where(inArray(schema.ddragonSnapshots.patchVersion,
                prevPatch.length ? [prevPatch[0].version] : []))
          ).map((r) => r.riotId)
        )
    const targets = entries.map(([id]) => id).filter((id) => !knownIds.has(id))
    if (targets.length) {
      console.log(`   画像アップロード: ${targets.length} 件`)
      const storage = createStorageClient()
      let done = 0
      for (let i = 0; i < targets.length; i += IMAGE_CONCURRENCY) {
        const chunk = targets.slice(i, i + IMAGE_CONCURRENCY)
        await Promise.all(
          chunk.map(async (riotId) => {
            try {
              const png = await fetchItemImage(ddragonVersion, riotId)
              await uploadItemImage(storage, riotId, png)
              done++
            } catch (e) {
              console.warn(`   ⚠️ 画像スキップ (${riotId}): ${e instanceof Error ? e.message : e}`)
            }
          })
        )
      }
      console.log(`   画像完了: ${done}/${targets.length}`)
    } else {
      console.log('   画像: 新規なし')
    }
  }

  console.log(`✅ ingest 完了: ${patch}`)
}
