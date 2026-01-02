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

// ============================================================================
// 1. スケーリングの軸
// ============================================================================

/**
 * スケーリングのタイプ
 * - flat: 固定値（例：50ダメージ）
 * - level: チャンピオンレベル依存（例：レベル1で10、レベル18で100）
 * - statRatio: ステータス参照（例：ボーナスADの50%）
 */
export type ScaleType = 'flat' | 'level' | 'statRatio'

// ============================================================================
// 2. ステータス種別（レシオ対象）
// ============================================================================

/**
 * チャンピオンのステータス種別
 * レシオ計算で参照できるすべてのステータスを定義
 */
export type ChampionStat =
  | 'AD' // 攻撃力
  | 'AP' // 魔力
  | 'HP' // 体力
  | 'AR' // 物理防御
  | 'MR' // 魔法防御
  | 'AS' // 攻撃速度
  | 'MS' // 移動速度
  | 'mana' // マナ
  | '脅威' // Lethality
  | 'Armor Penetration' // 物理防御貫通
  | 'Magic Penetration' // 魔法防御貫通
  | 'Base Health Regen' // 基本体力自動回復
  | 'Base Mana Regen' // 基本マナ自動回復
  | 'ability haste' // スキルヘイスト
  | 'Tenacity' // 粘り強さ
  | 'Critical Damage' // クリティカルダメージ
  | 'Critical Chance' // クリティカル率
  | 'Heal and Shield Power' // 回復・シールド強化
  | 'Gold10' // 10秒毎のゴールド
  | 'Life Steal' // ライフスティール
  | 'OmniVamp' // 全能吸血

// ============================================================================
// 3. ステータスのどの値を参照するか
// ============================================================================

/**
 * ステータスの参照元
 * - Total: 合計値（基礎値 + 増加値）
 * - Bonus: 増加値のみ（ルーンやアイテムによる増加分）
 * - Base: 基礎値のみ（チャンピオン固有の値）
 * - Current: 現在値（HPやマナの現在値）
 * - Missing: 減少値（最大値 - 現在値）
 */
export type StatSource = 'Total' | 'Bonus' | 'Base' | 'Current' | 'Missing'

// ============================================================================
// 4. 自分のスタッツか対象のスタッツか
// ============================================================================

/**
 * ステータス参照の対象
 * - Self: 自分自身のステータス
 * - Target: 対象のステータス
 */
export type TargetContext = 'Self' | 'Target'

// ============================================================================
// 5. 値の単位
// ============================================================================

/**
 * 数値の単位
 * - Flat: 固定値（例：50ダメージ）
 * - Percent: パーセント値（例：10%のダメージ）
 */
export type ValueUnit = 'Flat' | 'Percent'

// ============================================================================
// 6. スケーリング値の定義（コア）
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
 * // ステータスレシオ: 自分のボーナスADの50%
 * const adRatio: ScalingValue = {
 *   type: 'statRatio',
 *   stat: 'AD',
 *   source: 'Bonus',
 *   target: 'Self',
 *   ratio: 0.5
 * }
 * 
 * // ステータスレシオ: 対象の最大HPの8%
 * const targetHpRatio: ScalingValue = {
 *   type: 'statRatio',
 *   stat: 'HP',
 *   source: 'Total',
 *   target: 'Target',
 *   ratio: 0.08
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

// ============================================================================
// 7. 近接 / 遠隔対応ラッパー
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
// 8. 実際の「数値パラメータ」（最終的な公開インターフェース）
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
 *       { type: 'statRatio', stat: 'AD', source: 'Total', target: 'Self', ratio: 0.4 }
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
 *       { type: 'statRatio', stat: 'AD', source: 'Base', target: 'Self', ratio: 2.0 }
 *     ],
 *     ranged: [
 *       { type: 'statRatio', stat: 'AD', source: 'Base', target: 'Self', ratio: 1.5 }
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
 *       { type: 'statRatio', stat: 'HP', source: 'Current', target: 'Target', ratio: 0.10 }
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
   * 例: [固定値50] + [ボーナスADの50%] + [レベルごとに5増加]
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
