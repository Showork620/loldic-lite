/**
 * ChangeEntry[] → 変更種別（buff/nerf/adjusted/rework/new/removed）の自動分類
 *
 * あくまで提案値。最終判断はレビューUIで人間が行う。
 */

import type { ChangeEntry, ChangeType } from '../../types/domain/itemChange'

/** アビリティの追加・削除（構造変化）を表すtargetか */
const ABILITY_STRUCTURAL = /^abilities\.[^.]+$/

export function classifyChangeType(entries: ChangeEntry[]): ChangeType {
  if (entries.some((e) => e.target === 'item' && e.before === null)) return 'new'
  if (entries.some((e) => e.target === 'item' && e.after === null)) return 'removed'

  if (entries.some((e) => ABILITY_STRUCTURAL.test(e.target))) return 'rework'

  const ups = entries.filter((e) => e.direction === 'up').length
  const downs = entries.filter((e) => e.direction === 'down').length
  if (ups > 0 && downs === 0) return 'buff'
  if (downs > 0 && ups === 0) return 'nerf'
  return 'adjusted'
}
