import React, { useState } from 'react';
import { Combobox } from '../../../../../components/ui/Combobox';
import { Button } from '../../../../../components/ui/Button';
import { Accordion } from '../../../../../components/ui/Accordion';
import { linkExtractToItem, type UnresolvedExtractRow } from '../../../../../lib/supabase/reviewData';
import { useSnackbar } from '../../../../../components/ui/useSnackbar';
import styles from './ExtractLinker.module.css';

interface ExtractLinkerProps {
  extracts: UnresolvedExtractRow[];
  itemOptions: Array<{ value: string; label: string }>;
  onLinked: () => void;
}

export const ExtractLinker: React.FC<ExtractLinkerProps> = ({
  extracts,
  itemOptions,
  onLinked,
}) => {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleLink = async (extractId: string) => {
    const riotId = selections[extractId];
    if (!riotId) return;
    setBusy(true);
    try {
      await linkExtractToItem(extractId, riotId);
      showSnackbar(
        '紐付けました。提案への反映は pipeline:propose の再実行が必要です',
        'success'
      );
      onLinked();
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : '紐付け失敗', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.container}>
      <Accordion
        title="⚠ アイテム名を解決できなかったパッチノート抽出"
        count={extracts.length}
        defaultOpen
      >
        <div className={styles.list}>
          {extracts.map((extract) => (
            <div key={extract.id} className={styles.row}>
              <div className={styles.info}>
                <span className={styles.name}>「{extract.itemName}」</span>
                <span className={styles.confidence}>
                  confidence {Math.round(extract.confidence * 100)}%
                </span>
                <pre className={styles.quote}>{extract.quotedText}</pre>
              </div>
              <div className={styles.linkControls}>
                <Combobox
                  options={itemOptions}
                  value={selections[extract.id] ?? ''}
                  onChange={(value) =>
                    setSelections((prev) => ({ ...prev, [extract.id]: value }))
                  }
                  placeholder="アイテムを検索…"
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleLink(extract.id)}
                  disabled={busy || !selections[extract.id]}
                >
                  紐付け
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  );
};
