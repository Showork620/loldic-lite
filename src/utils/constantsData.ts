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
