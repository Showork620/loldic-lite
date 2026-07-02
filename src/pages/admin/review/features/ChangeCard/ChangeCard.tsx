import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/Button';
import { ConfirmDialog } from '../../../../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../../../../components/ui/StatusBadge';
import { ItemImage } from '../../../../../components/ui/ItemImage';
import { Accordion } from '../../../../../components/ui/Accordion';
import { ChangeEditor } from '../ChangeEditor/ChangeEditor';
import { updateReviewStatus, type ChangeRow } from '../../../../../lib/supabase/reviewData';
import { useSnackbar } from '../../../../../components/ui/useSnackbar';
import type { ChangeEntry } from '../../../../../types/domain/itemChange';
import styles from './ChangeCard.module.css';

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

const SOURCE_LABEL: Record<ChangeEntry['source'], string> = {
  ddragon_diff: 'DDragon',
  patchnote: 'ノート',
  manual: '手動',
};

interface ChangeCardProps {
  change: ChangeRow;
  itemName: string;
  onChanged: () => void;
}

export const ChangeCard: React.FC<ChangeCardProps> = ({ change, itemName, onChanged }) => {
  const [confirmReject, setConfirmReject] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const { showSnackbar } = useSnackbar();

  const setStatus = async (status: 'approved' | 'rejected') => {
    setBusy(true);
    try {
      await updateReviewStatus(change.id, status);
      showSnackbar(status === 'approved' ? '承認しました' : '却下しました', 'success');
      onChanged();
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : '更新失敗', 'error');
    } finally {
      setBusy(false);
    }
  };

  const hasLowConfidence = change.changes.some((c) => c.confidence < 0.75);

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <div className={styles.identity}>
          <ItemImage imagePath={`${change.riotId}.webp`} alt={itemName} size={40} />
          <div>
            <span className={styles.name}>{itemName}</span>
            <span className={styles.riotId}>{change.riotId}</span>
          </div>
          <StatusBadge status={change.changeType} showIcon />
          {change.reviewStatus !== 'pending' && (
            <span className={`${styles.reviewState} ${styles[change.reviewStatus]}`}>
              {change.reviewStatus === 'approved' ? '承認済み' : '却下'}
            </span>
          )}
          {hasLowConfidence && (
            <span className={styles.lowConfidence}>⚠ 低confidence行あり</span>
          )}
        </div>
        <div className={styles.actions}>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} disabled={busy}>
            編集
          </Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmReject(true)} disabled={busy}>
            却下
          </Button>
          <Button size="sm" variant="primary" onClick={() => setStatus('approved')} disabled={busy}>
            承認
          </Button>
        </div>
      </div>

      <table className={styles.table}>
        <tbody>
          {change.changes.map((entry, i) => (
            <tr key={i} className={entry.target.startsWith('unmapped.') ? styles.unmapped : ''}>
              <td className={styles.labelCell}>{entry.targetLabel}</td>
              <td className={styles.valueCell}>{formatValue(entry.before)}</td>
              <td className={styles.arrowCell}>
                <span className={styles[`dir_${entry.direction}`]}>⇒</span>
              </td>
              <td className={styles.valueCell}>{formatValue(entry.after)}</td>
              <td className={styles.metaCell}>
                {SOURCE_LABEL[entry.source]}
                {entry.confidence < 1 && ` ${Math.round(entry.confidence * 100)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {change.patchnoteQuote && (
        <Accordion title="パッチノート原文" className={styles.quote}>
          <blockquote className={styles.quoteText}>{change.patchnoteQuote}</blockquote>
        </Accordion>
      )}

      <ConfirmDialog
        isOpen={confirmReject}
        variant="danger"
        title="変更を却下しますか？"
        message="却下した変更は公開タイムラインに表示されません。"
        confirmLabel="却下する"
        cancelLabel="キャンセル"
        onConfirm={() => {
          setConfirmReject(false);
          setStatus('rejected');
        }}
        onCancel={() => setConfirmReject(false)}
      />

      {editing && (
        <ChangeEditor
          change={change}
          itemName={itemName}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
};
