/**
 * アイテムのdescriptionからbasicStatsを自動抽出するユーティリティ
 */

import { STATS_KEYWORD } from '../../constants/riotApi';
import type { BasicStats } from '../../types/domain/stats';

/**
 * descriptionフィールドからステータス情報を抽出
 * 
 * @param description - Riot APIのdescriptionフィールド
 * @returns 抽出されたステータス情報
 * 
 * @example
 * const description = '<stats>魔力<attention>80</attention><br>マナ<attention>600</attention></stats>';
 * const stats = extractStatsFromDescription(description);
 * // { "魔力": 80, "マナ": 600 }
 */
export function extractStatsFromDescription(description: string): BasicStats {
  const stats: BasicStats = {};

  // <stats>タグ内のコンテンツを抽出
  const statsMatch = description.match(/<stats>(.*?)<\/stats>/);
  if (!statsMatch) {
    return stats;
  }

  const statsContent = statsMatch[1];

  // 各ChampionStatについてチェック
  for (const stat of STATS_KEYWORD) {
    // ChampionStat直後の<attention>数値</attention>を抽出
    const pattern = new RegExp(`${escapeRegExp(stat)}<attention>(\\d+)</attention>`);
    const match = statsContent.match(pattern);

    if (match) {
      const value = parseInt(match[1], 10);
      stats[stat] = value;

      // デバッグログ
      if (Object.keys(stats).length === 1) {
        console.log(`[AutoStats] Extracting stats from description...`);
      }
    }
  }

  // 抽出結果のログ
  if (Object.keys(stats).length > 0) {
    const statsStr = Object.entries(stats)
      .map(([key, value]) => `${key}:${value}`)
      .join(', ');
    console.log(`[AutoStats] Extracted: ${statsStr}`);
  }

  return stats;
}

/**
 * 正規表現用に文字列をエスケープ
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
