// Type definitions for LoL Item data

// アビリティの型定義
export interface ItemAbility {
  type: 'passive' | 'active';
  name: string;
  description: string;
}

export interface ItemStats {
  health?: number;                    // 体力
  mana?: number;                      // マナ
  attack_damage?: number;             // 攻撃力
  ability_power?: number;             // 魔力
  armor?: number;                     // 物理防御
  magic_resist?: number;              // 魔法防御
  movement_speed?: number;            // 移動速度
  attack_speed?: number;              // 攻撃速度
  ability_haste?: number;             // スキルヘイスト
  crit_chance?: number;               // クリティカル率
  crit_damage?: number;               // クリティカルダメージ
  lethality?: number;                 // 脅威
  armor_penetration?: number;         // 物理防御貫通
  magic_penetration?: number;         // 魔法防御貫通
  lifesteal?: number;                 // ライフ スティール
  base_health_regen?: number;         // 基本体力自動回復
  base_mana_regen?: number;           // 基本マナ自動回復
  heal_shield_power?: number;         // 回復効果およびシールド量
  tenacity?: number;                  // 行動妨害耐性
  omni_vamp?: number;                 // オムニヴァンプ
  [key: string]: number | undefined;
}

export interface Item {
  id: string;
  riot_id: string;
  name_ja: string;
  description_ja: string;
  plaintext_ja: string;
  price_total: number;
  price_sell: number;
  is_legendary: boolean;
  image_path: string;
  tags: string[];
  stats: ItemStats;
  build_from: string[];
  build_into: string[];
  created_at: string;
  updated_at: string;
}

export interface RiotItemData {
  id: string;
  name: string;
  description: string;
  plaintext: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  gold: {
    base: number;
    total: number;
    sell: number;
    purchasable: boolean;
  };
  tags: string[];
  stats: ItemStats;
  from?: string[];
  into?: string[];
  maps?: {
    [mapId: string]: boolean;
  };
  inStore?: boolean;
}

export interface RiotAPIResponse {
  type: string;
  version: string;
  data: {
    [key: string]: RiotItemData;
  };
}
