import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { PatchList } from './features/PatchList/PatchList';
import { getPatches, type PatchListRow } from '../../../lib/supabase/reviewData';
import { useSnackbar } from '../../../components/ui/useSnackbar';
import styles from './patches.module.css';

export const AdminPatchesPage: React.FC = () => {
  const [patches, setPatches] = useState<PatchListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPatches(await getPatches());
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : 'パッチ一覧の取得に失敗', 'error');
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
          <h1 className={styles.title}>パッチ管理</h1>
        </div>
      </div>
      <p className={styles.note}>
        取り込み（ingest）・パッチノート取得・解析・提案の生成はデータパイプライン
        （ローカルCLI または GitHub Actions の data-pipeline）で実行します。
        ここでは状態確認・パッチノートURLの登録・レビューへの遷移を行います。
      </p>
      {loading ? (
        <p className={styles.loading}>読み込み中…</p>
      ) : (
        <PatchList patches={patches} onChanged={load} />
      )}
    </MainLayout>
  );
};

export default AdminPatchesPage;
