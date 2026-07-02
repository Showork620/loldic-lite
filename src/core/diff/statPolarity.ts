/**
 * 数値変更の向き判定
 *
 * ゲームプレイ上の益（buff/nerf）に変換する。原則「増加＝up」だが、
 * クールダウン・価格など「減少が益」のフィールドは反転する。
 */

import type { ChangeDirection } from '../../types/domain/itemChange'

/** 減少がプレイヤーにとって益となるfield path判定 */
export function isInvertedTarget(target: string): boolean {
  return target === 'priceTotal' || target.endsWith('.cooldown')
}

export function numericDirection(
  target: string,
  before: unknown,
  after: unknown
): ChangeDirection {
  if (typeof before !== 'number' || typeof after !== 'number' || before === after) {
    return 'neutral'
  }
  const increased = after > before
  return increased !== isInvertedTarget(target) ? 'up' : 'down'
}
