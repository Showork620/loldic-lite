/**
 * パッチノート解析の型定義
 *
 * 公式パッチノート（ja-jp）のアイテムセクションを解析した結果。
 * 原文（quotedText）は必ず保持し、解析結果はそこから再構築可能にする。
 */

/**
 * 変更行1つ分。例: <li><strong>物理防御と魔法防御</strong>：+10 ⇒ <strong>+8</strong></li>
 */
export interface ParsedChange {
  /** 例 "物理防御と魔法防御" */
  label: string
  /** 原文表記のまま（"+10"）。⇒を含まない行（新規効果など）は null */
  before: string | null
  /** 原文表記のまま（"+8"） */
  after: string
  /** before から抽出した数値。抽出不能（レシピ変更等）は null */
  beforeNumeric: number | null
  afterNumeric: number | null
}

/**
 * パッチノート内の1アイテム分のブロック
 */
export interface PatchnoteItemSection {
  /** ノート記載のアイテム名（例 "ドラン ヘルム"） */
  itemName: string
  /** blockquote の開発コメント。無ければ null */
  summaryText: string | null
  /** ブロック全体のプレーンテキスト引用（名前＋コメント＋変更行） */
  quotedText: string
  changeLines: ParsedChange[]
  /** アイテムセクション見出しの検出に失敗し、全文書走査で拾った場合 true */
  viaFallback: boolean
}

export type NameMatchKind = 'exact' | 'normalized' | 'partial' | 'none'

export interface NameMatchResult {
  riotId: string | null
  matched: NameMatchKind
}
