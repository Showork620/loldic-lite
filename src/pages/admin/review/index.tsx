import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Select } from '../../../components/ui/Select';
import { ChangeCard } from './features/ChangeCard/ChangeCard';
import { ExtractLinker } from './features/ExtractLinker/ExtractLinker';
import {
  getChanges,
  getPatches,
  getUnresolvedExtracts,
  type ChangeRow,
  type PatchListRow,
  type UnresolvedExtractRow,
} from '../../../lib/supabase/reviewData';
import { getItemOptions } from '../../../lib/supabase/tagRoleData';
import { useSnackbar } from '../../../components/ui/useSnackbar';
import type { ReviewStatus } from '../../../types/domain/itemChange';
import styles from './review.module.css';

export const AdminReviewPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const patch = searchParams.get('patch') ?? '';
  const [patches, setPatches] = useState<PatchListRow[]>([]);
  const [changes, setChanges] = useState<ChangeRow[]>([]);
  const [extracts, setExtracts] = useState<UnresolvedExtractRow[]>([]);
  const [itemNames, setItemNames] = useState<Map<string, string>>(new Map());
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  const load = useCallback(async () => {
    if (!patch) return;
    setLoading(true);
    try {
      const [changeRows, extractRows, options] = await Promise.all([
        getChanges(patch, statusFilter === 'all' ? undefined : statusFilter),
        getUnresolvedExtracts(patch),
        getItemOptions(),
      ]);
      setChanges(changeRows);
      setExtracts(extractRows);
      setItemNames(new Map(options.map((o) => [o.riotId, o.nameJa])));
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : '読み込み失敗', 'error');
    } finally {
      setLoading(false);
    }
  }, [patch, statusFilter, showSnackbar]);

  useEffect(() => {
    getPatches().then(setPatches).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const itemOptions = useMemo(
    () => [...itemNames.entries()].map(([riotId, name]) => ({ value: riotId, label: `${name} (${riotId})` })),
    [itemNames]
  );

  return (
    <MainLayout>
      <div className={styles.header}>
        <div>
          <Link to="/admin/patches" className={styles.backLink}>← パッチ管理</Link>
          <h1 className={styles.title}>変更レビュー</h1>
        </div>
        <div className={styles.filters}>
          <Select
            label="パッチ"
            options={patches.map((p) => ({ value: p.version, label: `${p.version}${p.pendingCount ? `（${p.pendingCount}件）` : ''}` }))}
            value={patch}
            onChange={(e) => setSearchParams({ patch: e.target.value })}
          />
          <Select
            label="状態"
            options={[
              { value: 'pending', label: 'レビュー待ち' },
              { value: 'approved', label: '承認済み' },
              { value: 'rejected', label: '却下' },
              { value: 'all', label: 'すべて' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | 'all')}
          />
        </div>
      </div>

      {!patch ? (
        <p className={styles.empty}>パッチを選択してください</p>
      ) : loading ? (
        <p className={styles.empty}>読み込み中…</p>
      ) : (
        <>
          {extracts.length > 0 && (
            <ExtractLinker extracts={extracts} itemOptions={itemOptions} onLinked={load} />
          )}
          {changes.length === 0 ? (
            <p className={styles.empty}>対象の変更はありません</p>
          ) : (
            <div className={styles.list}>
              {changes.map((change) => (
                <ChangeCard
                  key={change.id}
                  change={change}
                  itemName={itemNames.get(change.riotId) ?? change.riotId}
                  onChanged={load}
                />
              ))}
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default AdminReviewPage;
