/**
 * Stage 3: パッチノート解析 → patchnote_extracts
 *
 * raw HTML（Layer 0）から src/core のパーサーで抽出する。
 * パーサー修正後は --rerun で全再抽出できる（rawから再構築可能の実証）。
 *
 * 名前解決の索引は「このパッチ（hotfixなら直前のmajor）」のsnapshotから作る。
 * hotfixで同一URLの追記型パッチノートの場合、ベースパッチと同一quotedTextの
 * セクションは除外して差分のみ採用する。
 */

import { eq, lte, desc, and } from 'drizzle-orm'
import type { Db } from '../lib/db'
import { schema } from '../lib/db'
import { parsePatchnoteDocument } from '../../src/core/patchnote/parsePatchnoteHtml'
import { buildNameIndex, matchItemName } from '../../src/core/patchnote/matchItemName'
import { scoreExtract } from '../../src/core/patchnote/confidence'
import type { RawRiotItemData } from '../../src/types/domain/item'
import { toSortKey } from '../lib/patchVersion'

export interface ExtractOptions {
  patch: string
  rerun?: boolean
}

async function loadNameIndexSource(db: Db, patch: string) {
  // このパッチ以前で最も新しいmajorパッチのsnapshot群
  const base = await db
    .select({ version: schema.patches.version })
    .from(schema.patches)
    .where(
      and(
        lte(schema.patches.sortKey, toSortKey(patch)),
        eq(schema.patches.kind, 'major')
      )
    )
    .orderBy(desc(schema.patches.sortKey))
    .limit(1)
  if (!base.length) {
    throw new Error(`パッチ ${patch} 以前のmajorパッチのsnapshotがありません`)
  }
  const snapshots = await db
    .select({
      riotId: schema.ddragonSnapshots.riotId,
      raw: schema.ddragonSnapshots.raw,
    })
    .from(schema.ddragonSnapshots)
    .where(eq(schema.ddragonSnapshots.patchVersion, base[0].version))
  return snapshots.map((s) => {
    const raw = s.raw as RawRiotItemData
    return {
      riotId: s.riotId,
      nameJa: raw.name ?? '',
      maps: Object.entries(raw.maps ?? {})
        .filter(([, enabled]) => enabled)
        .map(([mapId]) => Number(mapId)),
    }
  })
}

export async function runExtract(db: Db, opts: ExtractOptions): Promise<void> {
  const { patch } = opts
  console.log(`🔍 extract: patch=${patch}`)

  const documents = await db
    .select()
    .from(schema.patchnoteDocuments)
    .where(eq(schema.patchnoteDocuments.patchVersion, patch))
  if (!documents.length) {
    throw new Error(`パッチ ${patch} のpatchnote_documentsがありません。先にfetch-noteを実行してください`)
  }

  const existing = await db
    .select({ id: schema.patchnoteExtracts.id })
    .from(schema.patchnoteExtracts)
    .where(eq(schema.patchnoteExtracts.patchVersion, patch))
  if (existing.length) {
    if (!opts.rerun) {
      console.log(`   既に ${existing.length} 件の抽出があります。再抽出は --rerun を指定してください`)
      return
    }
    await db
      .delete(schema.patchnoteExtracts)
      .where(eq(schema.patchnoteExtracts.patchVersion, patch))
    console.log(`   既存 ${existing.length} 件を削除して再抽出`)
  }

  const index = buildNameIndex(await loadNameIndexSource(db, patch))

  // hotfix: ベースmajorパッチの既存extractと同一quotedTextは除外（追記型ノート対策）
  const patchRow = await db
    .select()
    .from(schema.patches)
    .where(eq(schema.patches.version, patch))
  const isHotfix = patchRow[0]?.kind === 'hotfix'
  const baseQuotes = new Set<string>()
  if (isHotfix) {
    const basePatch = patch.replace(/[a-z]$/, '')
    const baseExtracts = await db
      .select({ quotedText: schema.patchnoteExtracts.quotedText })
      .from(schema.patchnoteExtracts)
      .where(eq(schema.patchnoteExtracts.patchVersion, basePatch))
    for (const e of baseExtracts) baseQuotes.add(e.quotedText)
  }

  let total = 0
  for (const doc of documents) {
    const sections = parsePatchnoteDocument(doc.rawHtml).filter(
      (s) => !baseQuotes.has(s.quotedText)
    )
    console.log(`   ${doc.url}: ${sections.length} アイテムセクション`)
    if (!sections.length) continue

    const rows = sections.map((s) => {
      const match = matchItemName(s.itemName, index)
      const confidence = scoreExtract(match.matched, s.changeLines, s.viaFallback)
      if (!match.riotId) {
        console.warn(`   ⚠️ 名前解決失敗: "${s.itemName}"（レビューUIで手動紐付け）`)
      }
      return {
        documentId: doc.id,
        patchVersion: patch,
        riotId: match.riotId,
        itemName: s.itemName,
        quotedText: s.quotedText,
        parsedChanges: s.changeLines,
        confidence,
      }
    })
    await db.insert(schema.patchnoteExtracts).values(rows)
    total += rows.length
  }

  console.log(`✅ extract 完了: ${patch}（${total} 件）`)
}
