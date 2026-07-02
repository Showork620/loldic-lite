/**
 * パッチノートの変更行ラベル → ItemStateData の field path 解決
 *
 * 自動で紐付けるのは確実に対応が取れるものだけ:
 * - ChampionStat と完全一致（または既知の同義語） → basicStats.*
 * - コスト/価格系 → priceTotal
 * それ以外（アビリティ効果値など）は null を返し、
 * proposeChanges が "unmapped.<ラベル>" として提案に残す。
 */

import { isValidStat } from '../../types/domain/stats'

/** ノート表記 → ChampionStat の同義語 */
const LABEL_ALIASES: Record<string, string> = {
  AD: '攻撃力',
  AP: '魔力',
  体力自動回復: '基本体力自動回復',
  マナ自動回復: '基本マナ自動回復',
}

const PRICE_TOTAL_PATTERN = /^(合計)?(コスト|価格|値段)$/
const PRICE_SELL_PATTERN = /^売却(額|価格)?$/

export function mapLabelToTarget(label: string): string | null {
  const trimmed = label.trim()
  if (!trimmed) return null
  const aliased = LABEL_ALIASES[trimmed] ?? trimmed
  if (isValidStat(aliased)) return `basicStats.${aliased}`
  if (PRICE_TOTAL_PATTERN.test(trimmed)) return 'priceTotal'
  if (PRICE_SELL_PATTERN.test(trimmed)) return 'priceSell'
  return null
}
