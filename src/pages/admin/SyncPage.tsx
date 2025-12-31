import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ItemPreviewSync } from '../../components/ui/ItemPreviewSync';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useSnackbar } from '../../components/ui/useSnackbar';
import { Accordion } from '../../components/ui/Accordion';
import type { SyncStatus } from '../../components/ui/StatusBadge';

import { getVersions, fetchItemData } from '../../utils/riotApi';
import { getAllItems, saveItemData } from '../../utils/supabaseData';
import { getUnavailableItems } from '../../utils/constantsData';
import { transformRiotItemToDbItem } from '../../utils/riotDataTransform';
import { fetchImageAsBlob, resizeAndConvertToWebP } from '../../utils/imageProcessing';
import { uploadItemImage } from '../../utils/supabaseStorage';
import { toSnakeCase } from '../../utils/caseConverter';

import type { Item, RiotAPIResponse, RiotItemData } from '../../types/item';
import styles from './SyncPage.module.css';

type DiffStatus = SyncStatus;

interface DiffItem {
  riotId: string;
  item: Item;
  status: DiffStatus;
  originalItem?: Item;
  rawRiotData?: RiotItemData;
}

export const SyncPage: React.FC = () => {
  const { showSnackbar } = useSnackbar();

  // State
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'scanning' | 'syncing' | 'complete' | 'error'>('idle');
  const [diffResult, setDiffResult] = useState<DiffItem[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [progressLabel, setProgressLabel] = useState<string>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorLog, setErrorLog] = useState<string[]>([]);

  // Derived counts
  const newCount = diffResult.filter(d => d.status === 'new').length;
  const updatedCount = diffResult.filter(d => d.status === 'updated').length;
  const deletedCount = diffResult.filter(d => d.status === 'deleted').length;
  const unchangedCount = diffResult.filter(d => d.status === 'unchanged').length;

  // Initial Fetch
  useEffect(() => {
    const init = async () => {
      try {
        const v = await getVersions();
        setVersions(v);
        if (v.length > 0) setSelectedVersion(v[0]);
      } catch (e) {
        showSnackbar('バージョン情報の取得に失敗しました', 'error');
      }
    };
    init();
  }, [showSnackbar]);

  // Scan Logic
  const handleScan = async () => {
    if (!selectedVersion) return;
    setSyncStatus('scanning');
    setDiffResult([]);
    setErrorLog([]);

    try {
      // 1. Fetch Riot Data
      const riotData: RiotAPIResponse = await fetchItemData(selectedVersion);

      // 2. Fetch DB Data
      const { data: dbItems, error } = await getAllItems();
      if (error) throw new Error(error);

      // 3. Fetch Unavailable Items (Rules)
      const { data: unavailableList } = await getUnavailableItems();
      const unavailableIds = new Set(unavailableList?.map(u => u.riotId) || []);

      const diffs: DiffItem[] = [];
      const dbItemMap = new Map<string, Item>(dbItems?.map(i => [i.riot_id, i as Item]) || []);

      for (const [riotId, riotItem] of Object.entries(riotData.data)) {
        if (unavailableIds.has(riotId)) continue;

        // Transform to DB format (CamelCase NewItem)
        const transformedCamel = await transformRiotItemToDbItem(riotId, riotItem);

        // Convert to SnakeCase for Item preview compatibility
        const transformedSnake = toSnakeCase(transformedCamel);

        // Preview Item with CDN Image URL
        const previewItem: Item = {
          ...transformedSnake,
          id: 'preview',
          riot_id: riotId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Use Riot CDN for preview of New/Updated items
          image_path: `https://ddragon.leagueoflegends.com/cdn/${selectedVersion}/img/item/${riotId}.png`,
        } as unknown as Item;

        if (dbItemMap.has(riotId)) {
          const dbItem = dbItemMap.get(riotId)!;
          // Compare content
          const isChanged = dbItem.name_ja !== previewItem.name_ja ||
            dbItem.price_total !== previewItem.price_total;

          diffs.push({
            riotId,
            // For updated items, we want to show the NEW data, including the new image if changed (or same image URL)
            // But we must preserve the DB ID.
            item: { ...dbItem, ...previewItem, id: dbItem.id },
            status: isChanged ? 'updated' : 'unchanged',
            originalItem: dbItem,
            rawRiotData: riotItem
          });
          dbItemMap.delete(riotId);
        } else {
          diffs.push({
            riotId,
            item: previewItem,
            status: 'new',
            rawRiotData: riotItem
          });
        }
      }

      // Remaining in DB are "Deleted"
      for (const [riotId, dbItem] of dbItemMap.entries()) {
        diffs.push({
          riotId,
          item: dbItem,
          status: 'deleted'
        });
      }

      setDiffResult(diffs.sort((a, b) => {
        const order = { new: 0, updated: 1, deleted: 2, unchanged: 3 };
        return order[a.status] - order[b.status];
      }));
      setSyncStatus('idle');

    } catch (e: any) {
      console.error(e);
      showSnackbar(`スキャンエラー: ${e.message}`, 'error');
      setSyncStatus('error');
    }
  };

  // Sync Logic
  const handleSync = async () => {
    setIsConfirmOpen(false);
    setSyncStatus('syncing');
    setProgress(0);
    setErrorLog([]);

    const itemsToProcess = diffResult.filter(d => d.status === 'new' || d.status === 'updated');
    const total = itemsToProcess.length;
    let completed = 0;

    const CONCURRENCY = 5;

    for (let i = 0; i < total; i += CONCURRENCY) {
      const batch = itemsToProcess.slice(i, i + CONCURRENCY);

      await Promise.all(batch.map(async (diff) => {
        try {
          // 1. Process Image
          const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${selectedVersion}/img/item/${diff.riotId}.png`;
          const imageBlob = await fetchImageAsBlob(imageUrl);
          const webpBlob = await resizeAndConvertToWebP(imageBlob, 32, 32, 0.9);
          const uploadRes = await uploadItemImage(diff.riotId, webpBlob);

          if (!uploadRes.success) throw new Error(`Image upload failed: ${uploadRes.error}`);

          // 2. Process Data
          if (!diff.rawRiotData) throw new Error('No raw data found for sync');
          // Transform fresh from raw data (returns camelCase NewItem compatible)
          const itemData = await transformRiotItemToDbItem(diff.riotId, diff.rawRiotData);
          itemData.imagePath = `${diff.riotId}.webp`; // Set correct image path for DB

          // saveItemData expects camelCase NewItem (Omit id/createdAt)
          const saveRes = await saveItemData(itemData);
          if (!saveRes.success) throw new Error(`Data save failed: ${saveRes.error}`);

        } catch (e: any) {
          console.error(`Error syncing ${diff.riotId}:`, e);
          setErrorLog(prev => [...prev, `${diff.riotId}: ${e.message}`]);
        }
      }));

      completed += batch.length;
      const percentage = Math.min((completed / total) * 100, 100);
      setProgress(percentage);
      setProgressLabel(`${Math.min(completed, total)} / ${total}`);
    }

    setSyncStatus('complete');

    if (errorLog.length > 0) {
      showSnackbar(`完了しましたが、${errorLog.length}件のエラーが発生しました`, 'warning');
    } else {
      showSnackbar('同期が正常に完了しました', 'success');
    }

    // Re-scan to update status
    handleScan();
  };

  // Helper to render section
  const renderSection = (title: string, status: DiffStatus, count: number, defaultOpen = false) => {
    const items = diffResult.filter(d => d.status === status);

    return (
      <Accordion title={title} count={count} defaultOpen={defaultOpen && count > 0}>
        {items.length > 0 ? (
          <div className={styles.itemsGrid}>
            {items.map((diff) => (
              <ItemPreviewSync
                key={diff.riotId}
                item={diff.item}
                status={diff.status === 'unchanged' ? 'unchanged' : diff.status === 'new' ? 'new' : diff.status === 'updated' ? 'updated' : 'deleted'}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>No items</div>
        )}
      </Accordion>
    );
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>
            Data Synchronization
          </h1>
          <div className={styles.controls}>
            <div className={styles.selectWrapper}>
              <Select
                options={versions.map(v => ({ value: v, label: v }))}
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleScan}
              isLoading={syncStatus === 'scanning'}
              disabled={!selectedVersion || syncStatus === 'syncing'}
            >
              Scan / Preview
            </Button>
          </div>
        </div>

        {/* Status / Progress */}
        {syncStatus === 'syncing' && (
          <Card className={styles.progressCard}>
            <h3 className={styles.progressTitle}>Syncing... {progressLabel}</h3>
            <ProgressBar value={progress} variant="determinate" />
          </Card>
        )}

        {/* Error Log */}
        {errorLog.length > 0 && syncStatus !== 'syncing' && (
          <div className={styles.errorLog}>
            <p className={styles.errorTitle}>Errors:</p>
            <ul className={styles.errorList}>
              {errorLog.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* Action Bar */}
        {diffResult.length > 0 && syncStatus !== 'syncing' && syncStatus !== 'scanning' && (
          <div className={styles.actionBar}>
            <Button
              variant="secondary"
              onClick={() => setIsConfirmOpen(true)}
              disabled={newCount === 0 && updatedCount === 0}
            >
              Sync Changes ({newCount + updatedCount})
            </Button>
          </div>
        )}

        {/* Accordion Lists */}
        {diffResult.length > 0 && (
          <div className={styles.accordionList}>
            {renderSection('New', 'new', newCount, true)}
            {renderSection('Updated', 'updated', updatedCount, true)}
            {renderSection('Deleted', 'deleted', deletedCount, false)}
            {renderSection('Unchanged', 'unchanged', unchangedCount, false)}
          </div>
        )}

        <ConfirmDialog
          isOpen={isConfirmOpen}
          title="Start Synchronization?"
          message={`This will sync ${newCount} new items and ${updatedCount} updated items. This process may take a while.`}
          confirmLabel="Start Sync"
          onConfirm={handleSync}
          onCancel={() => setIsConfirmOpen(false)}
          variant="warning"
        />
      </div>
    </MainLayout>
  );
};
