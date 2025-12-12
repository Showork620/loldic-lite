/**
 * camelCaseからsnake_caseへの変換ヘルパー
 */

import type { NewItem } from '../db/schema';

/**
 * Drizzleの型（camelCase）からSupabaseのカラム名（snake_case）に変換
 */
export function toSnakeCase(item: Omit<NewItem, 'id' | 'createdAt'>): Record<string, any> {
  return {
    riot_id: item.riotId,
    name_ja: item.nameJa,
    is_available: item.isAvailable,
    abilities: item.abilities,
    plaintext_ja: item.plaintextJa,
    price_total: item.priceTotal,
    price_sell: item.priceSell,
    image_path: item.imagePath,
    patch_status: item.patchStatus,
    search_tags: item.searchTags,
    role_categories: item.roleCategories,
    popular_champions: item.popularChampions,
    stats: item.stats,
    build_from: item.buildFrom,
    build_into: item.buildInto,
    updated_at: new Date().toISOString()
  };
}

/**
 * Supabaseのレスポンス（snake_case）からDrizzleの型（camelCase）に変換
 */
export function toCamelCase(data: Record<string, any>): any {
  return {
    id: data.id,
    riotId: data.riot_id,
    nameJa: data.name_ja,
    isAvailable: data.is_available,
    abilities: data.abilities,
    plaintextJa: data.plaintext_ja,
    priceTotal: data.price_total,
    priceSell: data.price_sell,
    imagePath: data.image_path,
    patchStatus: data.patch_status,
    searchTags: data.search_tags,
    roleCategories: data.role_categories,
    popularChampions: data.popular_champions,
    stats: data.stats,
    buildFrom: data.build_from,
    buildInto: data.build_into,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}
