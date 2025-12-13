import React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  value: number; // 進捗値 (0-100)
  label?: string; // 表示ラベル (例: "同期中... 45/100")
  variant?: 'determinate' | 'indeterminate'; // 確定/不確定
  size?: 'sm' | 'md' | 'lg'; // サイズ
  showPercentage?: boolean; // パーセンテージ表示
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  variant = 'determinate',
  size = 'md',
  showPercentage = false,
  className = '',
}) => {
  // 値を0-100の範囲に制限
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const percentage = `${Math.round(clampedValue)}%`;

  return (
    <div className={`${styles.container} ${className}`}>
      {/* ラベルまたはパーセンテージ表示 */}
      {(label || showPercentage) && (
        <div className={styles.labelContainer}>
          {label && <span className={styles.label}>{label}</span>}
          {showPercentage && <span className={styles.percentage}>{percentage}</span>}
        </div>
      )}

      {/* プログレスバー */}
      <div
        className={`
          ${styles.track}
          ${styles[size]}
        `}
        role="progressbar"
        aria-valuenow={variant === 'determinate' ? clampedValue : undefined}
        aria-valuemin={variant === 'determinate' ? 0 : undefined}
        aria-valuemax={variant === 'determinate' ? 100 : undefined}
        aria-label={label || `${percentage} complete`}
      >
        <div
          className={`
            ${styles.bar}
            ${variant === 'indeterminate' ? styles.indeterminate : ''}
          `}
          style={
            variant === 'determinate'
              ? { width: percentage }
              : undefined
          }
        />
      </div>
    </div>
  );
};
