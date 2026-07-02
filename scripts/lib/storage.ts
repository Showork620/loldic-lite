/**
 * Supabase Storage への画像アップロード（Node用）
 *
 * ブラウザ版（Canvas）と同じ命名（{riotId}.webp）・同じバケットに
 * sharp で 64x64 WebP を生成してアップロードする。
 */

import 'dotenv/config'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const BUCKET = 'item-images'

export function createStorageClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が設定されていません（.env を確認してください）'
    )
  }
  return createClient(url, key)
}

export async function uploadItemImage(
  client: SupabaseClient,
  riotId: string,
  png: ArrayBuffer
): Promise<void> {
  const webp = await sharp(Buffer.from(png))
    .resize(64, 64)
    .webp({ quality: 90 })
    .toBuffer()

  const { error } = await client.storage
    .from(BUCKET)
    .upload(`${riotId}.webp`, webp, {
      contentType: 'image/webp',
      cacheControl: '604800',
      upsert: true,
    })
  if (error) throw new Error(`画像アップロード失敗 (${riotId}): ${error.message}`)
}
