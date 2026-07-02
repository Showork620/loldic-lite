import { describe, it, expect } from 'vitest'
import { renderAbilityTemplate, formatParam } from './renderAbilityTemplate'
import type { AbilityNumericParam } from '../types/domain/abilityStats'

const flatParam: AbilityNumericParam = {
  label: '追加ダメージ',
  unit: 'Flat',
  scaling: { appliesTo: 'both', value: [{ type: 'flat', value: 50 }] },
}

describe('renderAbilityTemplate', () => {
  it('flatパラメータを置換する', () => {
    expect(renderAbilityTemplate('{damage}の追加物理ダメージ', { damage: flatParam })).toBe(
      '50の追加物理ダメージ'
    )
  })

  it('未定義のプレースホルダーは残す', () => {
    expect(renderAbilityTemplate('{unknown}のダメージ', {})).toBe('{unknown}のダメージ')
  })

  it('レベルスケールはレンジ表示', () => {
    const param: AbilityNumericParam = {
      label: 'ダメージ',
      unit: 'Flat',
      scaling: {
        appliesTo: 'both',
        value: [{ type: 'level', valuesByLevel: [10, 20, 30] }],
      },
    }
    expect(formatParam(param)).toBe('10〜30（レベル依存）')
  })

  it('statRatioは日本語表記', () => {
    const param: AbilityNumericParam = {
      label: 'ダメージ',
      unit: 'Percent',
      scaling: {
        appliesTo: 'both',
        value: [{ type: 'statRatio', stat: '攻撃力', source: 'Bonus', target: 'Self', ratio: 0.5 }],
      },
    }
    expect(formatParam(param)).toBe('増加攻撃力の50%')
  })

  it('近接/遠隔で値が異なる場合', () => {
    const param: AbilityNumericParam = {
      label: 'ダメージ',
      unit: 'Percent',
      scaling: {
        appliesTo: 'meleeRanged',
        melee: [{ type: 'flat', value: 12 }],
        ranged: [{ type: 'flat', value: 8 }],
      },
    }
    expect(formatParam(param)).toBe('近接12%/遠隔8%')
  })

  it('複数スケーリングは加算表記', () => {
    const param: AbilityNumericParam = {
      label: 'ダメージ',
      unit: 'Flat',
      scaling: {
        appliesTo: 'both',
        value: [
          { type: 'flat', value: 100 },
          { type: 'statRatio', stat: '魔力', source: 'Total', target: 'Self', ratio: 0.3 },
        ],
      },
    }
    expect(formatParam(param)).toBe('100 + 魔力の30%')
  })
})
