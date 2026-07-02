import { describe, it, expect } from 'vitest'
import { parseItemDescription } from '../ddragon/parseDescription'
import { extractStats } from '../ddragon/extractStats'
import { loadDdragonFixture } from './helpers'

const fixture = loadDdragonFixture('26.1-item-excerpt.json')

describe('parseItemDescription', () => {
  it('全fixtureアイテムのgolden snapshot', async () => {
    const result = Object.fromEntries(
      Object.entries(fixture).map(([id, raw]) => [
        `${id} ${raw.name}`,
        parseItemDescription(raw.description),
      ])
    )
    await expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      './__snapshots__/parseDescription-26.1.json'
    )
  })

  it('トリニティ フォース: 2つのpassiveとstats 4行', () => {
    const parsed = parseItemDescription(fixture['3078'].description)
    expect(parsed.blocks).toHaveLength(2)
    expect(parsed.blocks.map((b) => b.nameJa)).toEqual(['追撃', '加速'])
    expect(parsed.blocks.every((b) => b.kind === 'passive')).toBe(true)
    expect(parsed.statLines).toEqual([
      { label: '攻撃力', valueText: '36' },
      { label: '攻撃速度', valueText: '30%' },
      { label: '体力', valueText: '333' },
      { label: 'スキルヘイスト', valueText: '15' },
    ])
  })

  it('ゾーニャの砂時計: activeブロックを抽出', () => {
    const parsed = parseItemDescription(fixture['3157'].description)
    expect(parsed.blocks).toHaveLength(1)
    expect(parsed.blocks[0].kind).toBe('active')
    expect(parsed.blocks[0].nameJa).toBe('時間停止')
  })

  it('ブーツ: アビリティなし', () => {
    const parsed = parseItemDescription(fixture['1001'].description)
    expect(parsed.blocks).toHaveLength(0)
    expect(parsed.statLines).toEqual([{ label: '移動速度', valueText: '25' }])
  })

  it('statsタグなしのアイテムでも落ちない', () => {
    const parsed = parseItemDescription(fixture['1090'].description)
    expect(parsed.statLines).toEqual([])
  })
})

describe('extractStats', () => {
  it('％表記と整数を数値化する（旧autoStatsExtractorの整数のみバグ修正）', () => {
    const parsed = parseItemDescription(fixture['3153'].description)
    const stats = extractStats(parsed.statLines)
    expect(stats['攻撃力']).toBe(40)
    expect(stats['攻撃速度']).toBe(25)
    expect(stats['ライフ スティール']).toBe(10)
  })

  it('小数値を保持する', () => {
    const stats = extractStats([{ label: '基本マナ自動回復', valueText: '2.5' }])
    expect(stats['基本マナ自動回復']).toBe(2.5)
  })
})
