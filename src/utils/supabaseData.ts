/**
 * Supabase DBデータ操作ユーティリティ
 * アイテムデータの保存、更新、取得を管理
 */

import { supabase } from '../lib/supabase';
import type { NewItem } from '../db/schema';
import { toSnakeCase } from './caseConverter';

/**
 * アイテムデータをDBに保存（upsert）
 * @param itemData アイテムデータ
 * @returns 保存結果
 */
export async function saveItemData(
  itemData: Omit<NewItem, 'id' | 'createdAt'>
): Promise<{ success: boolean; error?: string }> {
  try {
    // camelCaseからsnake_caseに変換
    const dataToSave = toSnakeCase(itemData);

    const { error } = await supabase
      .from('items')
      .upsert(dataToSave, {
        onConflict: 'riot_id', // riot_idが重複した場合は更新
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Save error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Save failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 複数アイテムを一括保存
 * @param items アイテムデータ配列
 * @returns 保存結果
 */
export async function saveMultipleItems(
  items: Omit<NewItem, 'id' | 'createdAt'>[]
): Promise<{
  success: boolean;
  successCount: number;
  failedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let successCount = 0;

  for (const item of items) {
    const result = await saveItemData(item);
    if (result.success) {
      successCount++;
    } else {
      errors.push(`${item.riotId}: ${result.error}`);
    }
  }

  return {
    success: errors.length === 0,
    successCount,
    failedCount: errors.length,
    errors
  };
}

/**
 * アイテムのupdated_atを更新（キャッシュバスト用）
 * @param riotId アイテムのRiot ID
 */
export async function updateItemTimestamp(
  riotId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('items')
      .update({ updated_at: new Date().toISOString() })  // snake_caseを使用
      .eq('riot_id', riotId);  // snake_caseを使用

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
 * 全アイテムを取得
 */
export async function getAllItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('riot_id', { ascending: true });  // snake_caseを使用

  if (error) {
    console.error('Fetch error:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * 特定アイテムを取得
 * @param riotId アイテムのRiot ID
 */
export async function getItemByRiotId(riotId: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('riot_id', riotId)  // snake_caseを使用
    .single();

  if (error) {
    console.error('Fetch error:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * アイテムを削除
 * @param riotId アイテムのRiot ID
 */
export async function deleteItem(riotId: string) {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('riot_id', riotId);  // snake_caseを使用

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 利用可能なアイテムのみを取得
 */
export async function getAvailableItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('is_available', true)  // snake_caseを使用
    .order('riot_id', { ascending: true });  // snake_caseを使用

  if (error) {
    console.error('Fetch error:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * 特定ロールのアイテムを取得
 * @param role ロール名（例: "ファイター用"）
 */
export async function getItemsByRole(role: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .contains('role_categories', [role])  // snake_caseを使用
    .order('riot_id', { ascending: true });  // snake_caseを使用

  if (error) {
    console.error('Fetch error:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * 特定アイテムのis_availableを更新
 * @param riotId アイテムのRiot ID
 * @param isAvailable 
 */
export async function updateItemAvailability(
  riotId: string,
  isAvailable: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('items')
      .update({ is_available: isAvailable })
      .eq('riot_id', riotId);

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
 * 特定アイテムのsearch_tagsを更新
 * @param riotId アイテムのRiot ID
 * @param tags 新しいタグ配列
 */
export async function updateItemTags(
  riotId: string,
  tags: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('items')
      .update({ search_tags: tags })
      .eq('riot_id', riotId);

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
 * 特定アイテムのrole_categoriesを更新
 * @param riotId アイテムのRiot ID
 * @param roles 新しいロール配列
 */
export async function updateItemRoles(
  riotId: string,
  roles: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('items')
      .update({ role_categories: roles.length > 0 ? roles : null })
      .eq('riot_id', riotId);

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

