/**
 * 定数データをSupabaseに投入するスクリプト
 * 既存の constants/riotApi.ts のデータをDBに移行する
 */

import { supabase } from '../lib/supabase';
import { getLatestVersion, fetchItemData, getUnavailableItemIds } from '../utils/riotApi';
import {
  ADDITIONAL_TAGS,
  ITEMS_ROLE
} from '../constants/riotApi';

/**
 * 除外アイテムリストをDBに投入
 */
export async function seedUnavailableItems(): Promise<boolean> {
  try {
    // Riot APIから最新データを取得
    const version = await getLatestVersion();
    const apiResponse = await fetchItemData(version);

    // ルールベースで除外アイテムIDリスト（と理由）を生成
    const unavailable = getUnavailableItemIds(apiResponse.data);

    const data = unavailable.map((item: { riotId: string; reason: string | null }) => ({
      riot_id: item.riotId,
      reason: item.reason // ルールで推定した理由を初期値として入れる
    }));

    const { error } = await supabase
      .from('unavailable_items')
      .upsert(data, { onConflict: 'riot_id' });

    if (error) {
      console.error('Failed to seed unavailable items:', error);
      return false;
    }

    console.log(`✓ Seeded ${data.length} unavailable items`);
    return true;
  } catch (error) {
    console.error('Error seeding unavailable items:', error);
    return false;
  }
}

/**
 * 追加タグをDBに投入
 */
export async function seedAdditionalTags(): Promise<boolean> {
  try {
    // 既存データを取得
    const { data: existing } = await supabase
      .from('additional_tags')
      .select('riot_id, tag');

    const existingSet = new Set(
      existing?.map(item => `${item.riot_id}:${item.tag}`) || []
    );

    const data = [];
    for (const [riotId, tags] of Object.entries(ADDITIONAL_TAGS)) {
      for (const tag of tags) {
        const key = `${riotId}:${tag}`;
        if (!existingSet.has(key)) {
          data.push({ riot_id: riotId, tag });
        }
      }
    }

    if (data.length > 0) {
      const { error } = await supabase
        .from('additional_tags')
        .insert(data);

      if (error) {
        console.error('Failed to seed additional tags:', error);
        return false;
      }
    }

    console.log(`✓ Seeded ${data.length} additional tags (${existingSet.size} already existed)`);
    return true;
  } catch (error) {
    console.error('Error seeding additional tags:', error);
    return false;
  }
}

/**
 * ロール分類をDBに投入
 */
export async function seedRoleItems(): Promise<boolean> {
  try {
    // 既存データを取得
    const { data: existing } = await supabase
      .from('role_items')
      .select('role, riot_id');

    const existingSet = new Set(
      existing?.map(item => `${item.role}:${item.riot_id}`) || []
    );

    const data = [];
    for (const [role, itemIds] of Object.entries(ITEMS_ROLE)) {
      for (const itemId of itemIds) {
        const key = `${role}:${String(itemId)}`;
        if (!existingSet.has(key)) {
          data.push({
            role,
            riot_id: String(itemId)
          });
        }
      }
    }

    if (data.length > 0) {
      const { error } = await supabase
        .from('role_items')
        .insert(data);

      if (error) {
        console.error('Failed to seed role items:', error);
        return false;
      }
    }

    console.log(`✓ Seeded ${data.length} role items (${existingSet.size} already existed)`);
    return true;
  } catch (error) {
    console.error('Error seeding role items:', error);
    return false;
  }
}

/**
 * 全定数データを一括投入
 */
export async function seedAllConstants(): Promise<{
  success: boolean;
  unavailableItems: boolean;
  additionalTags: boolean;
  roleItems: boolean;
}> {
  console.log('🌱 Starting constant data seeding...\n');

  const unavailableItemsResult = await seedUnavailableItems();
  const additionalTagsResult = await seedAdditionalTags();
  const roleItemsResult = await seedRoleItems();

  const allSuccess = unavailableItemsResult && additionalTagsResult && roleItemsResult;

  if (allSuccess) {
    console.log('\n✅ All constant data seeded successfully');
  } else {
    console.error('\n❌ Some constant data failed to seed');
  }

  return {
    success: allSuccess,
    unavailableItems: unavailableItemsResult,
    additionalTags: additionalTagsResult,
    roleItems: roleItemsResult
  };
}
