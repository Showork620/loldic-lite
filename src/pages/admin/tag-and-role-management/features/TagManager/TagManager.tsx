import React, { useState } from 'react';
import { Combobox } from '../../../../../components/ui/Combobox';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import {
  addAdditionalTag,
  deleteAdditionalTag,
  type AdditionalTagRow,
} from '../../../../../lib/supabase/tagRoleData';
import { useSnackbar } from '../../../../../components/ui/useSnackbar';
import styles from './TagManager.module.css';

interface TagManagerProps {
  tags: AdditionalTagRow[];
  itemOptions: Array<{ value: string; label: string }>;
  itemNames: Map<string, string>;
  onChanged: () => void;
}

export const TagManager: React.FC<TagManagerProps> = ({
  tags,
  itemOptions,
  itemNames,
  onChanged,
}) => {
  const [riotId, setRiotId] = useState('');
  const [tag, setTag] = useState('');
  const [busy, setBusy] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleAdd = async () => {
    if (!riotId || !tag) return;
    setBusy(true);
    try {
      await addAdditionalTag(riotId, tag.trim());
      showSnackbar('追加タグを登録しました', 'success');
      setTag('');
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
      await deleteAdditionalTag(id);
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
      <h2 className={styles.heading}>追加タグ</h2>
      <div className={styles.form}>
        <Combobox
          options={itemOptions}
          value={riotId}
          onChange={setRiotId}
          placeholder="アイテムを検索…"
          label="アイテム"
        />
        <Input
          label="タグ"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="例: 体力割合ダメージ"
        />
        <Button variant="primary" onClick={handleAdd} disabled={busy || !riotId || !tag}>
          追加
        </Button>
      </div>
      <ul className={styles.list}>
        {tags.map((row) => (
          <li key={row.id} className={styles.row}>
            <span className={styles.itemName}>{itemNames.get(row.riotId) ?? row.riotId}</span>
            <span className={styles.tag}>{row.tag}</span>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)} disabled={busy}>
              削除
            </Button>
          </li>
        ))}
        {tags.length === 0 && <li className={styles.empty}>登録なし</li>}
      </ul>
    </section>
  );
};
