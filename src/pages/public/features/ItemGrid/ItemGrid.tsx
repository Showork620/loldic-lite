import React from 'react';
import { Link } from 'react-router-dom';
import { ItemImage } from '../../../../components/ui/ItemImage';
import { StatusBadge, type StatusType } from '../../../../components/ui/StatusBadge';
import type { PublicItem } from '../../../../lib/supabase/publicData';
import styles from './ItemGrid.module.css';

const BADGE_TYPES = new Set(['buff', 'nerf', 'rework', 'removed', 'new', 'revived', 'adjusted']);

interface ItemGridProps {
  items: PublicItem[];
}

export const ItemGrid: React.FC<ItemGridProps> = ({ items }) => {
  if (items.length === 0) {
    return <p className={styles.empty}>条件に一致するアイテムがありません</p>;
  }
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <Link key={item.riotId} to={`/item/${item.riotId}`} className={styles.card}>
          <div className={styles.imageWrap}>
            <ItemImage imagePath={item.imagePath} alt={item.nameJa} size={48} />
            {item.patchStatus && BADGE_TYPES.has(item.patchStatus) && (
              <div className={styles.badge}>
                <StatusBadge status={item.patchStatus as StatusType} size="sm" />
              </div>
            )}
          </div>
          <div className={styles.info}>
            <span className={styles.name}>{item.nameJa}</span>
            <span className={styles.price}>{item.priceTotal.toLocaleString()} G</span>
          </div>
        </Link>
      ))}
    </div>
  );
};
