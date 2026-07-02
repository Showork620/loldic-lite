/**
 * 追加タグ（additional_tags）とロール分類（role_categories）のCRUD
 */

import { supabase } from '../supabase';
import type { RoleCategory } from '../../types/domain/role';

export interface AdditionalTagRow {
  id: string;
  riotId: string;
  tag: string;
}

export interface RoleCategoryRow {
  id: string;
  riotId: string;
  role: RoleCategory;
}

export async function getAdditionalTags(): Promise<AdditionalTagRow[]> {
  const { data, error } = await supabase
    .from('additional_tags')
    .select('id, riot_id, tag')
    .order('riot_id');
  if (error) throw new Error(`追加タグ取得失敗: ${error.message}`);
  return (data ?? []).map((r) => ({ id: r.id, riotId: r.riot_id, tag: r.tag }));
}

export async function addAdditionalTag(riotId: string, tag: string): Promise<void> {
  const { error } = await supabase.from('additional_tags').insert({ riot_id: riotId, tag });
  if (error) throw new Error(`追加タグ作成失敗: ${error.message}`);
}

export async function deleteAdditionalTag(id: string): Promise<void> {
  const { error } = await supabase.from('additional_tags').delete().eq('id', id);
  if (error) throw new Error(`追加タグ削除失敗: ${error.message}`);
}

export async function getRoleCategories(): Promise<RoleCategoryRow[]> {
  const { data, error } = await supabase
    .from('role_categories')
    .select('id, riot_id, role')
    .order('role');
  if (error) throw new Error(`ロール分類取得失敗: ${error.message}`);
  return (data ?? []).map((r) => ({ id: r.id, riotId: r.riot_id, role: r.role }));
}

export async function addRoleCategory(riotId: string, role: RoleCategory): Promise<void> {
  const { error } = await supabase.from('role_categories').insert({ riot_id: riotId, role });
  if (error) throw new Error(`ロール分類作成失敗: ${error.message}`);
}

export async function deleteRoleCategory(id: string): Promise<void> {
  const { error } = await supabase.from('role_categories').delete().eq('id', id);
  if (error) throw new Error(`ロール分類削除失敗: ${error.message}`);
}

/** アイテム選択用の軽量リスト */
export async function getItemOptions(): Promise<Array<{ riotId: string; nameJa: string }>> {
  const { data, error } = await supabase
    .from('items')
    .select('riot_id, name_ja')
    .order('name_ja');
  if (error) throw new Error(`アイテム一覧取得失敗: ${error.message}`);
  return (data ?? []).map((r) => ({ riotId: r.riot_id, nameJa: r.name_ja }));
}
