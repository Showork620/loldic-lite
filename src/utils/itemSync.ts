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
 * 指定されたアイテムIDのみを部分同期
 * Admin画面での除外解除や新規除外時に使用
 * @param itemIds 同期対象のアイテムIDリスト
 * @param version パッチバージョン（省略時は最新）
 */
export async function syncSpecificItems(
  itemIds: string[],
  version?: string
): Promise<SyncSummary> {
  console.log(`🔄 Starting specific item synchronization for ${itemIds.length} items...\\n`);

  try {
    // バージョン取得
    const patchVersion = version || await getLatestVersion();
    console.log(`📦 Using version: ${patchVersion}\\n`);

    // アイテムデータ取得
    const apiResponse = await fetchItemData(patchVersion);

    const results: SyncResult[] = [];
    let skippedCount = 0;

    for (const itemId of itemIds) {
      const itemData = apiResponse.data[itemId];

      if (!itemData) {
        console.log(`  ⊘ ${itemId} - Skipped (not found in API)`);
        skippedCount++;
        continue;
      }

      const result = await syncSingleItem(itemId, itemData, patchVersion);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log('\\n' + '='.repeat(50));
    console.log('📊 Specific Synchronization Summary:');
    console.log(`  Total items requested: ${itemIds.length}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log(`  Processed: ${results.length}`);
    console.log(`  ✓ Success: ${successCount}`);
    console.log(`  ✗ Failed: ${failedCount}`);
    console.log('='.repeat(50));

    if (failedCount > 0) {
      console.log('\\n❌ Failed items:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.itemId}: ${r.error}`);
      });
    }

    return {
      success: failedCount === 0,
      version: patchVersion,
      total: itemIds.length,
      successCount,
      failedCount,
      skippedCount,
      results
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\\n❌ Specific synchronization failed:', errorMessage);

    return {
      success: false,
      version: version || '',
      total: itemIds.length,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      results: []
    };
  }
}


/**
 * 全アイテムを同期（定数データを考慮）
 * バッチ並列処理で高速化
 */
export async function syncAllItems(
  onProgress?: (current: number, total: number, itemId: string) => void
): Promise<SyncSummary> {
  console.log('🔄 Starting item synchronization...\\n');

  try {
    // 1. 除外アイテムリストをDBから取得
    const { data: unavailableItems } = await getUnavailableItems();
    const unavailableIds = new Set(unavailableItems?.map(i => i.riotId) || []);
    console.log(`📋 Loaded ${unavailableIds.size} unavailable items from DB`);

    // 2. 最新バージョン取得
    const version = await getLatestVersion();
    console.log(`📦 Latest version: ${version}\\n`);

    // 3. アイテムデータ取得
    const apiResponse = await fetchItemData(version);
    const allItemIds = Object.keys(apiResponse.data);
    console.log(`📥 Fetched ${allItemIds.length} items from Riot API\\n`);

    // 4. フィルタリング：除外アイテムを除く
    const itemsToSync = allItemIds.filter(itemId => !unavailableIds.has(itemId));
    const skippedCount = allItemIds.length - itemsToSync.length;

    console.log(`⊘ Skipped ${skippedCount} unavailable items`);
    console.log(`✓ Processing ${itemsToSync.length} items\\n`);

    // 5. バッチ並列処理
    const BATCH_SIZE = 20; // 一度に20アイテム並列処理
    const results: SyncResult[] = [];
    let processedCount = 0;

    for (let i = 0; i < itemsToSync.length; i += BATCH_SIZE) {
      const batch = itemsToSync.slice(i, i + BATCH_SIZE);

      // バッチ内を並列処理
      const batchPromises = batch.map(async (itemId) => {
        const itemData = apiResponse.data[itemId];

        // 進捗コールバック
        if (onProgress) {
          onProgress(processedCount + 1, itemsToSync.length, itemId);
        }

        return await syncSingleItem(itemId, itemData, version);
      });

      // バッチ完了を待つ
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      processedCount += batch.length;

      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(itemsToSync.length / BATCH_SIZE)} completed (${processedCount}/${itemsToSync.length})`);
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log('\\n' + '='.repeat(50));
    console.log('📊 Synchronization Summary:');
    console.log(`  Total items from API: ${allItemIds.length}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log(`  Processed: ${results.length}`);
    console.log(`  ✓ Success: ${successCount}`);
    console.log(`  ✗ Failed: ${failedCount}`);
    console.log('='.repeat(50));

    if (failedCount > 0) {
      console.log('\\n❌ Failed items:');
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
    console.error('\\n❌ Synchronization failed:', errorMessage);

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
