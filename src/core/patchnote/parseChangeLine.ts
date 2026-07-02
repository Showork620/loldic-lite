/**
 * パッチノートの変更行1つのパース
 *
 * 典型形: "物理防御と魔法防御：+10 ⇒ +8"
 * 矢印ゆれ（⇒ / → / =>）を吸収し、ラベル・before・after と数値を抽出する。
 * ⇒を含まない行（「新効果：〜」等）は before=null で保持する。
 */

import type { ParsedChange } from '../../types/domain/patchnote'

const ARROW_SPLIT = /⇒|→|=>/

export function firstNumber(text: string): number | null {
  const m = text.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)
  return m ? Number(m[0]) : null
}

export function parseChangeLine(text: string): ParsedChange | null {
  const t = text.replace(/\s+/g, ' ').trim()
  if (!t) return null

  // 先頭側の「ラベル：」を分離（コロンが遠すぎる場合はラベル無しとみなす）
  const colonIdx = t.search(/[:：]/)
  let label = ''
  let rest = t
  if (colonIdx > 0 && colonIdx <= 40) {
    label = t.slice(0, colonIdx).trim()
    rest = t.slice(colonIdx + 1).trim()
  }

  const parts = rest.split(ARROW_SPLIT)
  if (parts.length >= 2) {
    const before = parts[0].trim()
    const after = parts.slice(1).join(' ').trim()
    return {
      label,
      before,
      after,
      beforeNumeric: firstNumber(before),
      afterNumeric: firstNumber(after),
    }
  }

  return {
    label,
    before: null,
    after: rest,
    beforeNumeric: null,
    afterNumeric: null,
  }
}
