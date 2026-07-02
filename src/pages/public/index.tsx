import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { ItemFilterBar, type ItemFilters } from './features/ItemFilterBar/ItemFilterBar';
import { ItemGrid } from './features/ItemGrid/ItemGrid';
import { getAvailableItems, type PublicItem } from '../../lib/supabase/publicData';
import styles from './public.module.css';

export const PublicPage: React.FC = () => {
  const [items, setItems] = useState<PublicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ItemFilters>({
    name: '',
    role: '',
    tag: '',
    map: null,
  });

  useEffect(() => {
    getAvailableItems()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  const tagOptions = useMemo(
    () => [...new Set(items.flatMap((i) => i.searchTags))].sort(),
    [items]
  );

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (filters.name && !item.nameJa.includes(filters.name)) return false;
        if (filters.role && !item.roleCategories.includes(filters.role)) return false;
        if (filters.tag && !item.searchTags.includes(filters.tag)) return false;
        if (filters.map !== null && !item.maps.includes(filters.map)) return false;
        return true;
      }),
    [items, filters]
  );

  return (
    <MainLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>アイテム図鑑</h1>
        {items[0]?.updatedPatch && (
          <span className={styles.patch}>パッチ {items[0].updatedPatch}</span>
        )}
      </div>
      <ItemFilterBar filters={filters} tagOptions={tagOptions} onChange={setFilters} />
      {loading ? (
        <p className={styles.message}>読み込み中…</p>
      ) : error ? (
        <p className={styles.message}>{error}</p>
      ) : (
        <>
          <p className={styles.count}>{filtered.length} / {items.length} 件</p>
          <ItemGrid items={filtered} />
        </>
      )}
    </MainLayout>
  );
};

export default PublicPage;
