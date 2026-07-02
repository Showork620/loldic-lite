/**
 * パッチノート取得CLI
 * 使い方: npm run pipeline:fetch-note -- --patch 26.13 --url https://... [--hotfix]
 */

import { createDb } from './lib/db'
import { getArgs, requireArg } from './lib/args'
import { runFetchPatchnote } from './stages/fetchPatchnote'

const args = getArgs({
  patch: { type: 'string' },
  url: { type: 'string' },
  hotfix: { type: 'boolean', default: false },
})

const { db, pool } = createDb()
try {
  await runFetchPatchnote(db, {
    patch: requireArg(args.patch, 'patch'),
    url: requireArg(args.url, 'url'),
    hotfix: args.hotfix,
  })
} finally {
  await pool.end()
}
