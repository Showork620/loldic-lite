/**
 * Supabase Storage操作ユーティリティ
 * アイテム画像のアップロード、URL取得、削除を管理
 */

import { supabase } from '../supabase';

const STORAGE_BUCKET = 'item-images';
const CACHE_CONTROL = '604800'; // 1週間（7日 × 24時間 × 3600秒）

/**
 * アイテム画像をSupabase Storageにアップロード
 * @param itemId アイテムID（例: "3001"）
 * @param blob 画像Blob（WebP形式）
 * @returns アップロード結果
 */
export async function uploadItemImage(
  itemId: string,
  blob: Blob
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const fileName = `${itemId}.webp`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, blob, {
        contentType: 'image/webp',
        cacheControl: CACHE_CONTROL,
        upsert: true // 既存ファイルを上書き
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (error) {
    console.error('Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * アイテム画像の公開URLを取得
 * @param imagePath 画像パス（例: "3001.webp"）
 * @param timestamp キャッシュバスティング用タイムスタンプ（Date型またはミリ秒）
 * @returns 公開URL
 */
export function getItemImagePublicUrl(
  imagePath: string,
  timestamp?: number | Date
): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(imagePath);

  // タイムスタンプでキャッシュバスト
  if (timestamp) {
    const ts = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return `${data.publicUrl}?t=${ts}`;
  }

  return data.publicUrl;
}

/**
 * アイテム画像を削除
 * @param imagePath 画像パス（例: "3001.webp"）
 */
export async function deleteItemImage(
  imagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([imagePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 複数アイテムの画像を一括削除
 * @param imagePaths 画像パスの配列
 */
export async function deleteMultipleItemImages(
  imagePaths: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(imagePaths);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Storage内の全画像をリスト表示
 */
export async function listAllImages() {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list();

  if (error) {
    console.error('List error:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
