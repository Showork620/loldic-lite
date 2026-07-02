/**
 * 変更イベント（item_changes）の型定義
 *
 * パッチごとのアイテム変更はこの形で提案（pending）され、
 * 人間の承認（approved）を経て公開タイムラインに表示される。
 */

export type ChangeType = 'buff' | 'nerf' | 'adjusted' | 'rework' | 'new' | 'removed'

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

/**
 * 変更の向き。ゲームプレイ上の益で判定する
 * （クールダウンや価格は「下がる＝up」— STAT_POLARITY 参照）。
 */
export type ChangeDirection = 'up' | 'down' | 'neutral'

export type ChangeSource = 'ddragon_diff' | 'patchnote' | 'manual'

/**
 * item_changes.changes[] の1エントリ。
 * 1つのフィールド（またはアビリティパラメータ）の before ⇒ after。
 */
export interface ChangeEntry {
  /**
   * field path。例:
   * - "basicStats.攻撃力"
   * - "priceTotal"
   * - "abilities.スペルブレード.sourceText"
   * - "abilities.スペルブレード.params.bonusDamage"
   * - "unmapped.自動効果（重複不可） - 指令" … パッチノート行を状態フィールドに
   *   自動で紐付けられなかったもの。レビューUIで人間が紐付ける。
   */
  target: string
  /** 表示用ラベル。例 "攻撃力" / "スペルブレードの追加ダメージ" */
  targetLabel: string
  /** null = 新規追加。非数値変更は原文文字列のまま保持 */
  before: unknown | null
  /** null = 削除 */
  after: unknown | null
  direction: ChangeDirection
  source: ChangeSource
  /** 0.0–1.0。ddragon_diff由来は1.0、パッチノート抽出はscoreExtractの値 */
  confidence: number
  /** 由来する patchnote_extracts.id */
  extractId?: string
}
