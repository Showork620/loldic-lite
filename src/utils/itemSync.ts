/**
 * アイテム同期処理
 * Riot APIからデータと画像を取得し、Supabaseに保存する統合処理
 */

import { getLatestVersion, fetchItemData, getItemImageUrl } from './riotApi';
import { transformRiotItemToDbItem } from './riotDataTransform';
import { fetchImageAsBlob, resizeAndConvertToWebP } from './imageProcessing';
import { uploadItemImage } from './supabaseStorage';
import { saveItemData, updateItemTimestamp } from './supabaseData';
import { getUnavailableItems } from './constantsData';
import type { RiotItemData } from '../types/item';

export interface SyncResult {
  success: boolean;
  itemId: string;
  error?: string;
}

export interface SyncSummary {
  success: boolean;
  version: string;
  total: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  results: SyncResult[];
}

/**
 * 単一アイテムを同期（画像 + データ）
 * @param itemId アイテムID
 * @param itemData Riot APIから取得したアイテムデータ
 * @param version パッチバージョン
 */
export async function syncSingleItem(
  itemId: string,
  itemData: RiotItemData,
  version: string
): Promise<SyncResult> {
  try {
    console.log(`  Processing ${itemId}...`);

    // 1. 画像を取得・変換・アップロード
    const imageUrl = getItemImageUrl(version, itemId);
    const imageBlob = await fetchImageAsBlob(imageUrl);
    const webpBlob = await resizeAndConvertToWebP(imageBlob, 32, 32, 0.9);

    const uploadResult = await uploadItemImage(itemId, webpBlob);
    if (!uploadResult.success) {
      return {
        success: false,
        itemId,
        error: `Image upload failed: ${uploadResult.error}`
      };
    }

    // 2. データを変換（定数データをDBから取得して反映）
    const dbItem = await transformRiotItemToDbItem(itemId, itemData);
    dbItem.imagePath = `${itemId}.webp`;

    // 3. DBに保存
    const saveResult = await saveItemData(dbItem);
    if (!saveResult.success) {
      return {
        success: false,
        itemId,
        error: `Data save failed: ${saveResult.error}`
      };
    }

    console.log(`  ✓ ${itemId} synced successfully`);
    return { success: true, itemId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`  ✗ ${itemId} failed:`, errorMessage);
    return {
      success: false,
      itemId,
      error: errorMessage
    };
  }
}

/**
 * アイテムが同期対象かどうかを判定
 * @param itemData Riot APIのアイテムデータ
 */
function shouldIncludeItem(itemData: RiotItemData): boolean {
  // 除外条件1: descriptionが空で、かつinStoreがtrueのもの
  if (itemData.description === "" && itemData.inStore) {
    return false;
  }

  // 除外条件2: maps.11とmaps.12がともにfalse（ノーマル・ARAMどちらにも出ない）
  if (itemData.maps && !itemData.maps['11'] && !itemData.maps['12']) {
    return false;
  }

  // 除外条件3: requiredChampionが設定されているもの（チャンピオン専用アイテム）
  if ('requiredChampion' in itemData && itemData.requiredChampion) {
    return false;
  }

  return true;
}

/**
 * 全アイテムを同期（定数データを考慮）
 */
export async function syncAllItems(
  onProgress?: (current: number, total: number, itemId: string) => void
): Promise<SyncSummary> {
  console.log('🔄 Starting item synchronization...\n');

  try {
    // 1. 除外アイテムリストをDBから取得
    const { data: unavailableItems } = await getUnavailableItems();
    const unavailableIds = new Set(unavailableItems?.map(i => i.riotId) || []);
    console.log(`📋 Loaded ${unavailableIds.size} unavailable items from DB`);

    // 2. 最新バージョン取得
    const version = await getLatestVersion();
    console.log(`📦 Latest version: ${version}\n`);

    // 3. アイテムデータ取得
    const apiResponse = await fetchItemData(version);
    const allItemIds = Object.keys(apiResponse.data);
    console.log(`📥 Fetched ${allItemIds.length} items from Riot API\n`);

    // 4. 各アイテムを同期
    const results: SyncResult[] = [];
    let skippedCount = 0;
    let processedCount = 0;

    for (const itemId of allItemIds) {
      const itemData = apiResponse.data[itemId];

      // 除外アイテムはスキップ
      if (unavailableIds.has(itemId)) {
        console.log(`  ⊘ ${itemId} - Skipped (unavailable)`);
        skippedCount++;
        continue;
      }

      // フィルタリング（既存ロジック）
      if (!shouldIncludeItem(itemData)) {
        console.log(`  ⊘ ${itemId} - Skipped (filtered)`);
        skippedCount++;
        continue;
      }

      processedCount++;

      // 進捗コールバック
      if (onProgress) {
        onProgress(processedCount, allItemIds.length - skippedCount, itemId);
      }

      const result = await syncSingleItem(itemId, itemData, version);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log('\n' + '='.repeat(50));
    console.log('📊 Synchronization Summary:');
    console.log(`  Total items from API: ${allItemIds.length}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log(`  Processed: ${results.length}`);
    console.log(`  ✓ Success: ${successCount}`);
    console.log(`  ✗ Failed: ${failedCount}`);
    console.log('='.repeat(50));

    if (failedCount > 0) {
      console.log('\n❌ Failed items:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.itemId}: ${r.error}`);
      });
    }

    return {
      success: failedCount === 0,
      version,
      total: allItemIds.length,
      successCount,
      failedCount,
      skippedCount,
      results
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Synchronization failed:', errorMessage);

    return {
      success: false,
      version: '',
      total: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      results: []
    };
  }
}

/**
 * 単一アイテムの画像を再取得（手動リフレッシュ）
 * @param itemId アイテムID
 * @param version パッチバージョン
 */
export async function refreshItemImage(
  itemId: string,
  version: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔄 Refreshing image for ${itemId}...`);

    // 1. 画像を再取得・変換・アップロード
    const imageUrl = getItemImageUrl(version, itemId);
    const imageBlob = await fetchImageAsBlob(imageUrl);
    const webpBlob = await resizeAndConvertToWebP(imageBlob, 32, 32, 0.9);

    const uploadResult = await uploadItemImage(itemId, webpBlob);
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }

    // 2. updated_atを更新（キャッシュバスト）
    const timestampResult = await updateItemTimestamp(itemId);
    if (!timestampResult.success) {
      return { success: false, error: timestampResult.error };
    }

    console.log(`✓ Image refreshed for ${itemId}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`✗ Failed to refresh image for ${itemId}:`, errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * 複数アイテムの画像を一括リフレッシュ
 * @param itemIds アイテムIDの配列
 * @param version パッチバージョン
 */
export async function refreshMultipleImages(
  itemIds: string[],
  version: string,
  onProgress?: (current: number, total: number, itemId: string) => void
): Promise<{
  success: boolean;
  successCount: number;
  failedCount: number;
  errors: string[];
}> {
  console.log(`🔄 Refreshing ${itemIds.length} images...\n`);

  const errors: string[] = [];
  let successCount = 0;

  for (let i = 0; i < itemIds.length; i++) {
    const itemId = itemIds[i];

    if (onProgress) {
      onProgress(i + 1, itemIds.length, itemId);
    }

    const result = await refreshItemImage(itemId, version);
    if (result.success) {
      successCount++;
    } else {
      errors.push(`${itemId}: ${result.error}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Refresh Summary:');
  console.log(`  Total: ${itemIds.length}`);
  console.log(`  ✓ Success: ${successCount}`);
  console.log(`  ✗ Failed: ${errors.length}`);
  console.log('='.repeat(50));

  return {
    success: errors.length === 0,
    successCount,
    failedCount: errors.length,
    errors
  };
}
