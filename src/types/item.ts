// Type definitions for LoL Item data

export interface ItemStats {
  attack_damage?: number;
  ability_power?: number;
  armor?: number;
  magic_resist?: number;
  health?: number;
  mana?: number;
  attack_speed?: number;
  crit_chance?: number;
  lifesteal?: number;
  ability_haste?: number;
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
}

export interface RiotAPIResponse {
  type: string;
  version: string;
  data: {
    [key: string]: RiotItemData;
  };
}
