import React, { useState } from 'react';
import { Dialog } from '../../../../../components/ui/Dialog';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Select } from '../../../../../components/ui/Select';
import {
  updateChangeContent,
  createOverride,
  type ChangeRow,
} from '../../../../../lib/supabase/reviewData';
import { useSnackbar } from '../../../../../components/ui/useSnackbar';
import type { ChangeEntry, ChangeType } from '../../../../../types/domain/itemChange';
import styles from './ChangeEditor.module.css';

const CHANGE_TYPES: Array<{ value: ChangeType; label: string }> = [
  { value: 'buff', label: '強化 (buff)' },
  { value: 'nerf', label: '弱体化 (nerf)' },
  { value: 'adjusted', label: '調整 (adjusted)' },
  { value: 'rework', label: 'リワーク (rework)' },
  { value: 'new', label: '新規 (new)' },
  { value: 'removed', label: '削除 (removed)' },
];

function toEditable(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function fromEditable(text: string): unknown {
  if (text === '') return null;
  const n = Number(text);
  if (!Number.isNaN(n) && text.trim() !== '') return n;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

interface ChangeEditorProps {
  change: ChangeRow;
  itemName: string;
  onClose: () => void;
  onSaved: () => void;
}

export const ChangeEditor: React.FC<ChangeEditorProps> = ({
  change,
  itemName,
  onClose,
  onSaved,
}) => {
  const [changeType, setChangeType] = useState<ChangeType>(change.changeType);
  const [entries, setEntries] = useState(
    change.changes.map((e) => ({
      ...e,
      beforeText: toEditable(e.before),
      afterText: toEditable(e.after),
      saveAsOverride: false,
    }))
  );
  const [busy, setBusy] = useState(false);
  const { showSnackbar } = useSnackbar();

  const updateEntry = (index: number, patch: Partial<(typeof entries)[number]>) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      const updatedChanges: ChangeEntry[] = entries.map((e) => ({
        target: e.target,
        targetLabel: e.targetLabel,
        before: fromEditable(e.beforeText),
        after: fromEditable(e.afterText),
        direction: e.direction,
        source: e.source === 'ddragon_diff' ? e.source : 'manual',
        confidence: 1,
        ...(e.extractId ? { extractId: e.extractId } : {}),
      }));
      await updateChangeContent(change.id, changeType, updatedChanges);

      // オーバーライド保存が指定された行は manual_overrides に記録
      for (const e of entries) {
        if (e.saveAsOverride && !e.target.startsWith('unmapped.')) {
          await createOverride({
            riotId: change.riotId,
            fieldPath: e.target,
            value: fromEditable(e.afterText),
            effectiveFromPatch: change.patchVersion,
            reason: `レビュー編集（${change.patchVersion}）`,
          });
        }
      }
      const overrideCount = entries.filter(
        (e) => e.saveAsOverride && !e.target.startsWith('unmapped.')
      ).length;
      showSnackbar(
        overrideCount > 0
          ? `保存しました（オーバーライド${overrideCount}件。states反映は pipeline:propose --force）`
          : '保存しました',
        'success'
      );
      onSaved();
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : '保存失敗', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog isOpen onClose={onClose} title={`変更を編集: ${itemName}`} maxWidth="lg">
      <div className={styles.body}>
        <Select
          label="変更種別"
          options={CHANGE_TYPES}
          value={changeType}
          onChange={(e) => setChangeType(e.target.value as ChangeType)}
        />

        <div className={styles.entries}>
          {entries.map((entry, i) => (
            <div key={i} className={styles.entry}>
              <div className={styles.entryHeader}>
                <Input
                  label="対象（field path）"
                  value={entry.target}
                  onChange={(e) => updateEntry(i, { target: e.target.value })}
                />
                <Input
                  label="表示ラベル"
                  value={entry.targetLabel}
                  onChange={(e) => updateEntry(i, { targetLabel: e.target.value })}
                />
                <Button size="sm" variant="ghost" onClick={() => removeEntry(i)}>
                  行削除
                </Button>
              </div>
              <div className={styles.entryValues}>
                <Input
                  label="変更前"
                  value={entry.beforeText}
                  onChange={(e) => updateEntry(i, { beforeText: e.target.value })}
                />
                <Input
                  label="変更後"
                  value={entry.afterText}
                  onChange={(e) => updateEntry(i, { afterText: e.target.value })}
                />
              </div>
              {!entry.target.startsWith('unmapped.') && (
                <label className={styles.overrideCheck}>
                  <input
                    type="checkbox"
                    checked={entry.saveAsOverride}
                    onChange={(e) => updateEntry(i, { saveAsOverride: e.target.checked })}
                  />
                  「変更後」の値を手動オーバーライドとして保存（{change.patchVersion} 以降有効）
                </label>
              )}
            </div>
          ))}
        </div>

        <p className={styles.note}>
          unmapped.* の行はアイテムの状態フィールドに自動で紐付かなかったパッチノート行です。
          対象を「abilities.&lt;アビリティkey&gt;.params.&lt;パラメータ名&gt;」等に書き換えると紐付けできます。
        </p>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={busy}>
            {busy ? '保存中…' : '保存'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
