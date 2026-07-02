/**
 * 新パッチ検知（cron用）
 *
 * DDragonの最新バージョンをゲームパッチ名に変換し、
 * patchesテーブルに未登録なら ingest を自動実行する。
 * それ以降（パッチノート取得・レビュー・公開）は人間のトリガーに委ねる。
 */

import { eq } from 'drizzle-orm'
import { createDb, schema } from './lib/db'
import { fetchVersions } from './lib/ddragon'
import { runIngest } from './stages/ingest'

const { db, pool } = createDb()
try {
  const versions = await fetchVersions()
  const latest = versions[0] // 例 "16.13.1"
  const m = latest.match(/^(\d+)\.(\d+)\./)
  if (!m) throw new Error(`DDragonバージョンの形式が想定外です: ${latest}`)
  const gamePatch = `${Number(m[1]) + 10}.${m[2]}` // 16.13.1 → 26.13

  const existing = await db
    .select({ version: schema.patches.version })
    .from(schema.patches)
    .where(eq(schema.patches.version, gamePatch))

  if (existing.length) {
    console.log(`最新パッチ ${gamePatch}（DDragon ${latest}）は登録済み。何もしません`)
  } else {
    console.log(`🆕 新パッチ検知: ${gamePatch}（DDragon ${latest}）→ ingest実行`)
    await runIngest(db, { patch: gamePatch, ddragonVersion: latest })
    console.log('次のステップ: パッチノートURLを登録して fetch-note → extract → propose を実行してください')
  }
} finally {
  await pool.end()
}
