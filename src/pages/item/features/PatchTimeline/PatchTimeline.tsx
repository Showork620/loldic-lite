import React from 'react';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { Accordion } from '../../../../components/ui/Accordion';
import type { TimelineEntry } from '../../../../lib/supabase/publicData';
import styles from './PatchTimeline.module.css';

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

interface PatchTimelineProps {
  timeline: TimelineEntry[];
}

export const PatchTimeline: React.FC<PatchTimelineProps> = ({ timeline }) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>変遷履歴</h2>
      {timeline.length === 0 ? (
        <p className={styles.empty}>記録されている変更はまだありません</p>
      ) : (
        <div className={styles.timeline}>
          {timeline.map((entry) => (
            <div key={entry.patchVersion} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.patchVersion}>パッチ {entry.patchVersion}</span>
                <StatusBadge status={entry.changeType} showIcon size="sm" />
                {entry.releasedAt && (
                  <span className={styles.date}>
                    {new Date(entry.releasedAt).toLocaleDateString('ja-JP')}
                  </span>
                )}
              </div>
              <ul className={styles.changes}>
                {entry.changes
                  .filter((c) => c.target !== 'item')
                  .map((change, i) => (
                    <li key={i} className={styles.change}>
                      <span className={styles.label}>{change.targetLabel}</span>
                      <span className={styles.values}>
                        <span className={styles.before}>{formatValue(change.before)}</span>
                        <span className={styles[`dir_${change.direction}`]}> ⇒ </span>
                        <span className={styles.after}>{formatValue(change.after)}</span>
                      </span>
                    </li>
                  ))}
                {entry.changes.some((c) => c.target === 'item' && c.before === null) && (
                  <li className={styles.change}>このパッチで追加されました</li>
                )}
                {entry.changes.some((c) => c.target === 'item' && c.after === null) && (
                  <li className={styles.change}>このパッチで削除されました</li>
                )}
              </ul>
              {entry.patchnoteQuote && (
                <Accordion title="パッチノート原文" className={styles.quoteAccordion}>
                  <blockquote className={styles.quote}>{entry.patchnoteQuote}</blockquote>
                </Accordion>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
