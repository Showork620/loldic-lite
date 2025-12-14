import React from 'react';
import { Card } from './Card';
import { ItemImage } from './ItemImage';
import { StatusBadge } from './StatusBadge';
import type { Item } from '../../types/item';
import styles from './ItemPreviewSync.module.css';

interface ItemPreviewSyncProps {
  item: Item;
  status: 'new' | 'updated' | 'deleted' | 'unchanged';
  unavailableReason?: string;
  onClick?: () => void;
  className?: string;
}

export const ItemPreviewSync: React.FC<ItemPreviewSyncProps> = ({
  item,
  status,
  unavailableReason,
  onClick,
  className = '',
}) => {
  return (
    <Card
      variant="outlined"
      padding="sm"
      onClick={onClick}
      className={`${styles.container} ${className}`}
    >
      <div className={styles.infoArea}>
        <ItemImage
          imagePath={item.image_path}
          alt={item.name_ja}
          size={32}
        />

        <div className={styles.textGroup}>
          <div className={styles.headerLine}>
            <span className={styles.itemName}>{item.name_ja}</span>
            <span className={styles.riotId}>({item.riot_id})</span>
          </div>
          {unavailableReason && (
            <span className={styles.unavailableReason}>
              {unavailableReason}
            </span>
          )}
        </div>
      </div>

      <div className={styles.statusArea}>
        <StatusBadge status={status} size="sm" showIcon />
      </div>
    </Card>
  );
};
