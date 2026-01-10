import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { ItemImage } from '../../../../../components/ui/ItemImage';
import { StatusBadge } from '../../../../../components/ui/StatusBadge';
import { MapLabel } from '../../../../../components/ui/MapLabel';
import { RawDataModal } from '../RawDataModal/RawDataModal';
import type { ProcessedItem } from '../../../../../lib/riot/riotItemManager';
import styles from './ExclusionManagerItem.module.css';

interface ExclusionManagerItemProps {
  item: ProcessedItem;
  onExcludeItem: (riotId: string, reason: string) => void;
  onEnableItem: (riotId: string) => void;
  onRemoveSetting: (riotId: string) => void;
  onReasonChange: (riotId: string, reason: string) => void;
}

export const ExclusionManagerItem: React.FC<ExclusionManagerItemProps> = ({
  item,
  onExcludeItem,
  onEnableItem,
  onRemoveSetting,
  onReasonChange,
}) => {
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
              {item.isNonPurchasable && <StatusBadge status="adjusted" size="sm" label="非売品" />}

              {/* 手動設定アイテムの場合、設定ステータスを表示 */}
              {item.category === 'manualSettings' && (
                <StatusBadge
                  status={item.isManuallyAvailable ? 'buff' : 'nerf'}
                  size="sm"
                  label={item.isManuallyAvailable ? '有効化' : '除外'}
                />
              )}

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
            placeholder={
              item.category === 'available'
                ? "除外する場合は理由を入力"
                : item.category === 'manualSettings'
                  ? "理由（任意）"
                  : "除外理由"
            }
            className={styles.reasonInput}
          />
        </div>

        {/* アクションボタン */}
        {item.category === 'available' && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onExcludeItem(item.riotId, item.reason || '手動除外');
            }}
            variant="danger"
            size="sm"
            className={styles.button}
          >
            除外
          </Button>
        )}

        {item.category === 'manualSettings' && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveSetting(item.riotId);
            }}
            variant="secondary"
            size="sm"
            className={styles.button}
          >
            設定解除
          </Button>
        )}

        {item.category === 'autoExcluded' && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEnableItem(item.riotId);
            }}
            variant="primary"
            size="sm"
            className={styles.button}
          >
            有効化
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
