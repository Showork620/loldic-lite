/**
 * 公開画面用のデータ取得（anonキーで読める範囲のみ）
 *
 * - items: is_available=true のアイテム（約300件なので全件取得＋クライアントフィルタ）
 * - item_changes: RLSにより approved のみ読める
 * - patches: RLSにより published のみ読める
 */

import { supabase } from '../supabase';
import type { ItemAbilityState } from '../../types/domain/itemState';
import type { BasicStats } from '../../types/domain/stats';
import type { ChangeEntry, ChangeType } from '../../types/domain/itemChange';

export interface PublicItem {
  riotId: string;
  nameJa: string;
  plaintextJa: string;
  priceTotal: number;
  priceSell: number;
  imagePath: string;
  patchStatus: string | null;
  searchTags: string[];
  roleCategories: string[];
  maps: number[];
  basicStats: BasicStats;
  abilities: ItemAbilityState[];
  buildFrom: string[];
  buildInto: string[];
  updatedPatch: string | null;
}

export interface TimelineEntry {
  patchVersion: string;
  sortKey: number;
  releasedAt: string | null;
  changeType: ChangeType;
  changes: ChangeEntry[];
  patchnoteQuote: string | null;
}

function mapItem(r: Record<string, unknown>): PublicItem {
  return {
    riotId: r.riot_id as string,
    nameJa: r.name_ja as string,
    plaintextJa: (r.plaintext_ja as string) ?? '',
    priceTotal: (r.price_total as number) ?? 0,
    priceSell: (r.price_sell as number) ?? 0,
    imagePath: (r.image_path as string) ?? '',
    patchStatus: (r.patch_status as string) ?? null,
    searchTags: (r.search_tags as string[]) ?? [],
    roleCategories: (r.role_categories as string[]) ?? [],
    maps: (r.maps as number[]) ?? [],
    basicStats: (r.basic_stats as BasicStats) ?? {},
    abilities: (r.abilities as ItemAbilityState[]) ?? [],
    buildFrom: (r.build_from as string[]) ?? [],
    buildInto: (r.build_into as string[]) ?? [],
    updatedPatch: (r.updated_patch as string) ?? null,
  };
}

export async function getAvailableItems(): Promise<PublicItem[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('is_available', true)
    .order('price_total', { ascending: true });
  if (error) throw new Error(`アイテム取得失敗: ${error.message}`);
  return (data ?? []).map(mapItem);
}

export async function getItemByRiotId(riotId: string): Promise<PublicItem | null> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('riot_id', riotId)
    .maybeSingle();
  if (error) throw new Error(`アイテム取得失敗: ${error.message}`);
  return data ? mapItem(data) : null;
}

/**
 * アイテムの変遷タイムライン（承認済みの変更のみ、新しいパッチ順）
 */
export async function getItemTimeline(riotId: string): Promise<TimelineEntry[]> {
  const [{ data: changes, error }, { data: patches, error: patchError }] = await Promise.all([
    supabase
      .from('item_changes')
      .select('patch_version, change_type, changes, patchnote_quote')
      .eq('riot_id', riotId)
      .eq('review_status', 'approved'),
    supabase.from('patches').select('version, sort_key, released_at'),
  ]);
  if (error) throw new Error(`変更履歴取得失敗: ${error.message}`);
  if (patchError) throw new Error(`パッチ情報取得失敗: ${patchError.message}`);

  const patchMap = new Map(
    (patches ?? []).map((p) => [p.version, { sortKey: p.sort_key, releasedAt: p.released_at }])
  );
  return (changes ?? [])
    .map((c) => ({
      patchVersion: c.patch_version,
      sortKey: patchMap.get(c.patch_version)?.sortKey ?? 0,
      releasedAt: patchMap.get(c.patch_version)?.releasedAt ?? null,
      changeType: c.change_type as ChangeType,
      changes: c.changes as ChangeEntry[],
      patchnoteQuote: c.patchnote_quote,
    }))
    .sort((a, b) => b.sortKey - a.sortKey);
}
