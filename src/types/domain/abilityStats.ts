/**
 * アイテムのアビリティ内で使用される数値パラメータの型定義
 * 
 * このファイルは、LoLアイテムのアビリティ効果における複雑なスケーリング値を
 * モデル化するための型定義を提供します。
 * 
 * 主な特徴:
 * - 固定値、レベルスケール、ステータスレシオなど複数のスケーリングタイプ
 * - 近接/遠隔チャンピオンでの値の違いに対応
 * - 自身と対象のステータス参照に対応
 * - 複数のスケーリング要素の合算に対応
 */

import type { ChampionStat, StatSource, TargetContext } from './stats'

// ============================================================================
// 1. スケーリングの軸
// ============================================================================

/**
 * スケーリングのタイプ
 * - flat: 固定値（例：50ダメージ）
 * - level: チャンピオンレベル依存（例：レベル1で10、レベル18で100）
 * - statRatio: ステータス参照（例：ボーナス攻撃力の50%）
 * - time: 効果時間（例: 1.5秒以内に2回攻撃したら）
 */
export type ScaleType = 'flat' | 'level' | 'statRatio' | 'time'

// ============================================================================
// 2. 値の単位
// ============================================================================

/**
 * 数値の単位
 * - Flat: 固定値（例：50ダメージ）
 * - Percent: パーセント値（例：10%のダメージ）
 */
export type ValueUnit = 'Flat' | 'Percent'

// ============================================================================
// 3. スケーリング値の定義（コア）
// ============================================================================

/**
 * スケーリング値の定義
 * 
 * 使用例:
 * ```typescript
 * // 固定値: 50ダメージ
 * const flatDamage: ScalingValue = {
 *   type: 'flat',
 *   value: 50
 * }
 * 
 * // レベルスケール: レベル1で10、レベル2で15、...、レベル18で95
 * const levelScaling: ScalingValue = {
 *   type: 'level',
 *   valuesByLevel: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]
 * }
 * 
 * // ステータスレシオ: 自分のボーナス攻撃力の50%
 * const adRatio: ScalingValue = {
 *   type: 'statRatio',
 *   stat: '攻撃力',
 *   source: 'Bonus',
 *   target: 'Self',
 *   ratio: 0.5
 * }
 * 
 * // ステータスレシオ: 対象の最大体力の8%
 * const targetHpRatio: ScalingValue = {
 *   type: 'statRatio',
 *   stat: '体力',
 *   source: 'Total',
 *   target: 'Target',
 *   ratio: 0.08
 * }
 * 
 * // 効果時間: 4秒ごとに
 * const cooldown: ScalingValue = {
 *   type: 'time',
 *   time: 4
 * }
 * ```
 */
export type ScalingValue =
  | {
    type: 'flat'
    value: number
  }
  | {
    type: 'level'
    valuesByLevel: number[] // index = level - 1（レベル1 = index 0）
  }
  | {
    type: 'statRatio'
    stat: ChampionStat
    source: StatSource
    target: TargetContext
    ratio: number // 例: 0.5 = 50%
  }
  | {
    type: 'time'
    time: number // 例: 5 = 5秒
  }

// ============================================================================
// 4. 近接 / 遠隔対応ラッパー
// ============================================================================

/**
 * 近接/遠隔チャンピオンで値が異なる場合のラッパー型
 * 
 * 使用例:
 * ```typescript
 * // 近接・遠隔で同じ値
 * const sameForBoth: RangeDependent<number> = {
 *   appliesTo: 'both',
 *   value: 100
 * }
 * 
 * // 近接・遠隔で異なる値
 * const differentValues: RangeDependent<number> = {
 *   appliesTo: 'meleeRanged',
 *   melee: 150,   // 近接チャンピオンの場合
 *   ranged: 100   // 遠隔チャンピオンの場合
 * }
 * ```
 */
export type RangeDependent<T> =
  | {
    appliesTo: 'both'
    value: T
  }
  | {
    appliesTo: 'meleeRanged'
    melee: T
    ranged: T
  }

// ============================================================================
// 5. 実際の「数値パラメータ」（最終的な公開インターフェース）
// ============================================================================

/**
 * アビリティの数値パラメータ
 * 
 * アイテムのアビリティ効果における1つの数値効果を表現します。
 * 複数のスケーリング要素を合算して最終的な値を計算します。
 * 
 * 使用例:
 * ```typescript
 * // 例1: ティアマト - 近接のみ、固定値
 * const tiamatSplash: AbilityNumericParam = {
 *   label: '範囲ダメージ',
 *   unit: 'Flat',
 *   scaling: {
 *     appliesTo: 'meleeRanged',
 *     melee: [
 *       { type: 'flat', value: 40 },
 *       { type: 'statRatio', stat: '攻撃力', source: 'Total', target: 'Self', ratio: 0.4 }
 *     ],
 *     ranged: [] // 遠隔は効果なし
 *   }
 * }
 * 
 * // 例2: トリニティフォース - 近接/遠隔で異なる値
 * const trinitySpellblade: AbilityNumericParam = {
 *   label: '追加物理ダメージ',
 *   unit: 'Flat',
 *   scaling: {
 *     appliesTo: 'meleeRanged',
 *     melee: [
 *       { type: 'statRatio', stat: '攻撃力', source: 'Base', target: 'Self', ratio: 2.0 }
 *     ],
 *     ranged: [
 *       { type: 'statRatio', stat: '攻撃力', source: 'Base', target: 'Self', ratio: 1.5 }
 *     ]
 *   }
 * }
 * 
 * // 例3: デモリッシャー - 固定値 + レベルスケール
 * const demolisherDamage: AbilityNumericParam = {
 *   label: 'タワーへの追加物理ダメージ',
 *   unit: 'Flat',
 *   scaling: {
 *     appliesTo: 'both',
 *     value: [
 *       { type: 'flat', value: 100 },
 *       { 
 *         type: 'level', 
 *         valuesByLevel: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85]
 *       }
 *     ]
 *   }
 * }
 * 
 * // 例4: ブレード・オブ・ザ・ルインド・キング - 複数レシオの合算
 * const borkDamage: AbilityNumericParam = {
 *   label: '追加物理ダメージ',
 *   unit: 'Percent',
 *   scaling: {
 *     appliesTo: 'both',
 *     value: [
 *       { type: 'statRatio', stat: '体力', source: 'Current', target: 'Target', ratio: 0.10 }
 *     ]
 *   }
 * }
 * ```
 */
export interface AbilityNumericParam {
  /**
   * パラメータのラベル
   * 例: "追加ダメージ", "回復量", "移動速度増加"
   */
  label: string

  /**
   * 値の単位
   * - Flat: 固定値（例：50ダメージ）
   * - Percent: パーセント値（例：10%の追加ダメージ）
   */
  unit: ValueUnit

  /**
   * スケーリング値の配列
   * 複数の要素を合算して最終的な値を計算します
   * 
   * 例: [固定値50] + [ボーナス攻撃力の50%] + [レベルごとに5増加]
   */
  scaling: RangeDependent<ScalingValue[]>
}

// ============================================================================
// Type Guards（将来的なランタイムバリデーション用）
// ============================================================================

/**
 * ScalingValueがflat型かどうかを判定
 */
export function isFlatScaling(value: ScalingValue): value is Extract<ScalingValue, { type: 'flat' }> {
  return value.type === 'flat'
}

/**
 * ScalingValueがlevel型かどうかを判定
 */
export function isLevelScaling(value: ScalingValue): value is Extract<ScalingValue, { type: 'level' }> {
  return value.type === 'level'
}

/**
 * ScalingValueがstatRatio型かどうかを判定
 */
export function isStatRatioScaling(value: ScalingValue): value is Extract<ScalingValue, { type: 'statRatio' }> {
  return value.type === 'statRatio'
}

/**
 * ScalingValueがtime型かどうかを判定
 */
export function isTimeScaling(value: ScalingValue): value is Extract<ScalingValue, { type: 'time' }> {
  return value.type === 'time'
}

/**
 * RangeDependentがboth型かどうかを判定
 */
export function isRangeBoth<T>(value: RangeDependent<T>): value is Extract<RangeDependent<T>, { appliesTo: 'both' }> {
  return value.appliesTo === 'both'
}

/**
 * RangeDependentがmeleeRanged型かどうかを判定
 */
export function isRangeMeleeRanged<T>(value: RangeDependent<T>): value is Extract<RangeDependent<T>, { appliesTo: 'meleeRanged' }> {
  return value.appliesTo === 'meleeRanged'
}
