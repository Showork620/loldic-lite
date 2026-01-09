
import React, { useEffect, useState } from 'react';
import { Button } from '../../ui/Button';
import { Accordion } from '../../ui/Accordion';
import { ExclusionManagerItem } from './ExclusionManagerItem';
import { FilterButtonGroup } from './FilterButtonGroup';
import { getLatestVersion } from '../../../utils/riotApi';
import { loadItemsForManagement, saveItemLists, type ProcessedItem } from '../../../utils/riotItemManager';
import { useSnackbar } from '../../ui/useSnackbar';
import styles from './ExclusionManager.module.css';

interface ListState {
  items: ProcessedItem[];
  unavailable: ProcessedItem[];
}

type NewItemFilter = 'all' | 'new' | 'existing';
type PurchasableFilter = 'all' | 'purchasable' | 'nonPurchasable';

export const ExclusionManager: React.FC = () => {
  const [lists, setLists] = useState<ListState>({ items: [], unavailable: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [version, setVersion] = useState<string>('');
  const [newItemFilter, setNewItemFilter] = useState<NewItemFilter>('all');
  const [purchasableFilter, setPurchasableFilter] = useState<PurchasableFilter>('all');

  // データ初期ロード
  const loadData = async () => {
    setLoading(true);
    try {
      const ver = await getLatestVersion();
      setVersion(ver);
      const loadResult = await loadItemsForManagement(ver);

      console.log('loadItemsForManagement result:', loadResult);

      // データ構造の検証
      if (!loadResult || !loadResult.result) {
        throw new Error('データの構造が不正です: resultがありません');
      }

      const { result } = loadResult;

      if (!result.availableItems || !result.unavailableItems) {
        throw new Error('データの構造が不正です: availableItems または unavailableItems がありません');
      }

      setLists({
        items: result.availableItems.sort((a, b) => b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1),
        unavailable: result.unavailableItems.sort((a, b) => b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1),
      });

    } catch (error) {
      console.error('Failed to load data:', error);
      showSnackbar('データのロードに失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 除外/復元の切り替え
  const handleExclusionChange = (riotId: string, isExcluded: boolean, defaultReason?: string) => {
    setLists(prev => {
      const sourceList = isExcluded ? prev.items : prev.unavailable;

      const itemIndex = sourceList.findIndex(i => i.riotId === riotId);
      if (itemIndex === -1) return prev;

      const item = sourceList[itemIndex];
      const newItem: ProcessedItem = {
        ...item,
        status: isExcluded ? 'unavailable' : 'available',
        reason: isExcluded ? (defaultReason || item.reason || '手動除外') : item.reason,
      };

      return {
        items: isExcluded
          ? [...prev.items.slice(0, itemIndex), ...prev.items.slice(itemIndex + 1)]
          : [newItem, ...prev.items],
        unavailable: isExcluded
          ? [newItem, ...prev.unavailable]
          : [...prev.unavailable.slice(0, itemIndex), ...prev.unavailable.slice(itemIndex + 1)],
      };
    });
  };

  // 理由の変更（有効/除外両方のリストで対応）
  const handleReasonChange = (riotId: string, reason: string) => {
    setLists(prev => ({
      items: prev.items.map(item =>
        item.riotId === riotId ? { ...item, reason } : item
      ),
      unavailable: prev.unavailable.map(item =>
        item.riotId === riotId ? { ...item, reason } : item
      ),
    }));
  };

  // 保存処理
  const handleSave = async () => {
    if (!confirm('変更をデータベースに反映しますか？')) return;

    setSaving(true);
    try {
      const result = await saveItemLists(lists.items, lists.unavailable);
      if (result.success) {
        showSnackbar('変更を保存しました', 'success');
        await loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showSnackbar(`保存に失敗しました: ${error instanceof Error ? error.message : 'Unknown'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          除外アイテム設定 (v{version})
        </h2>
        <div className={styles.actions}>
          <Button onClick={loadData} variant="secondary" size="sm" disabled={loading || saving}>
            リロード
          </Button>
          <Button onClick={handleSave} variant="primary" disabled={loading || saving}>
            {saving ? '保存中...' : '変更を保存'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          データを読み込み中...
        </div>
      ) : (
        <div className={styles.sections}>
          <div className={styles.section}>
            <Accordion
              title={
                <div className={styles.accordionHeader}>
                  <span>有効なアイテム (Items)</span>
                  <div className={styles.filterGroups}>
                    <FilterButtonGroup
                      label="新着"
                      options={[
                        { value: 'all', label: '全て' },
                        { value: 'new', label: '新着のみ' },
                        { value: 'existing', label: '新着以外' },
                      ]}
                      value={newItemFilter}
                      onChange={(v) => setNewItemFilter(v as NewItemFilter)}
                    />
                    <FilterButtonGroup
                      label="購入"
                      options={[
                        { value: 'all', label: '全て' },
                        { value: 'purchasable', label: '購入可能' },
                        { value: 'nonPurchasable', label: '非売品' },
                      ]}
                      value={purchasableFilter}
                      onChange={(v) => setPurchasableFilter(v as PurchasableFilter)}
                    />
                  </div>
                </div>
              }
              count={
                lists.items.filter(item => {
                  if (newItemFilter === 'new' && !item.isNew) return false;
                  if (newItemFilter === 'existing' && item.isNew) return false;
                  if (purchasableFilter === 'purchasable' && item.isNonPurchasable) return false;
                  if (purchasableFilter === 'nonPurchasable' && !item.isNonPurchasable) return false;
                  return true;
                }).length
              }
              defaultOpen={true}
            >
              <div className={styles.scrollContainer}>
                <div className={styles.itemGrid}>
                  {(() => {
                    const filtered = lists.items.filter(item => {
                      if (newItemFilter === 'new' && !item.isNew) return false;
                      if (newItemFilter === 'existing' && item.isNew) return false;
                      if (purchasableFilter === 'purchasable' && item.isNonPurchasable) return false;
                      if (purchasableFilter === 'nonPurchasable' && !item.isNonPurchasable) return false;
                      return true;
                    });
                    return filtered.length === 0 ? (
                      <div className={styles.emptyState}>アイテムがありません</div>
                    ) : (
                      filtered.map(item => (
                        <ExclusionManagerItem
                          key={item.riotId}
                          item={item}
                          onExclusionChange={handleExclusionChange}
                          onReasonChange={handleReasonChange}
                        />
                      ))
                    );
                  })()}
                </div>
              </div>
            </Accordion>
          </div>

          <div className={styles.section}>
            <Accordion
              title={
                <div className={styles.accordionHeader}>
                  <span>除外アイテム (Unavailable Items)</span>
                  <div className={styles.filterGroups}>
                    <FilterButtonGroup
                      label="新着"
                      options={[
                        { value: 'all', label: '全て' },
                        { value: 'new', label: '新着のみ' },
                        { value: 'existing', label: '新着以外' },
                      ]}
                      value={newItemFilter}
                      onChange={(v) => setNewItemFilter(v as NewItemFilter)}
                    />
                    <FilterButtonGroup
                      label="購入"
                      options={[
                        { value: 'all', label: '全て' },
                        { value: 'purchasable', label: '購入可能' },
                        { value: 'nonPurchasable', label: '非売品' },
                      ]}
                      value={purchasableFilter}
                      onChange={(v) => setPurchasableFilter(v as PurchasableFilter)}
                    />
                  </div>
                </div>
              }
              count={
                lists.unavailable.filter(item => {
                  if (newItemFilter === 'new' && !item.isNew) return false;
                  if (newItemFilter === 'existing' && item.isNew) return false;
                  if (purchasableFilter === 'purchasable' && item.isNonPurchasable) return false;
                  if (purchasableFilter === 'nonPurchasable' && !item.isNonPurchasable) return false;
                  return true;
                }).length
              }
              defaultOpen={false}
            >
              <div className={styles.scrollContainer}>
                <div className={styles.itemGrid}>
                  {(() => {
                    const filtered = lists.unavailable.filter(item => {
                      if (newItemFilter === 'new' && !item.isNew) return false;
                      if (newItemFilter === 'existing' && item.isNew) return false;
                      if (purchasableFilter === 'purchasable' && item.isNonPurchasable) return false;
                      if (purchasableFilter === 'nonPurchasable' && !item.isNonPurchasable) return false;
                      return true;
                    });
                    return filtered.length === 0 ? (
                      <div className={styles.emptyState}>除外アイテムがありません</div>
                    ) : (
                      filtered.map(item => (
                        <ExclusionManagerItem
                          key={item.riotId}
                          item={item}
                          onExclusionChange={handleExclusionChange}
                          onReasonChange={handleReasonChange}
                        />
                      ))
                    );
                  })()}
                </div>
              </div>
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
};
