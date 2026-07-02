/**
 * 正規状態同士のフィールド単位diff
 *
 * canonical な ItemStateData 同士を比較するため、DDragon rawの
 * スプライト座標ノイズ（毎パッチ約9割のアイテムで変化）の影響を受けない。
 */

import type { ItemStateData, ItemAbilityState } from '../../types/domain/itemState'
import type { ChangeEntry } from '../../types/domain/itemChange'
import type { AbilityNumericParam } from '../../types/domain/abilityStats'
import { numericDirection } from './statPolarity'

function entry(
  target: string,
  targetLabel: string,
  before: unknown | null,
  after: unknown | null,
  direction: ChangeEntry['direction'] = 'neutral'
): ChangeEntry {
  return { target, targetLabel, before, after, direction, source: 'ddragon_diff', confidence: 1 }
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function sameSet(a: readonly unknown[], b: readonly unknown[]): boolean {
  return sameJson([...a].sort(), [...b].sort())
}

/** flat×both のパラメータ同士なら数値方向を出す */
function paramDirection(
  target: string,
  before: AbilityNumericParam | undefined,
  after: AbilityNumericParam | undefined
): ChangeEntry['direction'] {
  const flatValue = (p?: AbilityNumericParam): number | null => {
    if (!p || p.scaling.appliesTo !== 'both') return null
    const values = p.scaling.value
    if (values.length !== 1 || values[0].type !== 'flat') return null
    return values[0].value
  }
  return numericDirection(target, flatValue(before), flatValue(after))
}

function diffAbilities(
  before: ItemAbilityState[],
  after: ItemAbilityState[]
): ChangeEntry[] {
  const entries: ChangeEntry[] = []
  const beforeByKey = new Map(before.map((a) => [a.key, a]))
  const afterByKey = new Map(after.map((a) => [a.key, a]))

  for (const a of after) {
    if (!beforeByKey.has(a.key)) {
      entries.push(entry(`abilities.${a.key}`, `新アビリティ: ${a.nameJa}`, null, a.nameJa))
    }
  }
  for (const b of before) {
    if (!afterByKey.has(b.key)) {
      entries.push(entry(`abilities.${b.key}`, `アビリティ削除: ${b.nameJa}`, b.nameJa, null))
    }
  }

  for (const b of before) {
    const a = afterByKey.get(b.key)
    if (!a) continue
    if (b.sourceText !== a.sourceText) {
      entries.push(
        entry(`abilities.${b.key}.sourceText`, `${a.nameJa}（効果文）`, b.sourceText, a.sourceText)
      )
    }
    if (b.cooldown !== a.cooldown) {
      const target = `abilities.${b.key}.cooldown`
      entries.push(
        entry(target, `${a.nameJa}のクールダウン`, b.cooldown ?? null, a.cooldown ?? null,
          numericDirection(target, b.cooldown, a.cooldown))
      )
    }
    const paramKeys = new Set([...Object.keys(b.params), ...Object.keys(a.params)])
    for (const key of paramKeys) {
      const bp = b.params[key]
      const ap = a.params[key]
      if (sameJson(bp, ap)) continue
      const target = `abilities.${b.key}.params.${key}`
      entries.push(
        entry(target, `${a.nameJa}の${ap?.label ?? bp?.label ?? key}`, bp ?? null, ap ?? null,
          paramDirection(target, bp, ap))
      )
    }
  }
  return entries
}

export function diffStates(
  before: ItemStateData | null,
  after: ItemStateData | null
): ChangeEntry[] {
  if (!before && !after) return []
  if (!before && after) {
    return [entry('item', '新規アイテム', null, after.nameJa)]
  }
  if (before && !after) {
    return [entry('item', 'アイテム削除', before.nameJa, null)]
  }
  if (!before || !after) return []

  const entries: ChangeEntry[] = []

  if (before.nameJa !== after.nameJa) {
    entries.push(entry('nameJa', '名前', before.nameJa, after.nameJa))
  }
  if (before.plaintextJa !== after.plaintextJa) {
    entries.push(entry('plaintextJa', '短文説明', before.plaintextJa, after.plaintextJa))
  }
  if (before.priceTotal !== after.priceTotal) {
    entries.push(
      entry('priceTotal', '合計価格', before.priceTotal, after.priceTotal,
        numericDirection('priceTotal', before.priceTotal, after.priceTotal))
    )
  }
  if (before.priceSell !== after.priceSell) {
    entries.push(entry('priceSell', '売却価格', before.priceSell, after.priceSell))
  }
  if (!sameSet(before.buildFrom, after.buildFrom)) {
    entries.push(entry('buildFrom', 'レシピ素材', before.buildFrom, after.buildFrom))
  }
  if (!sameSet(before.buildInto, after.buildInto)) {
    entries.push(entry('buildInto', '派生先', before.buildInto, after.buildInto))
  }
  if (!sameSet(before.maps, after.maps)) {
    entries.push(entry('maps', '対応マップ', before.maps, after.maps))
  }
  if (!sameSet(before.tags, after.tags)) {
    entries.push(entry('tags', '検索タグ', before.tags, after.tags))
  }
  if (before.availability.inStore !== after.availability.inStore) {
    entries.push(
      entry('availability.inStore', 'ストア掲載', before.availability.inStore, after.availability.inStore)
    )
  }
  if (before.availability.purchasable !== after.availability.purchasable) {
    entries.push(
      entry('availability.purchasable', '購入可否',
        before.availability.purchasable, after.availability.purchasable)
    )
  }

  const statKeys = new Set([
    ...Object.keys(before.basicStats),
    ...Object.keys(after.basicStats),
  ]) as Set<keyof typeof before.basicStats>
  for (const stat of statKeys) {
    const b = before.basicStats[stat]
    const a = after.basicStats[stat]
    if (b === a) continue
    const target = `basicStats.${String(stat)}`
    entries.push(
      entry(target, String(stat), b ?? null, a ?? null, numericDirection(target, b, a))
    )
  }

  entries.push(...diffAbilities(before.abilities, after.abilities))
  return entries
}
