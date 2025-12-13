import React from 'react';
import styles from './StatusBadge.module.css';

export type SyncStatus = 'new' | 'updated' | 'deleted' | 'unchanged';
export type PatchStatus = 'buff' | 'nerf' | 'rework' | 'removed' | 'new' | 'revived' | 'adjusted' | 'unchanged';
export type StatusType = SyncStatus | PatchStatus;

export interface StatusBadgeProps {
  status: StatusType;
  label?: string; // カスタムラベル（指定なしの場合はstatusを日本語化）
  size?: 'sm' | 'md';
  showIcon?: boolean; // アイコン表示
  className?: string;
}

// ステータスの日本語ラベル
const STATUS_LABELS: Record<StatusType, string> = {
  // Sync
  'new': '新規',
  'updated': '更新',
  'deleted': '削除',
  'unchanged': '変更なし',
  // Patch
  'buff': '強化',
  'nerf': '弱体化',
  'rework': 'リワーク',
  'removed': '削除',
  'revived': '復活',
  'adjusted': '調整',
};

// ステータス別のアイコン（絵文字）
const STATUS_ICONS: Record<StatusType, string> = {
  // Sync
  'new': '✨',
  'updated': '🔄',
  'deleted': '🗑️',
  'unchanged': '⚪',
  // Patch
  'buff': '⬆️',
  'nerf': '⬇️',
  'rework': '🔧',
  'removed': '❌',
  'revived': '♻️',
  'adjusted': '⚙️',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = false,
  className = '',
}) => {
  const displayLabel = label || STATUS_LABELS[status] || status;
  const icon = STATUS_ICONS[status];

  return (
    <span
      className={`
        ${styles.badge}
        ${styles[status]}
        ${styles[size]}
        ${className}
      `}
      aria-label={`Status: ${displayLabel}`}
    >
      {showIcon && icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{displayLabel}</span>
    </span>
  );
};
