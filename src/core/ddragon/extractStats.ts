/**
 * stats行 → BasicStats 変換
 *
 * 旧 autoStatsExtractor の後継。整数のみ対応だったバグを修正し、
 * 小数・％表記（"25%" → 25）に対応する。％はステータス種別が本来
 * ％系（攻撃速度など）であることが自明なため数値のみ保持する。
 */

import type { BasicStats, ChampionStat } from '../../types/domain/stats'
import { ALL_STATS } from '../../types/domain/stats'
import type { StatLine } from './parseDescription'

function matchStat(label: string): ChampionStat | null {
  const trimmed = label.trim()
  // 完全一致を優先し、次に「基本マナ自動回復」のような長いキーワードから
  // 部分一致を試す（「マナ自動回復」が「マナ」に誤マッチしないよう長い順）
  const exact = ALL_STATS.find((s) => s === trimmed)
  if (exact) return exact
  const byLength = [...ALL_STATS].sort((a, b) => b.length - a.length)
  return byLength.find((s) => trimmed.includes(s)) ?? null
}

function parseStatValue(valueText: string): number | null {
  const m = valueText.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)
  return m ? Number(m[0]) : null
}

export function extractStats(statLines: StatLine[]): BasicStats {
  const stats: BasicStats = {}
  for (const line of statLines) {
    const stat = matchStat(line.label)
    const value = parseStatValue(line.valueText)
    if (stat && value !== null) stats[stat] = value
  }
  return stats
}
