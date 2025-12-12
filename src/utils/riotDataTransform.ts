/**
 * Riot APIから取得したアイテムデータの整形・変換ユーティリティ
 * PHPコードのロジックをTypeScriptに移植
 */

import type { ItemAbility } from '../types/item';
import { TAGS_TRANSLATE, ADDITIONAL_TAGS, STATS_KEYWORD } from '../constants/riotApi';

/**
 * descriptionから<passive>と<active>タグを抽出してアビリティ情報を生成
 * @param description アイテムのdescription（HTML形式）
 * @returns アビリティ配列
 */
export function extractAbilities(description: string): ItemAbility[] {
  const abilities: ItemAbility[] = [];

  // passive抽出（ただし「<passive>「xxx」</passive>」は説明文中の引用のため除外）
  const passiveRegex = /<passive>(?!「)(.*?)<\/passive>(.*?)(?=<passive>(?!「)|<active>|<\/mainText>)/gs;
  const passiveMatches = description.matchAll(passiveRegex);

  for (const match of passiveMatches) {
    const fullText = match[0];
    // 名前と説明を分離
    const nameMatch = fullText.match(/<passive>(.*?)<\/passive>/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    // タグを除去して説明部分を取得
    const descriptionText = fullText
      .replace(/<\/?passive>/g, '')
      .replace(/<\/?mainText>/g, '')
      .replace(/<\/?attention>/g, '')
      .replace(/<\/?stats>/g, '')
      .replace(/<br>/g, '\n')
      .trim();

    if (name) {
      abilities.push({
        type: 'passive',
        name,
        description: descriptionText
      });
    }
  }

  // active抽出（「<active>発動効果」は除外）
  const activeRegex = /<active>(.*?)<\/active>(.*?)(?=<passive>(?!「)|<active>|<\/mainText>)/gs;
  const activeMatches = description.matchAll(activeRegex);

  for (const match of activeMatches) {
    const fullText = match[0];

    // 「<active>発動効果」は除外
    if (fullText.includes('<active>発動効果')) {
      continue;
    }

    // 名前と説明を分離
    const nameMatch = fullText.match(/<active>(.*?)<\/active>/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    // タグを除去して説明部分を取得
    const descriptionText = fullText
      .replace(/<\/?active>/g, '')
      .replace(/<\/?mainText>/g, '')
      .replace(/<\/?attention>/g, '')
      .replace(/<\/?stats>/g, '')
      .replace(/<br>/g, '\n')
      .trim();

    if (name) {
      abilities.push({
        type: 'active',
        name,
        description: descriptionText
      });
    }
  }

  return abilities;
}

/**
 * descriptionから<attention>タグ内のステータス値を抽出
 * @param description アイテムのdescription（HTML形式）
 * @returns ステータス名と値のマッピング
 */
export function extractStatsFromDescription(description: string): Record<string, string> {
  const stats: Record<string, string> = {};

  for (const keyword of STATS_KEYWORD) {
    const parts = description.split(keyword);

    if (parts.length > 1) {
      const afterKeyword = parts[1];
      const attentionMatch = afterKeyword.match(/<attention>(.*?)<\/attention>/);

      // 「マナ自動回復」「体力自動回復」の包含問題を解決
      if (keyword === "マナ" || keyword === "体力") {
        if (afterKeyword.includes("自動回復")) {
          continue;
        }
      }

      // 「物理防御貫通」「魔法防御貫通」の包含問題を解決
      if (keyword === "物理防御" || keyword === "魔法防御") {
        if (afterKeyword.includes("貫通")) {
          continue;
        }
      }

      if (attentionMatch && attentionMatch[1]) {
        const value = attentionMatch[1].trim();

        // 「回復効果およびシールド量」→「回復効果&シールド量」に変換
        const finalKey = keyword === "回復効果およびシールド量"
          ? "回復効果&シールド量"
          : keyword;

        stats[finalKey] = value;
      }
    }
  }

  return stats;
}

/**
 * タグを翻訳し、追加タグを付与
 * @param tags 元のタグ配列（英語）
 * @param itemId アイテムID
 * @param abilities アビリティ配列
 * @param stats ステータス情報
 * @returns 翻訳・拡張されたタグ配列
 */
export function translateAndEnhanceTags(
  tags: string[],
  itemId: string,
  abilities: ItemAbility[],
  stats: Record<string, string>
): string[] {
  const translatedTags: string[] = [];

  // 既存タグを翻訳
  for (const tag of tags) {
    const translated = TAGS_TRANSLATE[tag];
    if (translated && !translatedTags.includes(translated)) {
      translatedTags.push(translated);
    } else if (!translated) {
      // 翻訳が見つからない場合は元のタグを使用
      translatedTags.push(tag);
    }
  }

  // アビリティ内容に基づいて動的にタグ追加
  const passiveDescriptions = abilities
    .filter(a => a.type === 'passive')
    .map(a => a.description)
    .join(' ');

  if (passiveDescriptions.includes("負傷")) {
    translatedTags.push("負傷");
  }
  if (passiveDescriptions.includes("シールド")) {
    translatedTags.push("シールド");
  }
  if (passiveDescriptions.includes("アルティメット")) {
    translatedTags.push("アルティメットスキル");
  }
  if (passiveDescriptions.includes("通常攻撃時効果")) {
    translatedTags.push("通常攻撃時効果");
  }

  // activeがあれば「発動効果あり」を追加
  const hasActive = abilities.some(a => a.type === 'active');
  if (hasActive && !translatedTags.includes("発動効果あり")) {
    translatedTags.push("発動効果あり");
  }

  // 回復効果&シールド量がstatsに含まれる時
  if (stats["回復効果&シールド量"] && !translatedTags.includes("回復効果&シールド量")) {
    translatedTags.push("回復効果&シールド量");
  }

  // ADDITIONAL_TAGSから追加
  if (ADDITIONAL_TAGS[itemId]) {
    for (const additionalTag of ADDITIONAL_TAGS[itemId]) {
      if (!translatedTags.includes(additionalTag)) {
        translatedTags.push(additionalTag);
      }
    }
  }

  // 重複を削除
  return Array.from(new Set(translatedTags));
}

/**
 * Riot APIのアイテムデータをDB挿入用の形式に変換
 * 定数データ（追加タグ、ロール分類）はDBから取得して反映
 * @param riotId Riot APIのアイテムID
 * @param riotItem Riot APIから取得したアイテムデータ
 * @returns DB挿入用のアイテムデータ（NewItem形式の一部）
 */
export async function transformRiotItemToDbItem(
  riotId: string,
  riotItem: any
): Promise<{
  riotId: string;
  nameJa: string;
  isAvailable: boolean;
  abilities: ItemAbility[];
  plaintextJa: string;
  priceTotal: number;
  priceSell: number;
  imagePath: string;
  patchStatus: null;
  searchTags: string[];
  roleCategories: string[] | null;
  popularChampions: null;
  stats: Record<string, string>;
  buildFrom: string[];
  buildInto: string[];
}> {
  // 動的インポート（循環依存を避けるため）
  const { getAdditionalTagsByItem, getRolesByItem } = await import('./constantsData');

  // アビリティを抽出
  const abilities = extractAbilities(riotItem.description);

  // statsを抽出
  const stats = extractStatsFromDescription(riotItem.description);

  // タグを翻訳・拡張（API由来のタグ）
  const apiTags = translateAndEnhanceTags(
    riotItem.tags || [],
    riotId,
    abilities,
    stats
  );

  // DBから追加タグを取得
  const { data: additionalTags } = await getAdditionalTagsByItem(riotId);

  // searchTagsにマージ（重複を除去）
  const searchTags = Array.from(new Set([...apiTags, ...additionalTags]));

  // DBからロール分類を取得
  const { data: roleCategories } = await getRolesByItem(riotId);

  // is_available判定: inStoreがtrueまたはfromやintoがある（派生元・派生先がある）場合はtrue
  const isAvailable = riotItem.inStore === true ||
    (riotItem.from && riotItem.from.length > 0) ||
    (riotItem.into && riotItem.into.length > 0);

  return {
    riotId,
    nameJa: riotItem.name,
    isAvailable,
    abilities,
    plaintextJa: riotItem.plaintext || '',
    priceTotal: riotItem.gold.total,
    priceSell: riotItem.gold.sell,
    imagePath: '', // itemSync.tsで設定される
    patchStatus: null, // 初回登録時はnull、手動で設定
    searchTags,
    roleCategories: roleCategories.length > 0 ? roleCategories : null,
    popularChampions: null, // 初回登録時はnull、手動で設定
    stats,
    buildFrom: riotItem.from || [],
    buildInto: riotItem.into || []
  };
}

// 後方互換性のため、旧関数名もエクスポート（非推奨）
/** @deprecated Use transformRiotItemToDbItem instead */
export const transformRiotItemToDbFormat = transformRiotItemToDbItem;


