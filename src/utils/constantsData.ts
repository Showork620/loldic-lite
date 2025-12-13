/**
 * 定数データ（除外アイテム、追加タグ、ロール分類）のCRUD操作
 * 管理画面で定数リストを編集するためのユーティリティ
 */

import { supabase } from '../lib/supabase';

// ========== 除外アイテム ==========

/**
 * 全除外アイテムを取得
 */
export async function getUnavailableItems() {
  const { data, error } = await supabase
    .from('unavailable_items')
    .select('*')
    .order('riot_id');

  return { data, error };
}

/**
 * 除外アイテムリストをアイテム名と共に取得
 * Admin画面での表示用
 * itemsテーブルにない場合はRiot APIから取得
 */
export async function getUnavailableItemsWithNames() {
  try {
    // 1. 除外アイテムリストを取得
    const { data: unavailableData, error: unavailableError } = await supabase
      .from('unavailable_items')
      .select('riot_id, reason')
      .order('riot_id');

    if (unavailableError) {
      return { data: null, error: unavailableError.message };
    }

    if (!unavailableData || unavailableData.length === 0) {
      return { data: [], error: null };
    }

    // 2. itemsテーブルから名前を取得
    const riotIds = unavailableData.map(item => item.riot_id);
    const { data: itemsData } = await supabase
      .from('items')
      .select('riot_id, name_ja')
      .in('riot_id', riotIds);

    const itemsMap = new Map(itemsData?.map(item => [item.riot_id, item.name_ja]) || []);

    // 3. 名前が取得できなかったアイテムのIDを抽出
    const missingNameIds = riotIds.filter(id => !itemsMap.has(id));

    // 4. Riot APIから名前を取得（名前がないアイテムのみ）
    if (missingNameIds.length > 0) {
      const { getLatestVersion, fetchItemData } = await import('../utils/riotApi');

      try {
        const version = await getLatestVersion();
        const apiResponse = await fetchItemData(version);

        // Riot APIのデータをマップに追加
        for (const itemId of missingNameIds) {
          const apiItem = apiResponse.data[itemId];
          if (apiItem && apiItem.name) {
            itemsMap.set(itemId, apiItem.name);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch names from Riot API:', error);
        // エラーが発生してもスキップして続行
      }
    }

    // 5. 結果を整形
    const formatted = unavailableData.map(item => ({
      riot_id: item.riot_id,
      name_ja: itemsMap.get(item.riot_id) || null,
      reason: item.reason
    }));

    return { data: formatted, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 除外アイテムを追加
 */
export async function addUnavailableItem(riotId: string, reason?: string) {
  const { error } = await supabase
    .from('unavailable_items')
    .insert({ riot_id: riotId, reason });

  return { success: !error, error };
}

/**
 * 除外アイテムを削除
 */
export async function removeUnavailableItem(riotId: string) {
  const { error } = await supabase
    .from('unavailable_items')
    .delete()
    .eq('riot_id', riotId);

  return { success: !error, error };
}

/**
 * 除外アイテムの理由を更新
 */
export async function updateUnavailableItemReason(riotId: string, reason: string) {
  const { error } = await supabase
    .from('unavailable_items')
    .update({ reason, updated_at: new Date().toISOString() })
    .eq('riot_id', riotId);

  return { success: !error, error };
}

// ========== 追加タグ ==========

/**
 * 特定アイテムの追加タグを取得
 */
export async function getAdditionalTagsByItem(riotId: string) {
  const { data, error } = await supabase
    .from('additional_tags')
    .select('tag')
    .eq('riot_id', riotId);

  return { data: data?.map(d => d.tag) || [], error };
}

/**
 * 全追加タグを取得
 */
export async function getAllAdditionalTags() {
  const { data, error } = await supabase
    .from('additional_tags')
    .select('*')
    .order('riot_id');

  return { data, error };
}

/**
 * 追加タグを追加
 */
export async function addAdditionalTag(riotId: string, tag: string) {
  const { error } = await supabase
    .from('additional_tags')
    .insert({ riot_id: riotId, tag });

  return { success: !error, error };
}

/**
 * 追加タグを削除
 */
export async function removeAdditionalTag(riotId: string, tag: string) {
  const { error } = await supabase
    .from('additional_tags')
    .delete()
    .eq('riot_id', riotId)
    .eq('tag', tag);

  return { success: !error, error };
}

/**
 * アイテムの全追加タグを削除
 */
export async function removeAllAdditionalTagsForItem(riotId: string) {
  const { error } = await supabase
    .from('additional_tags')
    .delete()
    .eq('riot_id', riotId);

  return { success: !error, error };
}

// ========== ロール分類 ==========

/**
 * 特定アイテムのロール分類を取得
 */
export async function getRolesByItem(riotId: string) {
  const { data, error } = await supabase
    .from('role_items')
    .select('role')
    .eq('riot_id', riotId);

  return { data: data?.map(d => d.role) || [], error };
}

/**
 * 特定ロールのアイテムIDリストを取得
 */
export async function getItemsByRole(role: string) {
  const { data, error } = await supabase
    .from('role_items')
    .select('riot_id')
    .eq('role', role);

  return { data: data?.map(d => d.riot_id) || [], error };
}

/**
 * 全ロール分類を取得
 */
export async function getAllRoleItems() {
  const { data, error } = await supabase
    .from('role_items')
    .select('*')
    .order('role');

  return { data, error };
}

/**
 * ロール分類を追加
 */
export async function addRoleItem(role: string, riotId: string) {
  const { error } = await supabase
    .from('role_items')
    .insert({ role, riot_id: riotId });

  return { success: !error, error };
}

/**
 * ロール分類を削除
 */
export async function removeRoleItem(role: string, riotId: string) {
  const { error } = await supabase
    .from('role_items')
    .delete()
    .eq('role', role)
    .eq('riot_id', riotId);

  return { success: !error, error };
}

/**
 * アイテムの全ロール分類を削除
 */
export async function removeAllRolesForItem(riotId: string) {
  const { error } = await supabase
    .from('role_items')
    .delete()
    .eq('riot_id', riotId);

  return { success: !error, error };
}

/**
 * 特定ロールの全アイテムを削除
 */
export async function removeAllItemsForRole(role: string) {
  const { error } = await supabase
    .from('role_items')
    .delete()
    .eq('role', role);

  return { success: !error, error };
}

// ========== ユーティリティ ==========

/**
 * 利用可能なロール一覧を取得
 */
export async function getAvailableRoles(): Promise<string[]> {
  const { data, error } = await supabase
    .from('role_items')
    .select('role')
    .order('role');

  if (error || !data) {
    return [];
  }

  // 重複を除去
  return [...new Set(data.map(d => d.role))];
}

// ========== 統合反映機能 ==========

/**
 * 定数テーブル（unavailable_items、additional_tags、role_items）の変更を
 * itemsテーブルに一括反映する
 * Admin画面の「反映」ボタンで実行
 * バッチ並列処理で高速化
 */
export async function applyConstantChangesToItems(): Promise<{
  success: boolean;
  added: number;
  deleted: number;
  updated: number;
  errors: string[];
}> {
  console.log('🔄 Applying constant changes to items table...\n');

  const errors: string[] = [];
  let added = 0;
  let deleted = 0;
  let updated = 0;

  try {
    // 1. 現在のitemsテーブルの全アイテムを取得
    const { data: currentItems, error: fetchError } = await supabase
      .from('items')
      .select('riot_id');

    if (fetchError) {
      errors.push(`Failed to fetch current items: ${fetchError.message}`);
      return { success: false, added, deleted, updated, errors };
    }

    const currentItemIds = new Set(currentItems?.map(i => i.riot_id) || []);

    // 2. 除外アイテムリストを取得
    const { data: unavailableItems } = await getUnavailableItems();
    const unavailableIds = new Set(unavailableItems?.map(i => i.riot_id) || []);

    // 3. 除外されたアイテムをitemsテーブルから削除（並列処理）
    const itemsToDelete = Array.from(currentItemIds).filter(id => unavailableIds.has(id));

    if (itemsToDelete.length > 0) {
      console.log(`  🗑️ Deleting ${itemsToDelete.length} items...`);

      const BATCH_SIZE = 20;
      for (let i = 0; i < itemsToDelete.length; i += BATCH_SIZE) {
        const batch = itemsToDelete.slice(i, i + BATCH_SIZE);

        const deletePromises = batch.map(async (itemId) => {
          const { error: deleteError } = await supabase
            .from('items')
            .delete()
            .eq('riot_id', itemId);

          if (deleteError) {
            errors.push(`Failed to delete ${itemId}: ${deleteError.message}`);
            return { success: false, itemId };
          }
          return { success: true, itemId };
        });

        const results = await Promise.all(deletePromises);
        deleted += results.filter(r => r.success).length;
      }

      console.log(`    ✓ Deleted ${deleted}/${itemsToDelete.length} items`);
    }

    // 4. 除外解除されたアイテムをitemsテーブルに追加
    // (syncSpecificItemsを使用 - 既に並列処理済み)
    const { syncSpecificItems } = await import('./itemSync');
    const itemsToAdd = Array.from(unavailableIds)
      .filter(id => !currentItemIds.has(id));

    if (itemsToAdd.length > 0) {
      console.log(`\n  📥 Adding ${itemsToAdd.length} items...`);
      const syncResult = await syncSpecificItems(itemsToAdd);
      added = syncResult.successCount;

      if (!syncResult.success) {
        syncResult.results
          .filter(r => !r.success)
          .forEach(r => errors.push(`Failed to add ${r.itemId}: ${r.error}`));
      }
    }

    // 5. タグとロールの更新（並列処理）
    console.log('\n  🏷️ Updating tags and roles...');

    const itemsToUpdate = Array.from(currentItemIds).filter(id => !unavailableIds.has(id));

    if (itemsToUpdate.length > 0) {
      const BATCH_SIZE = 20;
      for (let i = 0; i < itemsToUpdate.length; i += BATCH_SIZE) {
        const batch = itemsToUpdate.slice(i, i + BATCH_SIZE);

        const updatePromises = batch.map(async (itemId) => {
          try {
            // ロールの取得
            const { data: roles } = await getRolesByItem(itemId);

            // itemsテーブルのrole_categoriesを更新
            const { error: updateError } = await supabase
              .from('items')
              .update({
                role_categories: roles.length > 0 ? roles : null
              })
              .eq('riot_id', itemId);

            if (updateError) {
              errors.push(`Failed to update ${itemId}: ${updateError.message}`);
              return { success: false, itemId };
            }
            return { success: true, itemId };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Failed to update ${itemId}: ${errorMessage}`);
            return { success: false, itemId };
          }
        });

        const results = await Promise.all(updatePromises);
        updated += results.filter(r => r.success).length;

        console.log(`    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(itemsToUpdate.length / BATCH_SIZE)} completed (${updated}/${itemsToUpdate.length})`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Apply Changes Summary:');
    console.log(`  ➕ Added: ${added}`);
    console.log(`  🗑️ Deleted: ${deleted}`);
    console.log(`  🔄 Updated: ${updated}`);
    console.log(`  ❌ Errors: ${errors.length}`);
    console.log('='.repeat(50));

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    return {
      success: errors.length === 0,
      added,
      deleted,
      updated,
      errors
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMessage);
    return { success: false, added, deleted, updated, errors };
  }
}
