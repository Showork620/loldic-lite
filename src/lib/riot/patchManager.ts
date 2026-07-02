/**
 * パッチバージョン管理のビジネスロジック
 */

import { getLatestVersion } from './riotApi';
import { getPatchVersion, updatePatchVersion } from '../supabase/patchData';

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
