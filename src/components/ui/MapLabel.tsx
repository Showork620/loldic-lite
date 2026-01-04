import React from 'react';
import styles from './MapLabel.module.css';

interface MapLabelProps {
  maps: number[];
}

/**
 * マップラベルコンポーネント
 * - 11: サモナーズリフト (SR)
 * - 12: ハウリングアビス (ARAM)
 */
export const MapLabel: React.FC<MapLabelProps> = ({ maps }) => {
  if (!maps || maps.length === 0) {
    return <span className={`${styles.label} ${styles.na}`}>N/A</span>;
  }

  const hasSR = maps.includes(11);
  const hasARAM = maps.includes(12);

  return (
    <div className={styles.container}>
      {hasSR && <span className={`${styles.label} ${styles.sr}`}>SR</span>}
      {hasARAM && <span className={`${styles.label} ${styles.aram}`}>ARAM</span>}
      {!hasSR && !hasARAM && <span className={`${styles.label} ${styles.na}`}>N/A</span>}
    </div>
  );
};
