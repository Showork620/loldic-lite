/**
 * Riot API (Data Dragon) からアイテムデータを取得するユーティリティ関数
 */

import type { RiotAPIResponse } from '../types/item';

// Data Dragon APIのベースURL
const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';

/**
 * 最新のパッチバージョンを取得
 * @returns 最新バージョン文字列 (例: "14.23.1")
 */
export async function getLatestVersion(): Promise<string> {
  try {
    const response = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`, {
      cache: 'no-cache', // キャッシュを無効化して常に最新を取得
    });
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
 * 利用可能な全バージョンを取得
 */
export async function getVersions(): Promise<string[]> {
  try {
    const response = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`, {
      cache: 'no-cache', // キャッシュを無効化して常に最新を取得
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch versions: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching versions:', error);
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
 * ルールベースで除外すべきアイテムIDリストを取得
 * unavailable_itemsテーブルの初期値を決定するためのロジック
 * @param itemsData アイテムデータ（Record形式）
 * @returns 除外すべきアイテムIDの配列
 */
export function getUnavailableItemIds(
  itemsData: Record<string, any>
): Array<{ riotId: string; reason: string | null }> {
  const results: Array<{ riotId: string; reason: string | null }> = [];

  for (const [itemId, item] of Object.entries(itemsData)) {
    // デフォルトの理由は null（後から管理画面で編集）
    let reason: string = '管理画面で選択';

    // 除外条件1: maps.11とmaps.12がともにfalse（ノーマル・ARAMどちらにも出ない）
    if (item.maps && !item.maps['11'] && !item.maps['12']) {
      reason = 'ノーマル・ARAMどちらにも出ない';
      results.push({ riotId: itemId, reason });
      continue;
    }

    // 除外条件2: requiredChampionが設定されているもの（チャンピオン専用アイテム）
    if (item.requiredChampion) {
      reason = 'チャンピオン専用アイテム';
      results.push({ riotId: itemId, reason });
      continue;
    }

    // 除外条件3: 購入不可で、specialRecipeもfromも無いもの
    if ((item.inStore === false || item.gold.purchasable === false) && !(item.specialRecipe || item.from)) {
      reason = '店からの購入も素材からの進化もできない';
      results.push({ riotId: itemId, reason });
      continue;
    }
  }

  return results;
}
