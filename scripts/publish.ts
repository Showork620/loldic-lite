/**
 * 公開CLI（items テーブルへの materialize）
 * 使い方: npm run pipeline:publish -- --patch 26.13
 */

import { createDb } from './lib/db'
import { getArgs, requireArg } from './lib/args'
import { runPublish } from './stages/publish'

const args = getArgs({
  patch: { type: 'string' },
})

const { db, pool } = createDb()
try {
  await runPublish(db, { patch: requireArg(args.patch, 'patch') })
} finally {
  await pool.end()
}
