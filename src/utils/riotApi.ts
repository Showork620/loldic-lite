/**
 * Riot API (Data Dragon) からアイテムデータを取得するユーティリティ関数
 */

import type { RiotAPIResponse, RiotItemData } from '../types/item';
import { UNAVAILABLE_ITEMS } from '../constants/riotApi';

// Data Dragon APIのベースURL
const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';

/**
 * 最新のパッチバージョンを取得
 * @returns 最新バージョン文字列 (例: "14.23.1")
 */
export async function getLatestVersion(): Promise<string> {
  try {
    const response = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch versions: ${response.statusText}`);
    }
    const versions: string[] = await response.json();
    return versions[0]; // 最新バージョンは配列の先頭
  } catch (error) {
    console.error('Error fetching latest version:', error);
    throw error;
  }
}

/**
 * 指定バージョンのアイテムデータを取得
 * @param version パッチバージョン
 * @param locale ロケール (デフォルト: ja_JP)
 * @returns アイテムデータのレスポンス
 */
export async function fetchItemData(
  version: string,
  locale: string = 'ja_JP'
): Promise<RiotAPIResponse> {
  try {
    const url = `${DDRAGON_BASE_URL}/cdn/${version}/data/${locale}/item.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch item data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching item data:', error);
    throw error;
  }
}

/**
 * アイテム画像のURLを生成
 * @param version パッチバージョン
 * @param itemId アイテムID (例: "3001")
 * @returns 画像URL
 */
export function getItemImageUrl(version: string, itemId: string): string {
  return `${DDRAGON_BASE_URL}/cdn/${version}/img/item/${itemId}.png`;
}

/**
 * 使用可能なアイテムのみをフィルタリング
 * @param itemsData アイテムデータ（Record形式）
 * @returns フィルタリングされたアイテムデータ
 */
export function filterAvailableItems(
  itemsData: Record<string, any>
): Record<string, RiotItemData> {
  const filtered: Record<string, RiotItemData> = {};

  for (const [itemId, item] of Object.entries(itemsData)) {
    // 除外条件1: descriptionが空で、かつinStoreがtrueのもの
    if (item.description === "" && item.inStore) {
      continue;
    }

    // 除外条件2: UNAVAILABLE_ITEMSリストに含まれるもの
    if (UNAVAILABLE_ITEMS.includes(itemId)) {
      continue;
    }

    // 除外条件3: maps.11とmaps.12がともにfalse（ノーマル・ARAMどちらにも出ない）
    if (item.maps && !item.maps['11'] && !item.maps['12']) {
      continue;
    }

    // 除外条件4: requiredChampionが設定されているもの（チャンピオン専用アイテム）
    if (item.requiredChampion) {
      continue;
    }

    // フィルタを通過したアイテムを追加
    filtered[itemId] = item as RiotItemData;
  }

  return filtered;
}
