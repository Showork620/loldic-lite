/**
 * レビューキュー関連のDB操作
 * （patches / item_changes / manual_overrides / patchnote_extracts）
 */

import { supabase } from '../supabase';
import type { ChangeEntry, ChangeType, ReviewStatus } from '../../types/domain/itemChange';
import type { ParsedChange } from '../../types/domain/patchnote';

export interface PatchListRow {
  version: string;
  kind: 'major' | 'hotfix';
  ddragonVersion: string | null;
  patchnoteUrl: string | null;
  status: 'draft' | 'ingested' | 'reviewed' | 'published';
  sortKey: number;
  pendingCount: number;
}

export interface ChangeRow {
  id: string;
  riotId: string;
  patchVersion: string;
  changeType: ChangeType;
  changes: ChangeEntry[];
  patchnoteQuote: string | null;
  reviewStatus: ReviewStatus;
}

export interface UnresolvedExtractRow {
  id: string;
  itemName: string;
  quotedText: string;
  parsedChanges: ParsedChange[];
  confidence: number;
}

export async function getPatches(): Promise<PatchListRow[]> {
  const { data, error } = await supabase
    .from('patches')
    .select('version, kind, ddragon_version, patchnote_url, status, sort_key')
    .order('sort_key', { ascending: false });
  if (error) throw new Error(`patches取得失敗: ${error.message}`);

  const { data: pendings, error: pendingError } = await supabase
    .from('item_changes')
    .select('patch_version')
    .eq('review_status', 'pending');
  if (pendingError) throw new Error(`pending件数取得失敗: ${pendingError.message}`);
  const pendingByPatch = new Map<string, number>();
  for (const row of pendings ?? []) {
    pendingByPatch.set(row.patch_version, (pendingByPatch.get(row.patch_version) ?? 0) + 1);
  }

  return (data ?? []).map((r) => ({
    version: r.version,
    kind: r.kind,
    ddragonVersion: r.ddragon_version,
    patchnoteUrl: r.patchnote_url,
    status: r.status,
    sortKey: r.sort_key,
    pendingCount: pendingByPatch.get(r.version) ?? 0,
  }));
}

export async function updatePatchnoteUrl(version: string, url: string): Promise<void> {
  const { error } = await supabase
    .from('patches')
    .update({ patchnote_url: url, updated_at: new Date().toISOString() })
    .eq('version', version);
  if (error) throw new Error(`パッチノートURL更新失敗: ${error.message}`);
}

export async function updatePatchStatus(
  version: string,
  status: PatchListRow['status']
): Promise<void> {
  const { error } = await supabase
    .from('patches')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('version', version);
  if (error) throw new Error(`パッチ状態更新失敗: ${error.message}`);
}

export async function getChanges(
  patchVersion: string,
  reviewStatus?: ReviewStatus
): Promise<ChangeRow[]> {
  let query = supabase
    .from('item_changes')
    .select('id, riot_id, patch_version, change_type, changes, patchnote_quote, review_status')
    .eq('patch_version', patchVersion)
    .order('change_type');
  if (reviewStatus) query = query.eq('review_status', reviewStatus);
  const { data, error } = await query;
  if (error) throw new Error(`item_changes取得失敗: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id,
    riotId: r.riot_id,
    patchVersion: r.patch_version,
    changeType: r.change_type,
    changes: r.changes,
    patchnoteQuote: r.patchnote_quote,
    reviewStatus: r.review_status,
  }));
}

export async function updateReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  const { error } = await supabase
    .from('item_changes')
    .update({ review_status: status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`レビュー状態更新失敗: ${error.message}`);
}

export async function updateChangeContent(
  id: string,
  changeType: ChangeType,
  changes: ChangeEntry[]
): Promise<void> {
  const { error } = await supabase
    .from('item_changes')
    .update({ change_type: changeType, changes, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`変更内容の更新失敗: ${error.message}`);
}

/**
 * 手動オーバーライドを作成する。
 * 次回 pipeline:propose --force 実行時に item_states へ反映される。
 */
export async function createOverride(input: {
  riotId: string;
  fieldPath: string;
  value: unknown;
  effectiveFromPatch: string;
  reason?: string;
}): Promise<void> {
  const { error } = await supabase.from('manual_overrides').insert({
    riot_id: input.riotId,
    field_path: input.fieldPath,
    value: input.value,
    effective_from_patch: input.effectiveFromPatch,
    reason: input.reason ?? null,
  });
  if (error) throw new Error(`オーバーライド作成失敗: ${error.message}`);
}

/** riot_id が解決できなかったパッチノート抽出 */
export async function getUnresolvedExtracts(
  patchVersion: string
): Promise<UnresolvedExtractRow[]> {
  const { data, error } = await supabase
    .from('patchnote_extracts')
    .select('id, item_name, quoted_text, parsed_changes, confidence')
    .eq('patch_version', patchVersion)
    .is('riot_id', null);
  if (error) throw new Error(`未解決抽出の取得失敗: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id,
    itemName: r.item_name,
    quotedText: r.quoted_text,
    parsedChanges: r.parsed_changes,
    confidence: r.confidence,
  }));
}

export async function linkExtractToItem(extractId: string, riotId: string): Promise<void> {
  const { error } = await supabase
    .from('patchnote_extracts')
    .update({ riot_id: riotId })
    .eq('id', extractId);
  if (error) throw new Error(`抽出の紐付け失敗: ${error.message}`);
}
