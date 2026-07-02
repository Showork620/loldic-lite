/**
 * 状態構築＋変更提案CLI
 * 使い方: npm run pipeline:propose -- --patch 26.13 [--force]
 */

import { createDb } from './lib/db'
import { getArgs, requireArg } from './lib/args'
import { runPropose } from './stages/propose'

const args = getArgs({
  patch: { type: 'string' },
  force: { type: 'boolean', default: false },
})

const { db, pool } = createDb()
try {
  await runPropose(db, {
    patch: requireArg(args.patch, 'patch'),
    force: args.force,
  })
} finally {
  await pool.end()
}
