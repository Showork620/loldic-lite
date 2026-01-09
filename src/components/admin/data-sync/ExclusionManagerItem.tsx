import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { ItemImage } from '../../ui/ItemImage';
import { StatusBadge } from '../../ui/StatusBadge';
import { MapLabel } from '../../ui/MapLabel';
import { RawDataModal } from './RawDataModal';
import type { ProcessedItem } from '../../../utils/riotItemManager';
import styles from './ExclusionManagerItem.module.css';

interface ExclusionManagerItemProps {
  item: ProcessedItem;
  onExclusionChange: (riotId: string, isExcluded: boolean, reason?: string) => void;
  onReasonChange: (riotId: string, reason: string) => void;
}

export const ExclusionManagerItem: React.FC<ExclusionManagerItemProps> = ({
  item,
  onExclusionChange,
  onReasonChange,
}) => {
  const isExcluded = item.status === 'unavailable';
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      {/* トップブロック: 画像 + アイテム情報 + ステータス */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <ItemImage
            imagePath={item.imagePath}
            alt={item.name}
            size={40}
          />

          <div className={styles.textGroup}>
            <div className={styles.headerLine}>
              <span className={styles.itemName}>{item.name}</span>
            </div>
            <div className={styles.headerLine}>
              <span className={styles.riotId}>({item.riotId})</span>
              <StatusBadge status={item.isNew ? 'new' : 'unchanged'} size="sm" showIcon />
              <MapLabel maps={item.maps} />
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="secondary"
            size="sm"
          >
            元データを確認
          </Button>
        </div>
      </div>

      {/* ボトムブロック: 理由入力 + アクションボタン */}
      <div className={styles.footer}>
        <div className={styles.inputWrapper}>
          <Input
            value={item.reason || ''}
            onChange={(e) => onReasonChange(item.riotId, e.target.value)}
            placeholder={isExcluded ? "除外理由" : "除外する場合は理由を入力"}
            className={styles.reasonInput}
          />
        </div>

        {/* アクションボタン */}
        {isExcluded ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onExclusionChange(item.riotId, false);
            }}
            variant="primary"
            size="sm"
            className={styles.button}
          >
            復元
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onExclusionChange(item.riotId, true, item.reason || '手動除外');
            }}
            variant="danger"
            size="sm"
            className={styles.button}
          >
            除外
          </Button>
        )}
      </div>

      {/* 元データ確認モーダル */}
      <RawDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rawData={item.raw}
        riotId={item.riotId}
      />
    </div>
  );
};
