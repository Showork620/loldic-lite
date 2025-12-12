/**
 * 定数データをSupabaseに投入するスクリプト
 * 既存の constants/riotApi.ts のデータをDBに移行する
 */

import { supabase } from '../lib/supabase';
import {
  UNAVAILABLE_ITEMS,
  ADDITIONAL_TAGS,
  ITEMS_ROLE
} from '../constants/riotApi';

/**
 * 除外アイテムリストをDBに投入
 */
export async function seedUnavailableItems(): Promise<boolean> {
  try {
    const data = UNAVAILABLE_ITEMS.map(riotId => ({
      riot_id: riotId,
      reason: null // 理由は後で管理画面で編集
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
    const data = [];

    for (const [riotId, tags] of Object.entries(ADDITIONAL_TAGS)) {
      for (const tag of tags) {
        data.push({ riot_id: riotId, tag });
      }
    }

    // Supabaseのupsertは複合キーに対応していないため、個別に処理
    for (const item of data) {
      const { error } = await supabase
        .from('additional_tags')
        .upsert(item, { onConflict: 'riot_id,tag', ignoreDuplicates: true });

      if (error) {
        console.error(`Failed to insert tag ${item.tag} for ${item.riot_id}:`, error);
      }
    }

    console.log(`✓ Seeded ${data.length} additional tags`);
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
    const data = [];

    for (const [role, itemIds] of Object.entries(ITEMS_ROLE)) {
      for (const itemId of itemIds) {
        data.push({
          role,
          riot_id: String(itemId)
        });
      }
    }

    // 個別に処理
    for (const item of data) {
      const { error } = await supabase
        .from('role_items')
        .upsert(item, { onConflict: 'role,riot_id', ignoreDuplicates: true });

      if (error) {
        console.error(`Failed to insert role ${item.role} for ${item.riot_id}:`, error);
      }
    }

    console.log(`✓ Seeded ${data.length} role items`);
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
