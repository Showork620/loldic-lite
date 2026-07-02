/**
 * アビリティ説明テンプレートのレンダリング（純粋関数）
 *
 * descriptionJa の "{paramKey}" プレースホルダーを params の実値で置換する。
 * 例: "{bonusDamage}の追加物理ダメージ" + {bonusDamage: 50/Flat} → "50の追加物理ダメージ"
 */

import type {
  AbilityNumericParam,
  ScalingValue,
} from '../types/domain/abilityStats'

function formatScalingValue(value: ScalingValue, unit: 'Flat' | 'Percent'): string {
  const suffix = unit === 'Percent' ? '%' : ''
  switch (value.type) {
    case 'flat':
      return `${value.value}${suffix}`
    case 'level': {
      const first = value.valuesByLevel[0]
      const last = value.valuesByLevel[value.valuesByLevel.length - 1]
      return first === last ? `${first}${suffix}` : `${first}〜${last}${suffix}（レベル依存）`
    }
    case 'statRatio': {
      const source =
        value.source === 'Bonus' ? '増加' :
        value.source === 'Base' ? '基本' :
        value.source === 'Current' ? '現在' :
        value.source === 'Missing' ? '減少' : ''
      const target = value.target === 'Target' ? '対象の' : ''
      return `${target}${source}${value.stat}の${Math.round(value.ratio * 1000) / 10}%`
    }
    case 'time':
      return `${value.time}秒`
  }
}

export function formatParam(param: AbilityNumericParam): string {
  const scaling = param.scaling
  if (scaling.appliesTo === 'both') {
    return scaling.value.map((v) => formatScalingValue(v, param.unit)).join(' + ')
  }
  const melee = scaling.melee.map((v) => formatScalingValue(v, param.unit)).join(' + ')
  const ranged = scaling.ranged.map((v) => formatScalingValue(v, param.unit)).join(' + ')
  return `近接${melee}/遠隔${ranged}`
}

/**
 * テンプレート文字列内の {paramKey} を実値に置換する。
 * 対応するparamが無いプレースホルダーはそのまま残す（キュレーション途中の可視化）。
 */
export function renderAbilityTemplate(
  descriptionJa: string,
  params: Record<string, AbilityNumericParam>
): string {
  return descriptionJa.replace(/\{([^{}]+)\}/g, (match, key: string) => {
    const param = params[key]
    return param ? formatParam(param) : match
  })
}
