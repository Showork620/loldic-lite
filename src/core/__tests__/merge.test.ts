import { describe, it, expect } from 'vitest'
import { mergeItemState } from '../merge/mergeItemState'
import { applyOverride } from '../merge/applyOverride'
import { toItemState } from '../ddragon/toItemState'
import { loadDdragonFixture } from './helpers'
import type { AbilityNumericParam } from '../../types/domain/abilityStats'

const fx1 = loadDdragonFixture('26.1-item-excerpt.json')

describe('mergeItemState', () => {
  it('通常パッチ: ddragonスナップショットから状態を構築する', () => {
    const { data, provenance } = mergeItemState({
      riotId: '3078',
      snapshot: fx1['3078'],
      previousState: null,
      extracts: [],
      overrides: [],
    })
    expect(data.nameJa).toBe('トリニティ フォース')
    expect(data.priceTotal).toBe(3333)
    expect(data.basicStats).toEqual({
      攻撃力: 36,
      攻撃速度: 30,
      体力: 333,
      スキルヘイスト: 15,
    })
    expect(data.abilities.map((a) => a.key)).toEqual(['追撃', '加速'])
    expect(data.buildFrom).toEqual(['3057', '3044', '3051'])
    expect(provenance).toEqual({})
  })

  it('手動オーバーライドは常に勝ち、provenanceに記録される', () => {
    const { data, provenance } = mergeItemState({
      riotId: '3078',
      snapshot: fx1['3078'],
      previousState: null,
      extracts: [],
      overrides: [{ id: 'ov-1', fieldPath: 'basicStats.攻撃力', value: 40 }],
    })
    expect(data.basicStats['攻撃力']).toBe(40)
    expect(provenance['basicStats.攻撃力']).toEqual({ source: 'manual', ref: 'ov-1' })
  })

  it('hotfixパッチ: snapshotなし＋パッチノート抽出で前状態を更新する', () => {
    const previousState = toItemState('3078', fx1['3078'], null)
    const { data, provenance } = mergeItemState({
      riotId: '3078',
      snapshot: null,
      previousState,
      extracts: [
        {
          id: 'ex-1',
          confidence: 0.9,
          parsedChanges: [
            { label: '攻撃力', before: '36', after: '33', beforeNumeric: 36, afterNumeric: 33 },
            // フィールドに紐付かない行は状態に適用されない
            { label: '追撃のダメージ', before: '200%', after: '175%', beforeNumeric: 200, afterNumeric: 175 },
          ],
        },
      ],
      overrides: [],
    })
    expect(data.basicStats['攻撃力']).toBe(33)
    expect(data.basicStats['体力']).toBe(333) // 触っていないフィールドは保持
    expect(provenance['basicStats.攻撃力']).toEqual({ source: 'patchnote', ref: 'ex-1' })
    expect(provenance['unmapped.追撃のダメージ']).toBeUndefined()
  })

  it('通常パッチではパッチノート抽出はddragon値を上書きしない', () => {
    const { data } = mergeItemState({
      riotId: '3078',
      snapshot: fx1['3078'],
      previousState: null,
      extracts: [
        {
          id: 'ex-1',
          confidence: 0.9,
          parsedChanges: [
            { label: '攻撃力', before: '36', after: '99', beforeNumeric: 36, afterNumeric: 99 },
          ],
        },
      ],
      overrides: [],
    })
    expect(data.basicStats['攻撃力']).toBe(36)
  })

  it('snapshotも前状態もなければ例外', () => {
    expect(() =>
      mergeItemState({ riotId: 'x', snapshot: null, previousState: null, extracts: [], overrides: [] })
    ).toThrow()
  })
})

describe('applyOverride', () => {
  const state = toItemState('3078', fx1['3078'], null)

  it('アビリティパラメータをkeyパスで作成できる', () => {
    const param: AbilityNumericParam = {
      label: '追加物理ダメージ',
      unit: 'Percent',
      scaling: {
        appliesTo: 'both',
        value: [{ type: 'statRatio', stat: '攻撃力', source: 'Base', target: 'Self', ratio: 2 }],
      },
    }
    const updated = applyOverride(state, 'abilities.追撃.params.bonusDamage', param)
    expect(updated.abilities[0].params['bonusDamage']).toEqual(param)
    // イミュータブル: 元は変わらない
    expect(state.abilities[0].params['bonusDamage']).toBeUndefined()
  })

  it('存在しないアビリティkeyへのパスは例外', () => {
    expect(() => applyOverride(state, 'abilities.存在しない.params.x', 1)).toThrow()
  })

  it('トップレベルのスカラーを上書きできる', () => {
    expect(applyOverride(state, 'priceTotal', 3000).priceTotal).toBe(3000)
  })
})
