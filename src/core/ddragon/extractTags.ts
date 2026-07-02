/**
 * DDragon生データ → 翻訳済み検索タグ
 *
 * 旧 autoTagExtractor と同じ2ソース方式:
 * 1. raw.tags[] の英語タグを TAGS_TRANSLATE で日本語化
 * 2. 説明文に日本語タグ名が含まれていれば追加
 */

import { TAGS_TRANSLATE } from '../../constants/riotApi'
import type { RawRiotItemData } from '../../types/domain/item'

export function extractTags(raw: RawRiotItemData): string[] {
  const tags = new Set<string>()
  for (const tag of raw.tags ?? []) {
    const translated = TAGS_TRANSLATE[tag]
    if (translated) tags.add(translated)
  }
  const description = raw.description ?? ''
  for (const translated of Object.values(TAGS_TRANSLATE)) {
    if (description.includes(translated)) tags.add(translated)
  }
  return [...tags].sort()
}
