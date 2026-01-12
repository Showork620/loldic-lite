/**
 * パッチバージョン管理のビジネスロジック
 */

import { getLatestVersion } from './riotApi';
import {
  getPatchVersion,
  updatePatchVersion,
  saveItemsDiff
} from '../supabase/patchData';
import type { NewItem } from '../../db/schema';

const RATE_LIMIT_MS = 60 * 1000; // 1分

/**
 * 最後のチェックから1分以上経過しているか確認
 */
export async function shouldFetchLatestPatch(): Promise<boolean> {
  const { data } = await getPatchVersion();

  if (!data) {
    return true; // レコードがない場合は取得  
  }

  const lastCheckedAt = new Date(data.lastCheckedAt).getTime();
  const now = Date.now();

  return (now - lastCheckedAt) >= RATE_LIMIT_MS;
}

/**
 * Riot APIから最新パッチを取得（1分制限付き）
 * @returns { currentPatch, latestPatch, shouldUpdate }
 */
export async function checkForUpdates(): Promise<{
  currentPatch: string | null;
  latestPatch: string;
  shouldUpdate: boolean;
  error?: string;
}> {
  try {
    // DBから現在のパッチを取得
    const { data: patchData } = await getPatchVersion();
    const currentPatch = patchData?.currentPatch || null;

    // レート制限チェック
    const shouldFetch = await shouldFetchLatestPatch();

    let latestPatch: string;

    if (shouldFetch) {
      // Riot APIから最新パッチを取得
      latestPatch = await getLatestVersion();

      // last_checked_atを更新
      await updatePatchVersion({
        currentPatch: currentPatch || latestPatch,
        lastCheckedAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`✅ Riot APIから最新パッチを取得: ${latestPatch}`);
    } else {
      // キャッシュされたデータを使用（1分以内）
      latestPatch = currentPatch || await getLatestVersion();
      console.log('⏱️ 前回チェックから1分未満のためキャッシュを使用');
    }

    const shouldUpdate = currentPatch !== null && currentPatch !== latestPatch;

    return {
      currentPatch,
      latestPatch,
      shouldUpdate
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return {
      currentPatch: null,
      latestPatch: '16.1.1', // フォールバック
      shouldUpdate: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 新しいパッチバージョンをDBに保存
 * @param newPatch 新しいパッチバージョン
 */
export async function savePatchVersion(newPatch: string): Promise<{ success: boolean; error?: string }> {
  return updatePatchVersion({
    currentPatch: newPatch,
    lastCheckedAt: new Date(),
    updatedAt: new Date()
  });
}

/**
 * 2つのアイテムデータセットを比較して差分を計算
 * @param baselineItems 基準アイテムデータ（v16.1.1）
 * @param newItems 新しいアイテムデータ
 * @param newPatchVersion 新しいパッチバージョン
 * @returns 差分アイテムの配列
 */
export function calculateItemDiff(
  baselineItems: Record<string, NewItem>,
  newItems: Record<string, NewItem>,
  newPatchVersion: string
) {
  const diffItems = [];

  // 新規追加 or 変更されたアイテムを検出
  for (const [riotId, newItem] of Object.entries(newItems)) {
    const baselineItem = baselineItems[riotId];

    if (!baselineItem) {
      // 新規追加
      diffItems.push({
        patchVersion: newPatchVersion,
        riotId,
        itemData: newItem
      });
    } else {
      // 変更検出（単純な文字列比較）
      const hasChanged = JSON.stringify(baselineItem) !== JSON.stringify(newItem);
      if (hasChanged) {
        diffItems.push({
          patchVersion: newPatchVersion,
          riotId,
          itemData: newItem
        });
      }
    }
  }

  return diffItems;
}

/**
 * パッチアイテムの差分データをDBに保存
 * @param diffItems 差分アイテムデータ
 */
export async function savePatchItemsDiff(
  diffItems: { patchVersion: string; riotId: string; itemData: any }[]
): Promise<{ success: boolean; error?: string }> {
  if (diffItems.length === 0) {
    return { success: true };
  }

  return saveItemsDiff(diffItems);
}
