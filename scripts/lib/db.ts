/**
 * scripts/ 用のDB接続（Drizzle runtime + pg）
 *
 * DATABASE_URL でSupabase Postgresに直結する（RLSの対象外）。
 * ブラウザ側の supabase-js（anonキー）とは別経路。
 */

import 'dotenv/config'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../../src/db/schema'

export type Db = ReturnType<typeof drizzle<typeof schema>>

export function createDb(): { db: Db; pool: Pool } {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL が設定されていません（.env を確認してください）')
  }
  const pool = new Pool({ connectionString: url, max: 5 })
  const db = drizzle(pool, { schema })
  return { db, pool }
}

export { schema }
