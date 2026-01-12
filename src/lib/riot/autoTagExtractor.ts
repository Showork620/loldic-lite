import type { RawRiotItemData } from '../../types/domain/item';
import type { ItemTag } from '../../types/domain/stats';
import { TAGS_TRANSLATE } from '../../constants/riotApi';

/**
 * Riot APIの生データから自動的にタグを抽出する
 * 
 * @param rawData - Riot APIから取得したアイテムの生データ
 * @returns 抽出されたItemTagの配列（重複なし）
 */
export function extractTagsFromRawData(rawData: RawRiotItemData): ItemTag[] {
  const extractedTags = new Set<ItemTag>();

  // 1. rawData.tagsから英語タグを日本語に変換
  if (rawData.tags && Array.isArray(rawData.tags)) {
    for (const englishTag of rawData.tags) {
      const japaneseTag = TAGS_TRANSLATE[englishTag];
      if (japaneseTag) {
        extractedTags.add(japaneseTag);
      } else {
        // 未マッピングのタグをログに出力（デバッグ用）
        console.debug(`[AutoTag] Unmapped tag found: "${englishTag}" for item ${rawData.name} (${rawData.id})`);
      }
    }
  }

  // 2. rawData.description内からItemTag文字列を検索
  if (rawData.description) {
    // ItemTag型の全ての値を取得（TAGS_TRANSLATEの値を使用）
    const allItemTags = Object.values(TAGS_TRANSLATE);

    for (const tag of allItemTags) {
      // description内に該当するタグが含まれているか確認
      if (rawData.description.includes(tag)) {
        extractedTags.add(tag);
      }
    }
  }

  return Array.from(extractedTags);
}

/**
 * デバッグ用: 抽出されたタグの統計情報を出力
 */
export function logTagExtractionStats(
  itemId: string,
  itemName: string,
  extractedTags: ItemTag[]
): void {
  if (extractedTags.length > 0) {
    console.debug(
      `[AutoTag] ${itemName} (${itemId}): ${extractedTags.length} tags extracted - [${extractedTags.join(', ')}]`
    );
  }
}
