/**
 * DDragon生データ1件 → ItemStateData（ddragonソースのみの正規状態）
 *
 * 画像スプライト座標などのノイズはここで捨てる。
 * パッチノート・手動オーバーライドの適用は mergeItemState が行う。
 */

import type { RawRiotItemData } from '../../types/domain/item'
import type { ItemStateData } from '../../types/domain/itemState'
import { parseItemDescription } from './parseDescription'
import { extractStats } from './extractStats'
import { extractTags } from './extractTags'
import { extractAbilities } from './extractAbilities'

export function toItemState(
  riotId: string,
  raw: RawRiotItemData,
  previousState: ItemStateData | null
): ItemStateData {
  const parsed = parseItemDescription(raw.description ?? '')
  return {
    riotId,
    nameJa: raw.name ?? '',
    plaintextJa: raw.plaintext ?? '',
    priceTotal: raw.gold?.total ?? 0,
    priceSell: raw.gold?.sell ?? 0,
    buildFrom: raw.from ?? [],
    buildInto: raw.into ?? [],
    maps: Object.entries(raw.maps ?? {})
      .filter(([, enabled]) => enabled)
      .map(([mapId]) => Number(mapId))
      .sort((a, b) => a - b),
    tags: extractTags(raw),
    basicStats: extractStats(parsed.statLines),
    abilities: extractAbilities(parsed.blocks, previousState?.abilities ?? null),
    availability: {
      inStore: raw.inStore === true,
      purchasable: raw.gold?.purchasable === true,
    },
  }
}
