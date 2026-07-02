/**
 * 正規状態の純粋マージ関数（このrepoの中核）
 *
 * 優先度: manual_overrides > patchnote extracts > ddragon
 *
 * - snapshot があるパッチ（通常パッチ）: ddragonから状態を再構築。
 *   基本stats/価格はddragonが構造化された正であるため、パッチノート抽出は
 *   状態を上書きしない（変更提案の裏付けとしてproposeChangesが使う）。
 * - snapshot が無いパッチ（hotfix）: 前パッチ状態を引き継ぎ、
 *   数値が取れたパッチノート抽出行を basicStats / price に適用する。
 * - manual_overrides は常に最後に適用され、全てに勝つ。
 *
 * この関数は決定的であり、Layer 0（生データ）＋overridesから
 * いつでも全履歴を再導出できる。
 */

import type { RawRiotItemData } from '../../types/domain/item'
import type { ItemStateData, Provenance } from '../../types/domain/itemState'
import type { ParsedChange } from '../../types/domain/patchnote'
import { toItemState } from '../ddragon/toItemState'
import { applyOverride } from './applyOverride'
import { mapLabelToTarget } from '../changes/mapLabel'

export interface MergeExtract {
  id: string
  parsedChanges: ParsedChange[]
  confidence: number
}

export interface MergeOverride {
  id: string
  fieldPath: string
  value: unknown
}

export interface MergeInput {
  riotId: string
  /** 通常パッチのDDragonスナップショット。hotfixパッチでは null */
  snapshot: RawRiotItemData | null
  /** 直前パッチ（sort_key順）の正規状態 */
  previousState: ItemStateData | null
  /** このパッチで有効なパッチノート抽出（confidence閾値以上のもの） */
  extracts: MergeExtract[]
  /** このパッチで有効な手動オーバーライド */
  overrides: MergeOverride[]
}

export interface MergeResult {
  data: ItemStateData
  provenance: Provenance
}

export function mergeItemState(input: MergeInput): MergeResult {
  const { riotId, snapshot, previousState, extracts, overrides } = input

  let data: ItemStateData
  const provenance: Provenance = {}

  if (snapshot) {
    data = toItemState(riotId, snapshot, previousState)
  } else if (previousState) {
    data = structuredClone(previousState)
  } else {
    throw new Error(`cannot merge item ${riotId}: no snapshot and no previous state`)
  }

  // hotfix: パッチノートの数値変更を basicStats / price に適用
  if (!snapshot) {
    for (const extract of extracts) {
      for (const line of extract.parsedChanges) {
        if (line.before === null || line.afterNumeric === null) continue
        const target = mapLabelToTarget(line.label)
        if (!target) continue
        data = applyOverride(data, target, line.afterNumeric)
        provenance[target] = { source: 'patchnote', ref: extract.id }
      }
    }
  }

  for (const override of overrides) {
    data = applyOverride(data, override.fieldPath, override.value)
    provenance[override.fieldPath] = { source: 'manual', ref: override.id }
  }

  return { data, provenance }
}
