/**
 * パッチノート抽出結果の信頼度スコアリング（0.0–1.0）
 *
 * - 名前解決の一致度: exact 0.5 / normalized 0.4 / partial 0.25 / none 0.1
 * - ⇒（before有り）行の比率 × 0.4
 * - セクション見出し検出成功（非フォールバック）: +0.1
 *
 * 0.75 以上を自動提案に採用し、未満はレビューUIで警告表示する想定。
 */

import type { NameMatchKind, ParsedChange } from '../../types/domain/patchnote'

export const CONFIDENCE_THRESHOLD = 0.75

const MATCH_SCORE: Record<NameMatchKind, number> = {
  exact: 0.5,
  normalized: 0.4,
  partial: 0.25,
  none: 0.1,
}

export function scoreExtract(
  matched: NameMatchKind,
  changeLines: ParsedChange[],
  viaFallback: boolean
): number {
  const base = MATCH_SCORE[matched]
  const arrowRate = changeLines.length
    ? changeLines.filter((l) => l.before !== null).length / changeLines.length
    : 0
  const sectionBonus = viaFallback ? 0 : 0.1
  return Math.min(1, Math.round((base + arrowRate * 0.4 + sectionBonus) * 100) / 100)
}
