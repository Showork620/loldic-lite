
import React, { useEffect, useState } from 'react';
import { Button } from '../../../../../components/ui/Button';
import { Accordion } from '../../../../../components/ui/Accordion';
import { ExclusionManagerItem } from './ExclusionManagerItem';
import { FilterButtonGroup } from '../FilterButtonGroup/FilterButtonGroup';
import { getLatestVersion } from '../../../../../lib/riot/riotApi';
import { loadItemsForManagement, type ProcessedItem } from '../../../../../lib/riot/riotItemManager';
import { useSnackbar } from '../../../../../components/ui/useSnackbar';
import { supabase } from '../../../../../lib/supabase';
import styles from './ExclusionManager.module.css';

interface ListState {
  available: ProcessedItem[];
  manualSettings: ProcessedItem[];
  autoExcluded: ProcessedItem[];
}

type NewItemFilter = 'all' | 'new' | 'existing';
type PurchasableFilter = 'all' | 'purchasable' | 'nonPurchasable';

export const ExclusionManager: React.FC = () => {
  const [lists, setLists] = useState<ListState>({
    available: [],
    manualSettings: [],
    autoExcluded: [],
  });
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

      const { result } = loadResult;

      if (!result.availableItems || !result.manualSettingsItems || !result.autoExcludedItems) {
        throw new Error('データの構造が不正です');
      }

      setLists({
        available: result.availableItems.sort((a, b) => b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1),
        manualSettings: result.manualSettingsItems.sort((a, b) => b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1),
        autoExcluded: result.autoExcludedItems.sort((a, b) => b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1),
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

  // 有効アイテムを手動除外に移動
  const handleExcludeItem = (riotId: string, reason: string) => {
    setLists(prev => {
      const itemIndex = prev.available.findIndex(i => i.riotId === riotId);
      if (itemIndex === -1) return prev;

      const item = prev.available[itemIndex];
      const newItem: ProcessedItem = {
        ...item,
        category: 'manualSettings',
        isManuallyAvailable: false,
        reason: reason || '手動除外',
      };

      return {
        ...prev,
        available: prev.available.filter((_, i) => i !== itemIndex),
        manualSettings: [newItem, ...prev.manualSettings],
      };
    });
  };

  // 自動除外アイテムを手動有効化（手動設定に移動）
  const handleEnableItem = (riotId: string) => {
    setLists(prev => {
      const itemIndex = prev.autoExcluded.findIndex(i => i.riotId === riotId);
      if (itemIndex === -1) return prev;

      const item = prev.autoExcluded[itemIndex];
      const newItem: ProcessedItem = {
        ...item,
        category: 'manualSettings',
        isManuallyAvailable: true,
        reason: null,
      };

      return {
        ...prev,
        autoExcluded: prev.autoExcluded.filter((_, i) => i !== itemIndex),
        manualSettings: [newItem, ...prev.manualSettings],
      };
    });
  };

  // 手動設定を解除（元のカテゴリに戻す）
  const handleRemoveSetting = (riotId: string) => {
    setLists(prev => {
      const itemIndex = prev.manualSettings.findIndex(i => i.riotId === riotId);
      if (itemIndex === -1) return prev;

      const item = prev.manualSettings[itemIndex];

      // 自動除外ルールに該当するかチェック（簡易版：reasonが設定されているか）
      const shouldBeAutoExcluded = item.reason && item.reason !== '手動除外';

      const resetItem: ProcessedItem = {
        ...item,
        category: shouldBeAutoExcluded ? 'autoExcluded' : 'available',
        isManuallyAvailable: null,
        reason: shouldBeAutoExcluded ? item.reason : null,
      };

      return {
        ...prev,
        manualSettings: prev.manualSettings.filter((_, i) => i !== itemIndex),
        ...(shouldBeAutoExcluded
          ? { autoExcluded: [resetItem, ...prev.autoExcluded] }
          : { available: [resetItem, ...prev.available] }
        ),
      };
    });
  };

  // 理由の変更
  const handleReasonChange = (riotId: string, reason: string) => {
    setLists(prev => ({
      ...prev,
      available: prev.available.map(item =>
        item.riotId === riotId ? { ...item, reason } : item
      ),
      manualSettings: prev.manualSettings.map(item =>
        item.riotId === riotId ? { ...item, reason } : item
      ),
      autoExcluded: prev.autoExcluded.map(item =>
        item.riotId === riotId ? { ...item, reason } : item
      ),
    }));
  };

  // 保存処理
  const handleSave = async () => {
    if (!confirm('変更をデータベースに反映しますか？')) return;

    setSaving(true);
    try {
      // 1. 有効なアイテムをitemsテーブルに保存
      // 有効なアイテム = lists.available + 手動で有効化されたアイテム
      const manuallyEnabledItems = lists.manualSettings.filter(i => i.isManuallyAvailable === true);
      const allAvailableItems = [...lists.available, ...manuallyEnabledItems];

      const itemsPayload = allAvailableItems.map(item => ({
        riot_id: item.riotId,
        name_ja: item.name,
        is_available: true,
        plaintext_ja: item.raw.plaintext || '',
        price_total: item.raw.gold.total,
        price_sell: item.raw.gold.sell,
        image_path: item.imagePath,
        maps: item.maps,
        // 他のフィールドはデフォルト値が使用される
      }));

      if (itemsPayload.length > 0) {
        const { error: itemsError } = await supabase
          .from('items')
          .upsert(itemsPayload, { onConflict: 'riot_id', ignoreDuplicates: false });

        if (itemsError) throw itemsError;
      }

      // 2. 手動設定アイテムをitem_manual_settingsに保存
      const manualSettingsPayload = lists.manualSettings.map(item => ({
        riot_id: item.riotId,
        is_available: item.isManuallyAvailable ?? false,
        reason: item.reason,
      }));

      if (manualSettingsPayload.length > 0) {
        const { error } = await supabase
          .from('item_manual_settings')
          .upsert(manualSettingsPayload, { onConflict: 'riot_id' });

        if (error) throw error;
      }

      // 3. 手動設定から削除されたアイテムをDBからも削除
      const manualRiotIds = lists.manualSettings.map(i => i.riotId);
      if (manualRiotIds.length > 0) {
        await supabase.from('item_manual_settings').delete().not('riot_id', 'in', `(${manualRiotIds.join(',')})`);
      } else {
        await supabase.from('item_manual_settings').delete().neq('riot_id', '');
      }

      // 4. 有効でないアイテムをitemsテーブルから削除
      // （手動除外されたアイテムと自動除外アイテム）
      const availableRiotIds = allAvailableItems.map(i => i.riotId);
      if (availableRiotIds.length > 0) {
        await supabase.from('items').delete().not('riot_id', 'in', `(${availableRiotIds.join(',')})`);
      }

      showSnackbar('変更を保存しました', 'success');
      await loadData();
    } catch (error) {
      console.error('Save error:', error);
      showSnackbar(`保存に失敗しました: ${error instanceof Error ? error.message : 'Unknown'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // フィルタ関数
  const filterItems = (items: ProcessedItem[]) => {
    return items.filter(item => {
      if (newItemFilter === 'new' && !item.isNew) return false;
      if (newItemFilter === 'existing' && item.isNew) return false;
      if (purchasableFilter === 'purchasable' && item.isNonPurchasable) return false;
      if (purchasableFilter === 'nonPurchasable' && !item.isNonPurchasable) return false;
      return true;
    });
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
          {/* 有効なアイテム */}
          <div className={styles.section}>
            <Accordion
              title={
                <div className={styles.accordionHeader}>
                  <span>有効なアイテム (Available Items)</span>
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
              count={filterItems(lists.available).length}
              defaultOpen={true}
            >
              <div className={styles.scrollContainer}>
                <div className={styles.itemGrid}>
                  {filterItems(lists.available).length === 0 ? (
                    <div className={styles.emptyState}>アイテムがありません</div>
                  ) : (
                    filterItems(lists.available).map(item => (
                      <ExclusionManagerItem
                        key={item.riotId}
                        item={item}
                        onExcludeItem={handleExcludeItem}
                        onEnableItem={handleEnableItem}
                        onRemoveSetting={handleRemoveSetting}
                        onReasonChange={handleReasonChange}
                      />
                    ))
                  )}
                </div>
              </div>
            </Accordion>
          </div>

          {/* 手動設定アイテム */}
          <div className={styles.section}>
            <Accordion
              title={
                <div className={styles.accordionHeader}>
                  <span>手動設定アイテム (Manual Settings)</span>
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
              count={filterItems(lists.manualSettings).length}
              defaultOpen={true}
            >
              <div className={styles.scrollContainer}>
                <div className={styles.itemGrid}>
                  {filterItems(lists.manualSettings).length === 0 ? (
                    <div className={styles.emptyState}>手動設定アイテムがありません</div>
                  ) : (
                    filterItems(lists.manualSettings).map(item => (
                      <ExclusionManagerItem
                        key={item.riotId}
                        item={item}
                        onExcludeItem={handleExcludeItem}
                        onEnableItem={handleEnableItem}
                        onRemoveSetting={handleRemoveSetting}
                        onReasonChange={handleReasonChange}
                      />
                    ))
                  )}
                </div>
              </div>
            </Accordion>
          </div>

          {/* 自動除外アイテム */}
          <div className={styles.section}>
            <Accordion
              title={
                <div className={styles.accordionHeader}>
                  <span>自動除外アイテム (Auto-Excluded Items)</span>
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
              count={filterItems(lists.autoExcluded).length}
              defaultOpen={false}
            >
              <div className={styles.scrollContainer}>
                <div className={styles.itemGrid}>
                  {filterItems(lists.autoExcluded).length === 0 ? (
                    <div className={styles.emptyState}>自動除外アイテムがありません</div>
                  ) : (
                    filterItems(lists.autoExcluded).map(item => (
                      <ExclusionManagerItem
                        key={item.riotId}
                        item={item}
                        onExcludeItem={handleExcludeItem}
                        onEnableItem={handleEnableItem}
                        onRemoveSetting={handleRemoveSetting}
                        onReasonChange={handleReasonChange}
                      />
                    ))
                  )}
                </div>
              </div>
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
};
