import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { TagManager } from './features/TagManager/TagManager';
import { RoleManager } from './features/RoleManager/RoleManager';
import {
  getAdditionalTags,
  getRoleCategories,
  getItemOptions,
  type AdditionalTagRow,
  type RoleCategoryRow,
} from '../../../lib/supabase/tagRoleData';
import { useSnackbar } from '../../../components/ui/useSnackbar';
import styles from './tagRole.module.css';

export const TagAndRoleManagementPage: React.FC = () => {
  const [tags, setTags] = useState<AdditionalTagRow[]>([]);
  const [roles, setRoles] = useState<RoleCategoryRow[]>([]);
  const [itemOptions, setItemOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [itemNames, setItemNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tagRows, roleRows, options] = await Promise.all([
        getAdditionalTags(),
        getRoleCategories(),
        getItemOptions(),
      ]);
      setTags(tagRows);
      setRoles(roleRows);
      setItemOptions(options.map((o) => ({ value: o.riotId, label: `${o.nameJa} (${o.riotId})` })));
      setItemNames(new Map(options.map((o) => [o.riotId, o.nameJa])));
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : '読み込み失敗', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <MainLayout>
      <div className={styles.header}>
        <div>
          <Link to="/admin" className={styles.backLink}>← Admin Dashboard</Link>
          <h1 className={styles.title}>タグ・ロール管理</h1>
        </div>
      </div>
      <p className={styles.note}>
        ここで登録した追加タグ・ロール分類は pipeline:publish 実行時に items へ反映されます。
      </p>
      {loading ? (
        <p className={styles.loading}>読み込み中…</p>
      ) : (
        <div className={styles.sections}>
          <TagManager tags={tags} itemOptions={itemOptions} itemNames={itemNames} onChanged={load} />
          <RoleManager roles={roles} itemOptions={itemOptions} itemNames={itemNames} onChanged={load} />
        </div>
      )}
    </MainLayout>
  );
};

export default TagAndRoleManagementPage;
