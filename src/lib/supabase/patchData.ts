/**
 * パッチバージョン管理のためのSupabase DB操作ユーティリティ
 */

import { supabase } from '../supabase';
import type { NewPatchVersion, NewPatchBaselineData, NewPatchItemsDiff } from '../../db/schema';
import { toSnakeCase, toCamelCase } from '../../utils/caseConverter';

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

  return { data: data ? toCamelCase(data) : null, error: null };
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

/**
 * v16.1.1基準データを取得
 * @param patchVersion 基準パッチバージョン（デフォルト: "16.1.1"）
 */
export async function getBaselineData(patchVersion: string = '16.1.1') {
  const { data, error } = await supabase
    .from('patch_baseline_data')
    .select('*')
    .eq('patch_version', patchVersion);

  if (error) {
    console.error('Fetch baseline data error:', error);
    return { data: null, error: error.message };
  }

  return { data: data ? data.map(toCamelCase) : [], error: null };
}

/**
 * v16.1.1基準データを一括保存
 * @param items 基準アイテムデータ配列
 */
export async function saveBaselineData(
  items: Omit<NewPatchBaselineData, 'id' | 'createdAt'>[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const dataToSave = items.map(item => toSnakeCase(item)) as any;

    const { error } = await supabase
      .from('patch_baseline_data')
      .insert(dataToSave);

    if (error) {
      console.error('Save baseline data error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Save baseline data failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 特定パッチの差分データを取得
 * @param patchVersion パッチバージョン
 */
export async function getItemsDiffByPatch(patchVersion: string) {
  const { data, error } = await supabase
    .from('patch_items_diff')
    .select('*')
    .eq('patch_version', patchVersion);

  if (error) {
    console.error('Fetch items diff error:', error);
    return { data: null, error: error.message };
  }

  return { data: data ? data.map(toCamelCase) : [], error: null };
}

/**
 * アイテム差分を保存
 * @param diffItems 差分アイテムデータ配列
 */
export async function saveItemsDiff(
  diffItems: Omit<NewPatchItemsDiff, 'id' | 'createdAt'>[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const dataToSave = diffItems.map(item => toSnakeCase(item)) as any;

    const { error } = await supabase
      .from('patch_items_diff')
      .upsert(dataToSave, {
        onConflict: 'patch_version,riot_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Save items diff error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Save items diff failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 特定パッチでのアイテムのItemDataを取得
 * 基準データ + 差分で再構築
 * @param patchVersion パッチバージョン
 * @param riotId アイテムのRiot ID
 */
export async function getItemDataForPatch(
  patchVersion: string,
  riotId: string
) {
  // まず差分データを確認
  const { data: diffData } = await supabase
    .from('patch_items_diff')
    .select('*')
    .eq('patch_version', patchVersion)
    .eq('riot_id', riotId)
    .single();

  if (diffData) {
    return { data: toCamelCase(diffData), error: null };
  }

  // 差分がない場合は基準データを返す
  const { data: baselineData, error: baselineError } = await supabase
    .from('patch_baseline_data')
    .select('*')
    .eq('patch_version', '16.1.1')
    .eq('riot_id', riotId)
    .single();

  if (baselineError) {
    console.error('Fetch item data error:', baselineError);
    return { data: null, error: baselineError.message };
  }

  return { data: baselineData ? toCamelCase(baselineData) : null, error: null };
}
