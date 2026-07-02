/**
 * パッチノート記載のアイテム名 → riot_id の解決
 *
 * 同一パッチのDDragonスナップショットから名前索引を作り、
 * 完全一致 > 正規化一致 > 部分一致（一意のときのみ）の順で解決する。
 * 同名複数ID（アリーナ複製等）は「4桁ID かつ サモナーズリフト(11)対応」を優先。
 */

import type { NameMatchResult } from '../../types/domain/patchnote'

export interface NameIndexEntry {
  riotId: string
  nameJa: string
  maps: number[]
}

export interface NameIndex {
  byExact: Map<string, NameIndexEntry[]>
  byNormalized: Map<string, NameIndexEntry[]>
  entries: NameIndexEntry[]
}

export function normalizeName(name: string): string {
  return name
    .normalize('NFKC')
    .replace(/[\s・]+/g, '')
    .toLowerCase()
}

function pickPreferred(candidates: NameIndexEntry[]): NameIndexEntry {
  const score = (e: NameIndexEntry) =>
    (e.riotId.length === 4 ? 2 : 0) + (e.maps.includes(11) ? 1 : 0)
  return [...candidates].sort(
    (a, b) => score(b) - score(a) || a.riotId.localeCompare(b.riotId)
  )[0]
}

export function buildNameIndex(items: NameIndexEntry[]): NameIndex {
  const byExact = new Map<string, NameIndexEntry[]>()
  const byNormalized = new Map<string, NameIndexEntry[]>()
  for (const item of items) {
    if (!item.nameJa) continue
    const exactKey = item.nameJa.trim()
    byExact.set(exactKey, [...(byExact.get(exactKey) ?? []), item])
    const normKey = normalizeName(item.nameJa)
    byNormalized.set(normKey, [...(byNormalized.get(normKey) ?? []), item])
  }
  return { byExact, byNormalized, entries: items }
}

export function matchItemName(name: string, index: NameIndex): NameMatchResult {
  const trimmed = name.trim()

  const exact = index.byExact.get(trimmed)
  if (exact?.length) return { riotId: pickPreferred(exact).riotId, matched: 'exact' }

  const norm = normalizeName(trimmed)
  const normalized = index.byNormalized.get(norm)
  if (normalized?.length) {
    return { riotId: pickPreferred(normalized).riotId, matched: 'normalized' }
  }

  // 部分一致: 候補riot_idが一意に定まる場合のみ採用
  if (norm.length >= 3) {
    const partial = index.entries.filter((e) => {
      const en = normalizeName(e.nameJa)
      return en.includes(norm) || norm.includes(en)
    })
    const uniqueIds = new Set(partial.map((e) => normalizeName(e.nameJa)))
    if (partial.length > 0 && uniqueIds.size === 1) {
      return { riotId: pickPreferred(partial).riotId, matched: 'partial' }
    }
  }

  return { riotId: null, matched: 'none' }
}
