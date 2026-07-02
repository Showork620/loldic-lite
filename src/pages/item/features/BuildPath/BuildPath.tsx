import React from 'react';
import { Link } from 'react-router-dom';
import { ItemImage } from '../../../../components/ui/ItemImage';
import type { PublicItem } from '../../../../lib/supabase/publicData';
import styles from './BuildPath.module.css';

interface BuildPathProps {
  item: PublicItem;
  itemsById: Map<string, PublicItem>;
}

const ItemChip: React.FC<{ riotId: string; itemsById: Map<string, PublicItem> }> = ({
  riotId,
  itemsById,
}) => {
  const item = itemsById.get(riotId);
  if (!item) {
    return <span className={styles.unknown}>{riotId}</span>;
  }
  return (
    <Link to={`/item/${riotId}`} className={styles.chip}>
      <ItemImage imagePath={item.imagePath} alt={item.nameJa} size={28} />
      <span>{item.nameJa}</span>
    </Link>
  );
};

export const BuildPath: React.FC<BuildPathProps> = ({ item, itemsById }) => {
  if (item.buildFrom.length === 0 && item.buildInto.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>ビルドパス</h2>
      {item.buildFrom.length > 0 && (
        <div className={styles.group}>
          <span className={styles.groupLabel}>素材</span>
          <div className={styles.chips}>
            {item.buildFrom.map((id, i) => (
              <ItemChip key={`${id}-${i}`} riotId={id} itemsById={itemsById} />
            ))}
          </div>
        </div>
      )}
      {item.buildInto.length > 0 && (
        <div className={styles.group}>
          <span className={styles.groupLabel}>派生先</span>
          <div className={styles.chips}>
            {item.buildInto.map((id, i) => (
              <ItemChip key={`${id}-${i}`} riotId={id} itemsById={itemsById} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
