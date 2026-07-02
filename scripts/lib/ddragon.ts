/**
 * DDragon取得（Node用）
 */

import type { RiotAPIResponse } from '../../src/types/domain/item'

const BASE = 'https://ddragon.leagueoflegends.com'

export async function fetchVersions(): Promise<string[]> {
  const res = await fetch(`${BASE}/api/versions.json`)
  if (!res.ok) throw new Error(`versions.json の取得に失敗: ${res.status}`)
  return (await res.json()) as string[]
}

export async function fetchItemJson(ddragonVersion: string): Promise<RiotAPIResponse> {
  const res = await fetch(`${BASE}/cdn/${ddragonVersion}/data/ja_JP/item.json`)
  if (!res.ok) {
    throw new Error(`item.json(${ddragonVersion}) の取得に失敗: ${res.status}`)
  }
  return (await res.json()) as RiotAPIResponse
}

export async function fetchItemImage(
  ddragonVersion: string,
  riotId: string
): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE}/cdn/${ddragonVersion}/img/item/${riotId}.png`)
  if (!res.ok) {
    throw new Error(`画像(${riotId}.png) の取得に失敗: ${res.status}`)
  }
  return res.arrayBuffer()
}
