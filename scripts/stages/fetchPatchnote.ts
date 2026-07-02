/**
 * Stage 2: パッチノート生HTMLの取得・保存
 *
 * URLはスラッグが不統一（patch-26-2-notes / league-of-legends-patch-26-10-notes 等）
 * のため自動推測せず、人間が registered URL を渡す。
 * hotfix の場合は --hotfix で patches 行（kind='hotfix'）も作成する。
 */

import { eq } from 'drizzle-orm'
import type { Db } from '../lib/db'
import { schema } from '../lib/db'
import { toSortKey, isHotfixVersion } from '../lib/patchVersion'

export interface FetchPatchnoteOptions {
  patch: string
  url: string
  hotfix?: boolean
}

export async function runFetchPatchnote(db: Db, opts: FetchPatchnoteOptions): Promise<void> {
  const { patch, url } = opts
  const hotfix = opts.hotfix ?? isHotfixVersion(patch)
  console.log(`📰 fetch-patchnote: patch=${patch} ${hotfix ? '(hotfix)' : ''}`)

  const existing = await db
    .select({ version: schema.patches.version })
    .from(schema.patches)
    .where(eq(schema.patches.version, patch))

  if (!existing.length) {
    if (!hotfix) {
      throw new Error(
        `パッチ ${patch} が未登録です。先に pipeline:ingest -- --patch ${patch} を実行してください`
      )
    }
    await db.insert(schema.patches).values({
      version: patch,
      kind: 'hotfix',
      ddragonVersion: null,
      patchnoteUrl: url,
      status: 'draft',
      sortKey: toSortKey(patch),
    })
    console.log(`   patches に hotfix 行を作成: ${patch}`)
  }

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (loldic-lite ingest)' },
  })
  if (!res.ok) throw new Error(`パッチノート取得失敗: ${res.status} ${url}`)
  const rawHtml = await res.text()
  console.log(`   取得: ${(rawHtml.length / 1024).toFixed(0)} KB`)

  await db
    .insert(schema.patchnoteDocuments)
    .values({ patchVersion: patch, url, rawHtml })
    .onConflictDoUpdate({
      target: [schema.patchnoteDocuments.patchVersion, schema.patchnoteDocuments.url],
      set: { rawHtml, fetchedAt: new Date() },
    })

  await db
    .update(schema.patches)
    .set({ patchnoteUrl: url, updatedAt: new Date() })
    .where(eq(schema.patches.version, patch))

  console.log(`✅ fetch-patchnote 完了: ${patch}`)
}
