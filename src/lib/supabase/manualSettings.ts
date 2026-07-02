/**
 * 手動設定アイテム（item_manual_settings）の保存
 *
 * 新アーキテクチャでは ExclusionManager は手動設定の編集のみを担い、
 * items テーブルへの反映（is_available の決定）は pipeline:publish が
 * 「手動設定 > 自動除外ルール」の優先順で行う。
 */

import { supabase } from '../supabase';

export interface ManualSettingInput {
  riotId: string;
  isAvailable: boolean;
  reason: string | null;
}

export async function saveManualSettings(settings: ManualSettingInput[]): Promise<void> {
  if (settings.length > 0) {
    const payload = settings.map((s) => ({
      riot_id: s.riotId,
      is_available: s.isAvailable,
      reason: s.reason,
    }));
    const { error } = await supabase
      .from('item_manual_settings')
      .upsert(payload, { onConflict: 'riot_id' });
    if (error) throw new Error(`手動設定の保存失敗: ${error.message}`);
  }

  // リストから外されたものを削除
  const keepIds = settings.map((s) => s.riotId);
  const deleteQuery = supabase.from('item_manual_settings').delete();
  const { error: deleteError } = keepIds.length
    ? await deleteQuery.not('riot_id', 'in', `(${keepIds.join(',')})`)
    : await deleteQuery.neq('riot_id', '');
  if (deleteError) throw new Error(`手動設定の削除失敗: ${deleteError.message}`);
}
