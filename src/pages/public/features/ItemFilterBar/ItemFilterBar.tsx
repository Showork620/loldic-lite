import React from 'react';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { MAP_IDS } from '../../../../types/domain/maps';
import styles from './ItemFilterBar.module.css';

export interface ItemFilters {
  name: string;
  role: string;
  tag: string;
  map: number | null;
}

const ROLE_OPTIONS = [
  { value: '', label: 'すべてのロール' },
  { value: 'fighter', label: 'ファイター' },
  { value: 'marksman', label: 'マークスマン' },
  { value: 'assassin', label: 'アサシン' },
  { value: 'mage', label: 'メイジ' },
  { value: 'tank', label: 'タンク' },
  { value: 'support', label: 'サポート' },
];

interface ItemFilterBarProps {
  filters: ItemFilters;
  tagOptions: string[];
  onChange: (filters: ItemFilters) => void;
}

export const ItemFilterBar: React.FC<ItemFilterBarProps> = ({
  filters,
  tagOptions,
  onChange,
}) => {
  return (
    <div className={styles.bar}>
      <Input
        placeholder="アイテム名で検索…"
        value={filters.name}
        onChange={(e) => onChange({ ...filters, name: e.target.value })}
      />
      <Select
        options={ROLE_OPTIONS}
        value={filters.role}
        onChange={(e) => onChange({ ...filters, role: e.target.value })}
      />
      <Select
        options={[{ value: '', label: 'すべてのタグ' }, ...tagOptions.map((t) => ({ value: t, label: t }))]}
        value={filters.tag}
        onChange={(e) => onChange({ ...filters, tag: e.target.value })}
      />
      <div className={styles.mapToggles}>
        <button
          className={`${styles.mapButton} ${filters.map === MAP_IDS.SUMMONERS_RIFT ? styles.mapActive : ''}`}
          onClick={() =>
            onChange({
              ...filters,
              map: filters.map === MAP_IDS.SUMMONERS_RIFT ? null : MAP_IDS.SUMMONERS_RIFT,
            })
          }
        >
          サモリフ
        </button>
        <button
          className={`${styles.mapButton} ${filters.map === MAP_IDS.ARAM ? styles.mapActive : ''}`}
          onClick={() =>
            onChange({ ...filters, map: filters.map === MAP_IDS.ARAM ? null : MAP_IDS.ARAM })
          }
        >
          ARAM
        </button>
      </div>
    </div>
  );
};
