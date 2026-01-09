import { getLatestVersion, fetchItemData, getItemImageUrl } from './riotApi';
import { resizeAndConvertToWebP, fetchImageAsBlob } from './imageProcessing';
import { uploadItemImage } from './supabaseStorage';

type ProgressCallback = (processed: number, total: number, message: string) => void;

/**
 * 全アイテムの画像を更新する
 * 1. 最新バージョン取得
 * 2. 全アイテムデータ取得
 * 3. 各アイテムについて画像を取得・圧縮・アップロード
 * 
 * 注意: この関数は画像のみをアップロードします。
 * アイテムデータの管理はExclusionManagerで行います。
 * 
 * @param onProgress 進捗更新用のコールバック
 */
export async function updateAllItemImages(onProgress?: ProgressCallback): Promise<void> {
  try {
    if (onProgress) onProgress(0, 0, 'Fetching version...');
    const version = await getLatestVersion();

    if (onProgress) onProgress(0, 0, `Fetching items for version ${version}...`);
    const riotData = await fetchItemData(version);
    const items = riotData.data;
    const itemIds = Object.keys(items);
    const total = itemIds.length;


    console.log(`Starting image update for ${total} items (Version: ${version})`);

    let processed = 0;
    // 並列処理数を制限しながら実行（ブラウザの負荷軽減とレート制限回避のため）
    const CONCURRENCY_LIMIT = 5;

    for (let i = 0; i < total; i += CONCURRENCY_LIMIT) {
      const chunk = itemIds.slice(i, i + CONCURRENCY_LIMIT);

      await Promise.all(chunk.map(async (itemId) => {
        try {
          const imageUrl = getItemImageUrl(version, itemId);

          // 画像をfetchしてBlobにする
          const imageBlob = await fetchImageAsBlob(imageUrl);

          // 圧縮・WebP変換
          // 64x64で品質0.9に設定
          const webpBlob = await resizeAndConvertToWebP(imageBlob, 64, 64, 0.9);

          // Upload
          await uploadItemImage(itemId, webpBlob);

        } catch (err) {
          console.error(`Failed to process image for item ${itemId}:`, err);
          // 1つの失敗で全体を止めない
        }
      }));

      processed += chunk.length;
      if (onProgress) {
        onProgress(Math.min(processed, total), total, `Processed ${Math.min(processed, total)}/${total} images...`);
      }
    }

    if (onProgress) onProgress(total, total, 'Completed!');

  } catch (error) {
    console.error('Error updating images:', error);
    throw error;
  }
}
