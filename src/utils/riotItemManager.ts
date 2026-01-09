
import { type RiotAPIResponse, type RawRiotItemData } from '../types/item';
import { supabase } from '../lib/supabase';
import { getUnavailableItemIds } from './riotApi';
// Note: schema.ts export adjustments needed if Database type is not exported directly, usually inference is better for Drizzle but here we use Supabase client directly or Drizzle. Let's use Drizzle generally but for bulk ops Supabase direct might be easier if we don't have bulk upsert in utils yet. However user said "SupabaseData.ts" exists. Let's check that first.
// Checking file availability from previous context - src/utils/supabaseData.ts exists.
// Re-reading context...
// I will write this file assuming standard Supabase client usage or Drizzle usage if mapped.
// Let's stick to simple logic first.

export interface ProcessedItem {
  riotId: string;
  name: string;
  imagePath: string;
  isNew: boolean;
  isNonPurchasable: boolean;
  category: 'available' | 'manualSettings' | 'autoExcluded';
  isManuallyAvailable: boolean | null; // manual_settingsのisAvailableフラグ（手動設定がある場合のみ）
  reason: string | null;
  maps: number[];
  raw: RawRiotItemData;
}

export interface ProcessingResult {
  availableItems: ProcessedItem[];        // 自動除外ルールに該当せず、manual_settingsにも未登録
  manualSettingsItems: ProcessedItem[];   // manual_settingsに登録されている全アイテム
  autoExcludedItems: ProcessedItem[];     // 自動除外ルールに該当し、manual_settingsで有効化されていない
}

/**
 * Riot APIのデータを処理し、DBの現状と比較して
 * 「有効」「手動設定」「自動除外」の状態を持つリストを生成する
 */
export async function processRiotItems(
  riotData: RiotAPIResponse,
  manualSettings: Map<string, { isAvailable: boolean; reason: string | null }>,
  dbItemIds: string[]
): Promise<ProcessingResult> {
  const rawItems = riotData.data;

  // 1. ルールベースでの除外判定
  const ruleBasedExcluded = getUnavailableItemIds(rawItems);
  const ruleBasedMap = new Map(ruleBasedExcluded.map(u => [u.riotId, u.reason]));

  const result: ProcessingResult = {
    availableItems: [],
    manualSettingsItems: [],
    autoExcludedItems: [],
  };

  for (const [riotId, item] of Object.entries(rawItems)) {
    const manualSetting = manualSettings.get(riotId);
    const isAutoExcluded = ruleBasedMap.has(riotId);
    const isNew = !dbItemIds.includes(riotId) && !manualSetting;

    let category: 'available' | 'manualSettings' | 'autoExcluded';
    let isManuallyAvailable: boolean | null = null;
    let reason: string | null = null;

    if (manualSetting) {
      // 手動設定がある場合は、必ず manualSettings カテゴリ
      category = 'manualSettings';
      isManuallyAvailable = manualSetting.isAvailable;
      reason = manualSetting.reason;
    } else if (isAutoExcluded) {
      // 自動除外ルールに該当し、手動設定なし
      category = 'autoExcluded';
      reason = ruleBasedMap.get(riotId) || null;
    } else {
      // 自動除外ルールに該当せず、手動設定もなし
      category = 'available';
    }

    // Detect non-purchasable items
    const isNonPurchasable = item.gold?.purchasable === false || item.inStore === false;

    // Extract available map IDs from maps object
    const availableMaps = item.maps
      ? Object.keys(item.maps)
        .filter(key => item.maps![key])
        .map(key => parseInt(key))
      : [];

    const processedItem: ProcessedItem = {
      riotId,
      name: item.name,
      imagePath: `${riotId}.webp`,
      isNew,
      isNonPurchasable,
      category,
      isManuallyAvailable,
      reason,
      maps: availableMaps,
      raw: item,
    };

    if (category === 'available') {
      result.availableItems.push(processedItem);
    } else if (category === 'manualSettings') {
      result.manualSettingsItems.push(processedItem);
    } else {
      result.autoExcludedItems.push(processedItem);
    }
  }

  return result;
}

/**
 * ExclusionManager用のデータロードヘルパー
 * R iot APIからデータを取得し、DBの状態と比較して処理済みアイテムリストを返す
 */
export async function loadItemsForManagement(version: string): Promise<{ result: ProcessingResult; riotData: RiotAPIResponse }> {
  const { fetchItemData } = await import('./riotApi');
  const riotRes = await fetchItemData(version);

  const { data: dbItems } = await supabase.from('items').select('riot_id');
  const { data: dbManualSettings } = await supabase
    .from('item_manual_settings')
    .select('riot_id, is_available, reason');

  const dbItemIds = dbItems?.map(i => i.riot_id) || [];
  const manualSettingsMap = new Map(
    dbManualSettings?.map(s => [
      s.riot_id,
      { isAvailable: s.is_available, reason: s.reason }
    ]) || []
  );

  const result = await processRiotItems(riotRes, manualSettingsMap, dbItemIds);

  return { result, riotData: riotRes };
}



/**
 * 変更されたアイテムリストをSupabaseに保存する
 * 注意: ここでは「有効」「除外」のステータス変更と、新規アイテムの登録を行う
 */
export async function saveItemLists(
  itemsToSave: ProcessedItem[],
  unavailableItemsToSave: ProcessedItem[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Transaction-like approach needed

    // 1. itemsテーブルへのUpsert
    // 必要なフィールドだけマッピング
    const itemsPayload = itemsToSave.map(item => ({
      riot_id: item.riotId,
      name_ja: item.name,
      is_available: true,
      image_path: item.imagePath,
      // 必須フィールドのデフォルト値設定（実際のデータ変換はもっと複雑だが、ここでは初期同期用として最小限に）
      plaintext_ja: item.raw.plaintext || '',
      price_total: item.raw.gold.total,
      price_sell: item.raw.gold.sell,
      // 他のフィールドはデフォルトか、後続処理で埋める想定
    }));

    if (itemsPayload.length > 0) {
      const { error: itemsError } = await supabase
        .from('items')
        .upsert(itemsPayload, { onConflict: 'riot_id', ignoreDuplicates: false });

      if (itemsError) throw itemsError;
    }

    // 2. unavailable_itemsテーブルへのUpsert
    const unavailablePayload = unavailableItemsToSave.map(item => ({
      riot_id: item.riotId,
      reason: item.reason,
    }));

    if (unavailablePayload.length > 0) {
      const { error: unavailableError } = await supabase
        .from('unavailable_items')
        .upsert(unavailablePayload, { onConflict: 'riot_id' });

      if (unavailableError) throw unavailableError;
    }

    // 3. 整合性維持: availableになったものはunavailableから削除、逆も然り
    // これはデータ量が多いと大変だが、整合性を保つため必要
    const availableRiotIds = itemsToSave.map(i => i.riotId);
    if (availableRiotIds.length > 0) {
      await supabase.from('unavailable_items').delete().in('riot_id', availableRiotIds);
    }

    const unavailableRiotIds = unavailableItemsToSave.map(i => i.riotId);
    if (unavailableRiotIds.length > 0) {
      await supabase.from('items').delete().in('riot_id', unavailableRiotIds);
    }

    return { success: true };

  } catch (error) {
    console.error('Save failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
