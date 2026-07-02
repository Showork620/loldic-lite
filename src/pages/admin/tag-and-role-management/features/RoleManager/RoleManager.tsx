import React, { useState } from 'react';
import { Combobox } from '../../../../../components/ui/Combobox';
import { Select } from '../../../../../components/ui/Select';
import { Button } from '../../../../../components/ui/Button';
import {
  addRoleCategory,
  deleteRoleCategory,
  type RoleCategoryRow,
} from '../../../../../lib/supabase/tagRoleData';
import { useSnackbar } from '../../../../../components/ui/useSnackbar';
import type { RoleCategory } from '../../../../../types/domain/role';
import styles from '../TagManager/TagManager.module.css';

const ROLE_OPTIONS: Array<{ value: RoleCategory; label: string }> = [
  { value: 'fighter', label: 'ファイター' },
  { value: 'marksman', label: 'マークスマン' },
  { value: 'assassin', label: 'アサシン' },
  { value: 'mage', label: 'メイジ' },
  { value: 'tank', label: 'タンク' },
  { value: 'support', label: 'サポート' },
];

const ROLE_LABEL = new Map(ROLE_OPTIONS.map((r) => [r.value, r.label]));

interface RoleManagerProps {
  roles: RoleCategoryRow[];
  itemOptions: Array<{ value: string; label: string }>;
  itemNames: Map<string, string>;
  onChanged: () => void;
}

export const RoleManager: React.FC<RoleManagerProps> = ({
  roles,
  itemOptions,
  itemNames,
  onChanged,
}) => {
  const [riotId, setRiotId] = useState('');
  const [role, setRole] = useState<RoleCategory>('fighter');
  const [busy, setBusy] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleAdd = async () => {
    if (!riotId) return;
    setBusy(true);
    try {
      await addRoleCategory(riotId, role);
      showSnackbar('ロール分類を登録しました', 'success');
      onChanged();
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : '登録失敗', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await deleteRoleCategory(id);
      showSnackbar('削除しました', 'success');
      onChanged();
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : '削除失敗', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>ロール分類</h2>
      <div className={styles.form}>
        <Combobox
          options={itemOptions}
          value={riotId}
          onChange={setRiotId}
          placeholder="アイテムを検索…"
          label="アイテム"
        />
        <Select
          label="ロール"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(e) => setRole(e.target.value as RoleCategory)}
        />
        <Button variant="primary" onClick={handleAdd} disabled={busy || !riotId}>
          追加
        </Button>
      </div>
      <ul className={styles.list}>
        {roles.map((row) => (
          <li key={row.id} className={styles.row}>
            <span className={styles.itemName}>{itemNames.get(row.riotId) ?? row.riotId}</span>
            <span className={styles.tag}>{ROLE_LABEL.get(row.role) ?? row.role}</span>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)} disabled={busy}>
              削除
            </Button>
          </li>
        ))}
        {roles.length === 0 && <li className={styles.empty}>登録なし</li>}
      </ul>
    </section>
  );
};
