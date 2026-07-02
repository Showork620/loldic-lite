import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { ItemImage } from '../../components/ui/ItemImage';
import { AbilityPanel } from './features/AbilityPanel/AbilityPanel';
import { StatTable } from './features/StatTable/StatTable';
import { BuildPath } from './features/BuildPath/BuildPath';
import { PatchTimeline } from './features/PatchTimeline/PatchTimeline';
import {
  getItemByRiotId,
  getItemTimeline,
  getAvailableItems,
  type PublicItem,
  type TimelineEntry,
} from '../../lib/supabase/publicData';
import styles from './item.module.css';

export const ItemDetailPage: React.FC = () => {
  const { riotId } = useParams<{ riotId: string }>();
  const [item, setItem] = useState<PublicItem | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [related, setRelated] = useState<Map<string, PublicItem>>(new Map());
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = loadedFor !== riotId;

  useEffect(() => {
    if (!riotId) return;
    let cancelled = false;
    Promise.all([getItemByRiotId(riotId), getItemTimeline(riotId), getAvailableItems()])
      .then(([itemData, timelineData, allItems]) => {
        if (cancelled) return;
        setItem(itemData);
        setTimeline(timelineData);
        setRelated(new Map(allItems.map((i) => [i.riotId, i])));
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '読み込みに失敗しました');
      })
      .finally(() => {
        if (!cancelled) setLoadedFor(riotId);
      });
    return () => {
      cancelled = true;
    };
  }, [riotId]);

  if (loading) {
    return (
      <MainLayout>
        <p className={styles.message}>読み込み中…</p>
      </MainLayout>
    );
  }

  if (error || !item) {
    return (
      <MainLayout>
        <p className={styles.message}>{error ?? 'アイテムが見つかりません'}</p>
        <p className={styles.message}>
          <Link to="/" className={styles.backLink}>← アイテム一覧へ</Link>
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Link to="/" className={styles.backLink}>← アイテム一覧</Link>

      <div className={styles.headerCard}>
        <ItemImage imagePath={item.imagePath} alt={item.nameJa} size={64} />
        <div className={styles.headerInfo}>
          <h1 className={styles.name}>{item.nameJa}</h1>
          {item.plaintextJa && <p className={styles.plaintext}>{item.plaintextJa}</p>}
          <div className={styles.meta}>
            <span className={styles.price}>{item.priceTotal.toLocaleString()} G</span>
            <span className={styles.sell}>売却 {item.priceSell.toLocaleString()} G</span>
          </div>
          <div className={styles.tags}>
            {item.searchTags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.mainColumn}>
          <StatTable stats={item.basicStats} />
          <AbilityPanel abilities={item.abilities} />
          <BuildPath item={item} itemsById={related} />
        </div>
        <div className={styles.timelineColumn}>
          <PatchTimeline timeline={timeline} />
        </div>
      </div>
    </MainLayout>
  );
};

export default ItemDetailPage;
