/**
 * 説明文ブロック → ItemAbilityState[]
 *
 * key の安定化が最重要:
 * - 前パッチに同名（または同key）のアビリティがあれば key・params・
 *   キュレーション済み descriptionJa を継承する
 * - sourceText はパッチごとの生テキストで常に上書きする（diff対象）
 * - descriptionJa が未キュレーション（= 前パッチの sourceText と同一）なら
 *   新しい sourceText に追従させる
 */

import type { ItemAbilityState } from '../../types/domain/itemState'
import type { DescriptionBlock } from './parseDescription'

/** アビリティ名から安定キーを生成（NFKC正規化＋空白除去） */
export function normalizeAbilityKey(nameJa: string): string {
  return nameJa.normalize('NFKC').replace(/[\s・]+/g, '')
}

export function extractAbilities(
  blocks: DescriptionBlock[],
  prevAbilities: ItemAbilityState[] | null
): ItemAbilityState[] {
  return blocks.map((block) => {
    const key = normalizeAbilityKey(block.nameJa)
    const prev =
      prevAbilities?.find((p) => p.nameJa === block.nameJa) ??
      prevAbilities?.find((p) => p.key === key) ??
      null

    if (!prev) {
      return {
        key,
        kind: block.kind,
        nameJa: block.nameJa,
        sourceText: block.bodyText,
        descriptionJa: block.bodyText,
        params: {},
      }
    }

    const isCurated = prev.descriptionJa !== prev.sourceText
    return {
      ...prev,
      kind: block.kind,
      nameJa: block.nameJa,
      sourceText: block.bodyText,
      descriptionJa: isCurated ? prev.descriptionJa : block.bodyText,
    }
  })
}
