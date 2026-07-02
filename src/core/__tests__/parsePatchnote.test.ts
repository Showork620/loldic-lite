import { describe, it, expect } from 'vitest'
import { parsePatchnoteDocument } from '../patchnote/parsePatchnoteHtml'
import { parseChangeLine } from '../patchnote/parseChangeLine'
import { buildNameIndex, matchItemName } from '../patchnote/matchItemName'
import { scoreExtract } from '../patchnote/confidence'
import { loadDdragonFixture, loadPatchnoteFixture, toNameIndexEntries } from './helpers'

const html = loadPatchnoteFixture('26.13-notes.html')
const sections = parsePatchnoteDocument(html)

describe('parsePatchnoteDocument（実パッチノート26.13）', () => {
  it('golden snapshot', async () => {
    await expect(JSON.stringify(sections, null, 2)).toMatchFileSnapshot(
      './__snapshots__/parsePatchnote-26.13.json'
    )
  })

  it('アイテムセクションの2アイテムを見出し検出で抽出する', () => {
    expect(sections.map((s) => s.itemName)).toEqual(['ドラン ヘルム', '帝国の指令'])
    expect(sections.every((s) => !s.viaFallback)).toBe(true)
  })

  it('ドラン ヘルム: 変更2行と開発コメントを抽出', () => {
    const s = sections[0]
    expect(s.summaryText).toContain('やり過ぎだった')
    expect(s.changeLines).toEqual([
      {
        label: '物理防御と魔法防御',
        before: '+10',
        after: '+8',
        beforeNumeric: 10,
        afterNumeric: 8,
      },
      { label: '体力', before: '+140', after: '+150', beforeNumeric: 140, afterNumeric: 150 },
    ])
  })

  it('帝国の指令: レシピ変更のような非数値行も原文で保持', () => {
    const s = sections[1]
    expect(s.changeLines).toHaveLength(4)
    const recipe = s.changeLines[0]
    expect(recipe.label).toBe('レシピ')
    expect(recipe.before).toContain('ブラスティング ワンド')
    expect(recipe.after).toContain('増魔の書')
  })
})

describe('parseChangeLine', () => {
  it.each([
    [
      '物理防御と魔法防御：+10 ⇒ +8',
      { label: '物理防御と魔法防御', before: '+10', after: '+8', beforeNumeric: 10, afterNumeric: 8 },
    ],
    [
      '攻撃力：55 → 60',
      { label: '攻撃力', before: '55', after: '60', beforeNumeric: 55, afterNumeric: 60 },
    ],
    [
      'クールダウン：15秒 => 12秒',
      { label: 'クールダウン', before: '15秒', after: '12秒', beforeNumeric: 15, afterNumeric: 12 },
    ],
    [
      '新効果：スロウを付与する',
      { label: '新効果', before: null, after: 'スロウを付与する', beforeNumeric: null, afterNumeric: null },
    ],
  ])('%s', (input, expected) => {
    expect(parseChangeLine(input)).toEqual(expected)
  })

  it('空行はnull', () => {
    expect(parseChangeLine('  ')).toBeNull()
  })
})

describe('matchItemName（26.13スナップショットの名前索引）', () => {
  const index = buildNameIndex(toNameIndexEntries(loadDdragonFixture('26.13-item-excerpt.json')))

  it('完全一致で解決する', () => {
    expect(matchItemName('ドラン ヘルム', index)).toEqual({ riotId: '1120', matched: 'exact' })
  })

  it('同名複数ID（アリーナ複製）は4桁ID＆SR対応を優先する', () => {
    // 帝国の指令 は 4005 / 224005 / 324005 の3つ存在する
    expect(matchItemName('帝国の指令', index)).toEqual({ riotId: '4005', matched: 'exact' })
  })

  it('空白ゆれは正規化一致で解決する', () => {
    expect(matchItemName('ドランヘルム', index)).toEqual({ riotId: '1120', matched: 'normalized' })
  })

  it('未知の名前はnone', () => {
    expect(matchItemName('存在しないアイテム', index)).toEqual({ riotId: null, matched: 'none' })
  })
})

describe('scoreExtract', () => {
  it('完全一致＋全行⇒＋見出し検出 = 1.0', () => {
    const s = sections[1]
    expect(scoreExtract('exact', s.changeLines, s.viaFallback)).toBe(1)
  })

  it('名前解決失敗＋フォールバックは閾値未満', () => {
    const s = sections[0]
    expect(scoreExtract('none', s.changeLines, true)).toBeLessThan(0.75)
  })
})
