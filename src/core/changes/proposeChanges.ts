/**
 * diff＋パッチノート抽出 → item_changes 行の提案生成
 *
 * - DDragon diff由来のエントリが土台（confidence 1.0）
 * - パッチノート行がdiffと同じフィールドを指す場合は裏付けとして紐付け
 * - diffに現れないパッチノート行のうち、フィールドに紐付いたものはエントリ化
 *   （hotfixやDDragonに現れない変更）、紐付かないものは "unmapped.<ラベル>"
 *   としてレビューUIに委ねる
 */

import type { ItemStateData } from '../../types/domain/itemState'
import type { ChangeEntry, ChangeType } from '../../types/domain/itemChange'
import type { ParsedChange } from '../../types/domain/patchnote'
import { diffStates } from '../diff/diffStates'
import { classifyChangeType } from '../diff/classifyChange'
import { numericDirection } from '../diff/statPolarity'
import { mapLabelToTarget } from './mapLabel'

export interface ProposeExtract {
  id: string
  itemName: string
  quotedText: string
  parsedChanges: ParsedChange[]
  confidence: number
}

export interface ProposeInput {
  riotId: string
  before: ItemStateData | null
  after: ItemStateData | null
  extracts: ProposeExtract[]
}

export interface ProposedChange {
  changeType: ChangeType
  changes: ChangeEntry[]
  patchnoteQuote: string | null
}

export function proposeChanges(input: ProposeInput): ProposedChange | null {
  const { before, after, extracts } = input
  const entries = diffStates(before, after)
  const byTarget = new Map(entries.map((e) => [e.target, e]))

  for (const extract of extracts) {
    for (const [i, line] of extract.parsedChanges.entries()) {
      const target = mapLabelToTarget(line.label)

      if (target) {
        const existing = byTarget.get(target)
        if (existing) {
          // diffで確認済みの変更にパッチノートの裏付けを紐付け
          existing.source = 'patchnote'
          existing.extractId = extract.id
          continue
        }
        // DDragonのdiffに現れない変更（hotfix等）
        const changeEntry: ChangeEntry = {
          target,
          targetLabel: line.label,
          before: line.beforeNumeric ?? line.before,
          after: line.afterNumeric ?? line.after,
          direction: numericDirection(target, line.beforeNumeric, line.afterNumeric),
          source: 'patchnote',
          confidence: extract.confidence,
          extractId: extract.id,
        }
        entries.push(changeEntry)
        byTarget.set(target, changeEntry)
        continue
      }

      // フィールドに自動で紐付けられない行 → レビューUIで人間が紐付ける
      const label = line.label || `行${i + 1}`
      entries.push({
        target: `unmapped.${label}`,
        targetLabel: label,
        before: line.before,
        after: line.after,
        direction: 'neutral',
        source: 'patchnote',
        confidence: extract.confidence,
        extractId: extract.id,
      })
    }
  }

  if (entries.length === 0) return null

  return {
    changeType: classifyChangeType(entries),
    changes: entries,
    patchnoteQuote: extracts.length
      ? extracts.map((e) => e.quotedText).join('\n\n')
      : null,
  }
}
