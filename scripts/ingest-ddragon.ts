/**
 * DDragon取り込みCLI
 * 使い方: npm run pipeline:ingest -- --patch 26.13 [--ddragon-version 16.13.1] [--skip-images] [--force-images]
 */

import { createDb } from './lib/db'
import { getArgs, requireArg } from './lib/args'
import { runIngest } from './stages/ingest'

const args = getArgs({
  patch: { type: 'string' },
  'ddragon-version': { type: 'string' },
  'skip-images': { type: 'boolean', default: false },
  'force-images': { type: 'boolean', default: false },
})

const { db, pool } = createDb()
try {
  await runIngest(db, {
    patch: requireArg(args.patch, 'patch'),
    ddragonVersion: args['ddragon-version'],
    skipImages: args['skip-images'],
    forceImages: args['force-images'],
  })
} finally {
  await pool.end()
}
