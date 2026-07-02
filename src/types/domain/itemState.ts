/**
 * アイテムの正規状態（canonical state）の型定義
 *
 * item_states.data に格納される、パッチごとのアイテムの確定した姿。
 * DDragonスナップショット・パッチノート抽出・手動オーバーライドを
 * 純粋関数 mergeItemState でマージして導出される（再構築可能）。
 */

import type { BasicStats } from './stats'
import type { AbilityNumericParam } from './abilityStats'

/**
 * DDragon由来の購入可否シグナル。
 * 公開可否（is_available）の判断材料であり、判断そのものは
 * item_manual_settings ＋ 自動除外ルール側が持つ。
 */
export interface ItemAvailability {
  inStore: boolean
  purchasable: boolean
}

/**
 * アイテムのアビリティ1つ分の正規状態
 */
export interface ItemAbilityState {
  /**
   * パッチをまたいで不変の安定キー。
   * 生成規則: アビリティ名のNFKC正規化＋空白除去。
   * 前パッチに同名アビリティがあればそのkeyを継承する。
   */
  key: string
  kind: 'passive' | 'active'
  nameJa: string
  /**
   * DDragon説明文から抽出した生テキスト（タグ除去済み）。
   * パッチごとに自動更新される。diffの対象。
   */
  sourceText: string
  /**
   * 表示用テンプレート。"{bonusDamage}の追加物理ダメージ" のように
   * {paramKey} プレースホルダーを含む。人間がキュレーションする。
   * 未キュレーション時は sourceText と同一。
   */
  descriptionJa: string
  cooldown?: number
  /**
   * 名前付き数値パラメータ。キーは descriptionJa のプレースホルダーと一致。
   * パッチノート解析＋人間のキュレーションで充足される。
   */
  params: Record<string, AbilityNumericParam>
}

/**
 * item_states.data の形状。
 * 画像スプライト座標などパッチごとに揺れるノイズは含めない
 * （DDragon rawでは全アイテムの約9割が毎パッチ image.x/y だけ変化する）。
 */
export interface ItemStateData {
  riotId: string
  nameJa: string
  plaintextJa: string
  priceTotal: number
  priceSell: number
  buildFrom: string[]
  buildInto: string[]
  maps: number[]
  /** 翻訳済み検索タグ（TAGS_TRANSLATE 由来） */
  tags: string[]
  basicStats: BasicStats
  abilities: ItemAbilityState[]
  availability: ItemAvailability
}

/** フィールドの出所 */
export type ProvenanceSource = 'ddragon' | 'patchnote' | 'manual'

export interface ProvenanceEntry {
  source: ProvenanceSource
  /** patchnote_extracts.id または manual_overrides.id */
  ref?: string
}

/**
 * field_path → 出所のマップ。
 * ddragon由来のフィールドは記録しない（エントリが無い＝ddragon）。
 * patchnote / manual で上書きされたパスのみ持つ。
 */
export type Provenance = Record<string, ProvenanceEntry>
