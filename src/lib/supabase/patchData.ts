/**
 * パッチバージョン管理のためのSupabase DB操作ユーティリティ
 */

import { supabase } from '../supabase';
import type { NewPatchVersion } from '../../db/schema';

/**
 * 現在のパッチバージョンを取得
 */
export async function getPatchVersion() {
  const { data, error } = await supabase
    .from('patch_versions')
    .select('*')
    .single();

  if (error) {
    // レコードが存在しない場合はnullを返す
    if (error.code === 'PGRST116') {
      return { data: null, error: null };
    }
    console.error('Fetch patch version error:', error);
    return { data: null, error: error.message };
  }

  return {
    data: data
      ? {
          currentPatch: data.current_patch as string,
          lastCheckedAt: data.last_checked_at as string,
          updatedAt: data.updated_at as string,
        }
      : null,
    error: null,
  };
}

/**
 * パッチバージョンを更新/作成
 * @param patchData パッチバージョンデータ
 */
export async function updatePatchVersion(
  patchData: Omit<NewPatchVersion, 'id' | 'createdAt'>
): Promise<{ success: boolean; error?: string }> {
  try {
    // 直接スネークケースでデータを構築（toSnakeCaseはNewItem専用のため使用しない）
    const dataToSave = {
      current_patch: patchData.currentPatch,
      last_checked_at: patchData.lastCheckedAt.toISOString(),
      updated_at: (patchData.updatedAt || new Date()).toISOString()
    };

    // patch_versionsテーブルは単一レコードなので、最初に既存レコードを削除
    await supabase.from('patch_versions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { error } = await supabase
      .from('patch_versions')
      .insert(dataToSave);

    if (error) {
      console.error('Update patch version error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update patch version failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
