/**
 * マップID定数
 */
export const MAP_IDS = {
  SUMMONERS_RIFT: 11,
  ARAM: 12,
} as const

/**
 * マップ名を取得
 */
export function getMapName(mapId: number): string {
  switch (mapId) {
    case MAP_IDS.SUMMONERS_RIFT:
      return 'サモリフ'
    case MAP_IDS.ARAM:
      return 'ARAM'
    default:
      return `マップID: ${mapId}`
  }
}
