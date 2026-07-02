import React from 'react';
import type { BasicStats } from '../../../../types/domain/stats';
import styles from './StatTable.module.css';

/** 本来％系のステータス（値に%を付けて表示） */
const PERCENT_STATS = new Set([
  '攻撃速度',
  'クリティカル率',
  'クリティカルダメージ',
  'ライフ スティール',
  '回復効果およびシールド量',
  '行動妨害耐性',
  'オムニヴァンプ',
  '基本マナ自動回復',
  '基本体力自動回復',
]);

interface StatTableProps {
  stats: BasicStats;
}

export const StatTable: React.FC<StatTableProps> = ({ stats }) => {
  const entries = Object.entries(stats).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>ステータス</h2>
      <table className={styles.table}>
        <tbody>
          {entries.map(([stat, value]) => (
            <tr key={stat}>
              <td className={styles.statName}>{stat}</td>
              <td className={styles.statValue}>
                {value}
                {PERCENT_STATS.has(stat) ? '%' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
