import { describe, it, expect } from 'vitest'
import { diffStates } from '../diff/diffStates'
import { classifyChangeType } from '../diff/classifyChange'
import { toItemState } from '../ddragon/toItemState'
import { proposeChanges } from '../changes/proposeChanges'
import { loadDdragonFixture } from './helpers'
import type { ChangeEntry } from '../../types/domain/itemChange'

const fx1 = loadDdragonFixture('26.1-item-excerpt.json')
const fx2 = loadDdragonFixture('26.2-item-excerpt.json')

function mkEntry(partial: Partial<ChangeEntry>): ChangeEntry {
  return {
    target: 'basicStats.攻撃力',
    targetLabel: '攻撃力',
    before: 1,
    after: 2,
    direction: 'neutral',
    source: 'ddragon_diff',
    confidence: 1,
    ...partial,
  }
}

describe('diffStates（実データ26.1→26.2）', () => {
  it('スプライト座標だけ変わったアイテムは差分ゼロ（ノイズ耐性）', () => {
    // 3078はrawのimage.xのみ変化した実例
    const before = toItemState('3078', fx1['3078'], null)
    const after = toItemState('3078', fx2['3078'], before)
    expect(diffStates(before, after)).toEqual([])
  })

  it('エッセンス リーバー: 価格・攻撃力・効果文の複合変更を検出', async () => {
    const before = toItemState('3508', fx1['3508'], null)
    const after = toItemState('3508', fx2['3508'], before)
    const entries = diffStates(before, after)
    const targets = entries.map((e) => e.target)
    expect(targets).toContain('priceTotal')
    expect(targets).toContain('basicStats.攻撃力')
    await expect(JSON.stringify(entries, null, 2)).toMatchFileSnapshot(
      './__snapshots__/diff-3508-26.1-to-26.2.json'
    )
  })

  it('新規アイテムはitemエントリ1件', () => {
    const after = toItemState('2001', fx2['2001'], null)
    const entries = diffStates(null, after)
    expect(entries).toHaveLength(1)
    expect(entries[0].target).toBe('item')
    expect(entries[0].before).toBeNull()
  })
})

describe('classifyChangeType', () => {
  it('全部up → buff', () => {
    expect(classifyChangeType([mkEntry({ direction: 'up' })])).toBe('buff')
  })

  it('全部down → nerf', () => {
    expect(classifyChangeType([mkEntry({ direction: 'down' })])).toBe('nerf')
  })

  it('混在 → adjusted', () => {
    expect(
      classifyChangeType([mkEntry({ direction: 'up' }), mkEntry({ direction: 'down' })])
    ).toBe('adjusted')
  })

  it('価格低下はup（buff）として扱われる', () => {
    const before = toItemState('3508', fx1['3508'], null)
    const after = structuredClone(before)
    after.priceTotal = before.priceTotal - 200
    const entries = diffStates(before, after)
    expect(entries).toHaveLength(1)
    expect(entries[0].direction).toBe('up')
    expect(classifyChangeType(entries)).toBe('buff')
  })

  it('アビリティ追加 → rework', () => {
    expect(
      classifyChangeType([
        mkEntry({ target: 'abilities.新スキル', before: null, after: '新スキル' }),
      ])
    ).toBe('rework')
  })

  it('itemエントリ → new / removed', () => {
    expect(classifyChangeType([mkEntry({ target: 'item', before: null })])).toBe('new')
    expect(classifyChangeType([mkEntry({ target: 'item', after: null })])).toBe('removed')
  })
})

describe('proposeChanges', () => {
  it('差分なし・抽出なしはnull', () => {
    const state = toItemState('3078', fx1['3078'], null)
    expect(
      proposeChanges({ riotId: '3078', before: state, after: structuredClone(state), extracts: [] })
    ).toBeNull()
  })

  it('diffとパッチノート行が同一フィールドを指す場合は裏付けとして紐付く', () => {
    const before = toItemState('3508', fx1['3508'], null)
    const after = toItemState('3508', fx2['3508'], before)
    const proposed = proposeChanges({
      riotId: '3508',
      before,
      after,
      extracts: [
        {
          id: 'ex-1',
          itemName: 'エッセンス リーバー',
          quotedText: 'エッセンス リーバー\n攻撃力：60 ⇒ 65',
          confidence: 1,
          parsedChanges: [
            { label: '攻撃力', before: '60', after: '65', beforeNumeric: 60, afterNumeric: 65 },
          ],
        },
      ],
    })
    expect(proposed).not.toBeNull()
    const adEntry = proposed!.changes.find((e) => e.target === 'basicStats.攻撃力')
    expect(adEntry?.source).toBe('patchnote')
    expect(adEntry?.extractId).toBe('ex-1')
    expect(proposed!.patchnoteQuote).toContain('エッセンス リーバー')
  })

  it('紐付かないパッチノート行はunmappedとして提案に残る', () => {
    const state = toItemState('3078', fx1['3078'], null)
    const proposed = proposeChanges({
      riotId: '3078',
      before: state,
      after: structuredClone(state),
      extracts: [
        {
          id: 'ex-1',
          itemName: 'トリニティ フォース',
          quotedText: 'トリニティ フォース\n追撃のダメージ：200% ⇒ 175%',
          confidence: 0.9,
          parsedChanges: [
            { label: '追撃のダメージ', before: '200%', after: '175%', beforeNumeric: 200, afterNumeric: 175 },
          ],
        },
      ],
    })
    expect(proposed).not.toBeNull()
    expect(proposed!.changes).toHaveLength(1)
    expect(proposed!.changes[0].target).toBe('unmapped.追撃のダメージ')
    expect(proposed!.changes[0].confidence).toBe(0.9)
  })

  it('hotfix: diffが無くてもマップ可能なパッチノート行はエントリ化される', () => {
    const state = toItemState('3078', fx1['3078'], null)
    const proposed = proposeChanges({
      riotId: '3078',
      before: state,
      after: state,
      extracts: [
        {
          id: 'ex-1',
          itemName: 'トリニティ フォース',
          quotedText: 'q',
          confidence: 0.9,
          parsedChanges: [
            { label: '攻撃力', before: '36', after: '33', beforeNumeric: 36, afterNumeric: 33 },
          ],
        },
      ],
    })
    const adEntry = proposed!.changes.find((e) => e.target === 'basicStats.攻撃力')
    expect(adEntry?.before).toBe(36)
    expect(adEntry?.after).toBe(33)
    expect(adEntry?.direction).toBe('down')
  })
})
