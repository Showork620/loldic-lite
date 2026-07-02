/**
 * バックフィルCLI: 指定範囲のmajorパッチを順に ingest → fetch-note → extract → propose
 *
 * 使い方:
 *   npm run pipeline:backfill -- --from 26.1 --to 26.13 --notes-manifest scripts/notes.json
 *
 * - パッチノートURLはマニフェストJSON（version → URL）で渡す。
 *   エントリの無いパッチはノート無しで進む（DDragonのdiffのみ提案される）
 * - publish は含まない（レビュー後に手動で実行する）
 */

import fs from 'node:fs'
import { createDb } from './lib/db'
import { getArgs, requireArg } from './lib/args'
import { parsePatchVersion } from './lib/patchVersion'
import { runIngest } from './stages/ingest'
import { runFetchPatchnote } from './stages/fetchPatchnote'
import { runExtract } from './stages/extract'
import { runPropose } from './stages/propose'

const args = getArgs({
  from: { type: 'string' },
  to: { type: 'string' },
  'notes-manifest': { type: 'string' },
  'skip-images': { type: 'boolean', default: false },
})

const from = parsePatchVersion(requireArg(args.from, 'from'))
const to = parsePatchVersion(requireArg(args.to, 'to'))
if (from.major !== to.major) {
  throw new Error('--from と --to は同一メジャーバージョンにしてください（例: 26.1〜26.13）')
}
if (from.hotfix || to.hotfix) {
  throw new Error('backfillはmajorパッチのみ対象です（hotfixは個別にfetch-noteで登録）')
}

const notesManifest: Record<string, string> = args['notes-manifest']
  ? JSON.parse(fs.readFileSync(args['notes-manifest'], 'utf8'))
  : {}

const { db, pool } = createDb()
try {
  for (let minor = from.minor; minor <= to.minor; minor++) {
    const patch = `${from.major}.${minor}`
    console.log(`\n===== ${patch} =====`)
    await runIngest(db, { patch, skipImages: args['skip-images'] })

    const url = notesManifest[patch]
    if (url) {
      await runFetchPatchnote(db, { patch, url })
      await runExtract(db, { patch })
    } else {
      console.log(`   （パッチノートURL未登録のためnote取得をスキップ）`)
    }

    await runPropose(db, { patch })
  }
  console.log('\n✅ backfill 完了')
} finally {
  await pool.end()
}
