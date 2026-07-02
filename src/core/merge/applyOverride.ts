/**
 * field_path への値の適用（イミュータブル）
 *
 * パスはドット区切り。配列の要素は、要素が {key: string} を持つ場合は
 * key で解決し（abilities）、それ以外は数値インデックスで解決する。
 * 例: "abilities.スペルブレード.params.bonusDamage"
 *     "basicStats.攻撃力"
 * 制約: アビリティ名（key）にドットを含む場合は解決できない。
 */

type PathTarget = Record<string, unknown> | unknown[]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function step(container: unknown, segment: string): unknown {
  if (Array.isArray(container)) {
    const byKey = container.find(
      (e) => isRecord(e) && 'key' in e && e.key === segment
    )
    if (byKey !== undefined) return byKey
    const idx = Number(segment)
    return Number.isInteger(idx) ? container[idx] : undefined
  }
  if (isRecord(container)) return container[segment]
  return undefined
}

export function applyOverride<T>(data: T, fieldPath: string, value: unknown): T {
  const segments = fieldPath.split('.').filter(Boolean)
  if (segments.length === 0) throw new Error(`invalid field path: "${fieldPath}"`)

  const clone = structuredClone(data)
  let current: unknown = clone

  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]
    let next = step(current, seg)
    if (next === undefined || next === null) {
      // 中間オブジェクトが無ければ作る（配列内keyの新規作成は不可）
      if (Array.isArray(current)) {
        throw new Error(`field path not found: "${fieldPath}" (segment "${seg}")`)
      }
      if (!isRecord(current)) {
        throw new Error(`cannot traverse "${seg}" in field path "${fieldPath}"`)
      }
      next = {}
      current[seg] = next
    }
    current = next
  }

  const last = segments[segments.length - 1]
  if (Array.isArray(current)) {
    const idx = current.findIndex((e) => isRecord(e) && 'key' in e && e.key === last)
    if (idx >= 0) current[idx] = value
    else if (Number.isInteger(Number(last))) current[Number(last)] = value
    else current.push(value)
  } else if (isRecord(current)) {
    ;(current as PathTarget as Record<string, unknown>)[last] = value
  } else {
    throw new Error(`cannot set "${last}" in field path "${fieldPath}"`)
  }
  return clone
}
