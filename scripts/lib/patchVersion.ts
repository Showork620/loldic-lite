/**
 * ゲームパッチ名（"26.13" / hotfix "26.13b"）の解釈と
 * DDragonバージョン（"16.13.1"）への解決
 *
 * 命名体系の対応: ゲームパッチ 26.N ↔ DDragon 16.N.x（メジャーが-10）
 */

export interface ParsedPatchVersion {
  major: number
  minor: number
  /** "b"=1, "c"=2 … hotfixでなければ 0 */
  hotfix: number
}

export function parsePatchVersion(version: string): ParsedPatchVersion {
  const m = version.trim().match(/^(\d+)\.(\d+)([a-z])?$/)
  if (!m) {
    throw new Error(`パッチ名の形式が不正です: "${version}"（例: 26.13, 26.13b）`)
  }
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    hotfix: m[3] ? m[3].charCodeAt(0) - 'a'.charCodeAt(0) : 0,
  }
}

/** 全順序ソートキー。26.13 → 260130, 26.13b → 260131 */
export function toSortKey(version: string): number {
  const p = parsePatchVersion(version)
  return p.major * 10000 + p.minor * 10 + p.hotfix
}

export function isHotfixVersion(version: string): boolean {
  return parsePatchVersion(version).hotfix > 0
}

/**
 * versions.json の配列からゲームパッチに対応するDDragonバージョンを解決。
 * 見つからない場合は例外（--ddragon-version での明示指定を促す）。
 */
export function resolveDdragonVersion(gamePatch: string, versions: string[]): string {
  const p = parsePatchVersion(gamePatch)
  const prefix = `${p.major - 10}.${p.minor}.`
  const found = versions.find((v) => v.startsWith(prefix))
  if (!found) {
    throw new Error(
      `パッチ ${gamePatch} に対応するDDragonバージョン（${prefix}x）が見つかりません。` +
        `--ddragon-version で明示指定してください`
    )
  }
  return found
}
