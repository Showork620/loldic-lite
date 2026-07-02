/**
 * パッチノート解析CLI
 * 使い方: npm run pipeline:extract -- --patch 26.13 [--rerun]
 */

import { createDb } from './lib/db'
import { getArgs, requireArg } from './lib/args'
import { runExtract } from './stages/extract'

const args = getArgs({
  patch: { type: 'string' },
  rerun: { type: 'boolean', default: false },
})

const { db, pool } = createDb()
try {
  await runExtract(db, {
    patch: requireArg(args.patch, 'patch'),
    rerun: args.rerun,
  })
} finally {
  await pool.end()
}
