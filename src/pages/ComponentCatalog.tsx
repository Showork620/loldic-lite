import { useState, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { ComponentSection } from '../components/logic/ComponentSection';
import { CodeExample } from '../components/logic/CodeExample';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Combobox } from '../components/ui/Combobox';
import { Icon, type IconName } from '../components/ui/Icon';
import { CategoryIcon, type IconCategory } from '../components/ui/CategoryIcon';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Dialog } from '../components/ui/Dialog';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useSnackbar } from '../components/ui/useSnackbar';
import { Card } from '../components/ui/Card';
import { ItemImage } from '../components/ui/ItemImage';
import styles from './ComponentCatalog.module.css';

// 利用可能な全アイコンのリスト
const ALL_ICONS: IconName[] = [
  'Search', 'User', 'Settings', 'Menu', 'X', 'Home', 'LogOut', 'Edit',
  'Trash', 'Plus', 'Minus', 'Check', 'Copy', 'ALargeSmall',
  'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight',
  'AlertCircle', 'CheckCircle', 'Info', 'Loader2', 'Filter'
];

const sections = [
  { id: 'buttons', label: 'Buttons' },
  { id: 'status-badges', label: 'Status Badges' },
  { id: 'progress', label: 'Progress' },
  { id: 'dialogs', label: 'Dialogs' },
  { id: 'snackbars', label: 'Snackbars' },
  { id: 'icons', label: 'Icons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'selects', label: 'Selects' },
  { id: 'combobox', label: 'Combobox' },
  { id: 'card', label: 'Card' },
  { id: 'item-image', label: 'Item Image' },
];

export function ComponentCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [comboboxValue, setComboboxValue] = useState('');
  const [activeCategory, setActiveCategory] = useState<IconCategory>('All');
  const { showSnackbar } = useSnackbar();

  // Dialog states
  const [isBasicDialogOpen, setIsBasicDialogOpen] = useState(false);
  const [isSmDialogOpen, setIsSmDialogOpen] = useState(false);
  const [isLgDialogOpen, setIsLgDialogOpen] = useState(false);
  const [isInfoConfirmOpen, setIsInfoConfirmOpen] = useState(false);
  const [isWarningConfirmOpen, setIsWarningConfirmOpen] = useState(false);
  const [isDangerConfirmOpen, setIsDangerConfirmOpen] = useState(false);

  // 検索クエリに基づいてセクションをフィルタリング
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    return sections.filter(section =>
      section.label.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const comboboxOptions = [
    { value: 'aatrox', label: 'Aatrox' },
    { value: 'ahri', label: 'Ahri' },
    { value: 'akali', label: 'Akali' },
    { value: 'yasuo', label: 'Yasuo' },
    { value: 'yone', label: 'Yone' },
    { value: 'zed', label: 'Zed' },
  ];

  const categories: IconCategory[] = ['Fighter', 'Marksman', 'Assassin', 'Mage', 'Tank', 'Support', 'All'];

  return (
    <div className={styles.container}>
      <Sidebar
        sections={filteredSections}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Hextech Component Catalog</h1>
          <p className={styles.pageDescription}>
            LoL Hextechテーマに基づいた美しいUIコンポーネントライブラリ
          </p>
        </header>

        {/* Buttons Section */}
        {filteredSections.some(s => s.id === 'buttons') && (
          <ComponentSection
            id="buttons"
            title="Buttons"
            description="様々なバリアントとサイズのボタンコンポーネント"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Variants</h3>
              <div className={styles.demoRow}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            <CodeExample code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Sizes</h3>
              <div className={styles.demoRow}>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <CodeExample code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>States</h3>
              <div className={styles.demoRow}>
                <Button>Default</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            <CodeExample code={`<Button>Default</Button>
<Button disabled>Disabled</Button>`} />
          </ComponentSection>
        )}

        {/* Status Badges Section */}
        {filteredSections.some(s => s.id === 'status-badges') && (
          <ComponentSection
            id="status-badges"
            title="Status Badges"
            description="ステータス表示用のカラーコーディングされたバッジコンポーネント"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>同期ステータス (Sync Status)</h3>
              <div className={styles.demoRow}>
                <StatusBadge status="new" />
                <StatusBadge status="updated" />
                <StatusBadge status="deleted" />
                <StatusBadge status="unchanged" />
              </div>
            </div>

            <CodeExample code={`<StatusBadge status="new" />
<StatusBadge status="updated" />
<StatusBadge status="deleted" />
<StatusBadge status="unchanged" />`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>パッチステータス (Patch Status)</h3>
              <div className={styles.demoRow}>
                <StatusBadge status="buff" />
                <StatusBadge status="nerf" />
                <StatusBadge status="rework" />
                <StatusBadge status="removed" />
                <StatusBadge status="revived" />
                <StatusBadge status="adjusted" />
              </div>
            </div>

            <CodeExample code={`<StatusBadge status="buff" />
<StatusBadge status="nerf" />
<StatusBadge status="rework" />
<StatusBadge status="removed" />
<StatusBadge status="revived" />
<StatusBadge status="adjusted" />`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>アイコン付き</h3>
              <div className={styles.demoRow}>
                <StatusBadge status="new" showIcon />
                <StatusBadge status="buff" showIcon />
                <StatusBadge status="nerf" showIcon />
                <StatusBadge status="rework" showIcon />
              </div>
            </div>

            <CodeExample code={`<StatusBadge status="new" showIcon />
<StatusBadge status="buff" showIcon />
<StatusBadge status="nerf" showIcon />
<StatusBadge status="rework" showIcon />`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>サイズバリエーション</h3>
              <div className={styles.demoRow}>
                <StatusBadge status="buff" size="sm" />
                <StatusBadge status="buff" size="md" />
                <StatusBadge status="nerf" size="sm" showIcon />
                <StatusBadge status="nerf" size="md" showIcon />
              </div>
            </div>

            <CodeExample code={`<StatusBadge status="buff" size="sm" />
<StatusBadge status="buff" size="md" />
<StatusBadge status="nerf" size="sm" showIcon />
<StatusBadge status="nerf" size="md" showIcon />`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>カスタムラベル</h3>
              <div className={styles.demoRow}>
                <StatusBadge status="new" label="新アイテム" showIcon />
                <StatusBadge status="buff" label="+10 AD" showIcon />
                <StatusBadge status="nerf" label="-5% CD" showIcon />
              </div>
            </div>

            <CodeExample code={`<StatusBadge status="new" label="新アイテム" showIcon />
<StatusBadge status="buff" label="+10 AD" showIcon />
<StatusBadge status="nerf" label="-5% CD" showIcon />`} />
          </ComponentSection>
        )}

        {/* Progress Section */}
        {filteredSections.some(s => s.id === 'progress') && (
          <ComponentSection
            id="progress"
            title="Progress Bars"
            description="進捗表示用のプログレスバーコンポーネント"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Determinate (確定モード)</h3>
              <div className={styles.progressDemo}>
                <ProgressBar value={0} label="開始" showPercentage />
                <ProgressBar value={33} label="処理中..." showPercentage />
                <ProgressBar value={66} label="もうすぐ完了" showPercentage />
                <ProgressBar value={100} label="完了！" showPercentage />
              </div>
            </div>

            <CodeExample code={`<ProgressBar value={0} label="開始" showPercentage />
<ProgressBar value={33} label="処理中..." showPercentage />
<ProgressBar value={66} label="もうすぐ完了" showPercentage />
<ProgressBar value={100} label="完了！" showPercentage />`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Sizes</h3>
              <div className={styles.progressDemo}>
                <ProgressBar value={60} label="Small" size="sm" showPercentage />
                <ProgressBar value={60} label="Medium (default)" size="md" showPercentage />
                <ProgressBar value={60} label="Large" size="lg" showPercentage />
              </div>
            </div>

            <CodeExample code={`<ProgressBar value={60} label="Small" size="sm" showPercentage />
<ProgressBar value={60} label="Medium (default)" size="md" showPercentage />
<ProgressBar value={60} label="Large" size="lg" showPercentage />`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Indeterminate (不確定モード)</h3>
              <div className={styles.progressDemo}>
                <ProgressBar value={0} variant="indeterminate" label="データを読み込み中..." />
                <ProgressBar value={0} variant="indeterminate" size="sm" />
              </div>
            </div>

            <CodeExample code={`<ProgressBar value={0} variant="indeterminate" label="データを読み込み中..." />
<ProgressBar value={0} variant="indeterminate" size="sm" />`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Without Labels</h3>
              <div className={styles.progressDemo}>
                <ProgressBar value={75} />
                <ProgressBar value={45} showPercentage />
              </div>
            </div>

            <CodeExample code={`<ProgressBar value={75} />
<ProgressBar value={45} showPercentage />`} />
          </ComponentSection>
        )}

        {/* Dialogs Section */}
        {filteredSections.some(s => s.id === 'dialogs') && (
          <ComponentSection
            id="dialogs"
            title="Dialogs"
            description="モーダルダイアログと確認ダイアログコンポーネント"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>基本Dialog</h3>
              <div className={styles.demoRow}>
                <Button onClick={() => setIsBasicDialogOpen(true)}>
                  基本Dialogを開く
                </Button>
              </div>
              <Dialog
                isOpen={isBasicDialogOpen}
                onClose={() => setIsBasicDialogOpen(false)}
                title="基本Dialog"
              >
                <p>これは基本的なDialogコンポーネントです。</p>
                <p>ESCキーまたはオーバーレイをクリックして閉じることができます。</p>
              </Dialog>
            </div>

            <CodeExample code={`const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Dialogを開く</Button>

<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="基本Dialog"
>
  <p>コンテンツ</p>
  <Button onClick={() => setIsOpen(false)}>閉じる</Button>
</Dialog>`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>サイズバリエーション</h3>
              <div className={styles.demoRow}>
                <Button onClick={() => setIsSmDialogOpen(true)} size="sm">
                  Small Dialog
                </Button>
                <Button onClick={() => setIsBasicDialogOpen(true)}>
                  Medium Dialog (default)
                </Button>
                <Button onClick={() => setIsLgDialogOpen(true)} size="lg">
                  Large Dialog
                </Button>
              </div>
              <Dialog
                isOpen={isSmDialogOpen}
                onClose={() => setIsSmDialogOpen(false)}
                title="Small Dialog"
                maxWidth="sm"
              >
                <p>これは最大幅400pxのSmall Dialogです。</p>
                <Button onClick={() => setIsSmDialogOpen(false)}>閉じる</Button>
              </Dialog>
              <Dialog
                isOpen={isLgDialogOpen}
                onClose={() => setIsLgDialogOpen(false)}
                title="Large Dialog"
                maxWidth="lg"
              >
                <p>これは最大幅640pxのLarge Dialogです。</p>
                <p>より多くのコンテンツを含む場合に適しています。</p>
                <Button onClick={() => setIsLgDialogOpen(false)}>閉じる</Button>
              </Dialog>
            </div>

            <CodeExample code={`<Dialog maxWidth="sm">Small (400px)</Dialog>
<Dialog maxWidth="md">Medium (480px, default)</Dialog>
<Dialog maxWidth="lg">Large (640px)</Dialog>`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>ConfirmDialog - Info</h3>
              <div className={styles.demoRow}>
                <Button onClick={() => setIsInfoConfirmOpen(true)}>
                  同期確認を表示
                </Button>
              </div>
              <ConfirmDialog
                isOpen={isInfoConfirmOpen}
                title="データ同期の確認"
                message="Riot APIから最新データを取得して同期しますか？"
                variant="info"
                onConfirm={() => {
                  alert('同期を開始しました');
                }}
                onCancel={() => setIsInfoConfirmOpen(false)}
              />
            </div>

            <CodeExample code={`<ConfirmDialog
  isOpen={isOpen}
  title="データ同期の確認"
  message="Riot APIから最新データを取得して同期しますか？"
  variant="info"
  onConfirm={() => { /* 処理 */ }}
  onCancel={() => setIsOpen(false)}
/>`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>ConfirmDialog - Warning</h3>
              <div className={styles.demoRow}>
                <Button onClick={() => setIsWarningConfirmOpen(true)} variant="primary">
                  上書き警告を表示
                </Button>
              </div>
              <ConfirmDialog
                isOpen={isWarningConfirmOpen}
                title="データ上書きの警告"
                message="既存のデータが上書きされます。この操作は元に戻せません。続行しますか？"
                variant="warning"
                confirmLabel="上書きする"
                onConfirm={() => {
                  alert('データを上書きしました');
                }}
                onCancel={() => setIsWarningConfirmOpen(false)}
              />
            </div>

            <CodeExample code={`<ConfirmDialog
  isOpen={isOpen}
  title="データ上書きの警告"
  message="既存のデータが上書きされます。この操作は元に戻せません。続行しますか？"
  variant="warning"
  confirmLabel="上書きする"
  onConfirm={() => { /* 処理 */ }}
  onCancel={() => setIsOpen(false)}
/>`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>ConfirmDialog - Danger</h3>
              <div className={styles.demoRow}>
                <Button onClick={() => setIsDangerConfirmOpen(true)} variant="danger">
                  削除確認を表示
                </Button>
              </div>
              <ConfirmDialog
                isOpen={isDangerConfirmOpen}
                title="アイテムの削除"
                message="このアイテムを完全に削除しますか？この操作は元に戻せません。"
                variant="danger"
                confirmLabel="削除する"
                cancelLabel="キャンセル"
                onConfirm={() => {
                  alert('アイテムを削除しました');
                }}
                onCancel={() => setIsDangerConfirmOpen(false)}
              />
            </div>

            <CodeExample code={`<ConfirmDialog
  isOpen={isOpen}
  title="アイテムの削除"
  message="このアイテムを完全に削除しますか？この操作は元に戻せません。"
  variant="danger"
  confirmLabel="削除する"
  onConfirm={() => { /* 処理 */ }}
  onCancel={() => setIsOpen(false)}
/>`} />
          </ComponentSection>
        )}

        {/* Snackbars Section */}
        {filteredSections.some(s => s.id === 'snackbars') && (
          <ComponentSection
            id="snackbars"
            title="Snackbars (Toast Notifications)"
            description="通知トーストコンポーネント - 成功/エラー/警告/情報メッセージの表示"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Types</h3>
              <div className={styles.demoRow}>
                <Button onClick={() => showSnackbar('操作が成功しました！', 'success')}>
                  Success Toast
                </Button>
                <Button onClick={() => showSnackbar('エラーが発生しました', 'error')} variant="danger">
                  Error Toast
                </Button>
                <Button onClick={() => showSnackbar('注意してください', 'warning')}>
                  Warning Toast
                </Button>
                <Button onClick={() => showSnackbar('情報を確認してください', 'info')}>
                  Info Toast
                </Button>
              </div>
            </div>

            <CodeExample code={`const { showSnackbar } = useSnackbar();

<Button onClick={() => showSnackbar('操作が成功しました！', 'success')}>
  Success Toast
</Button>
<Button onClick={() => showSnackbar('エラーが発生しました', 'error')}>
  Error Toast
</Button>
<Button onClick={() => showSnackbar('注意してください', 'warning')}>
  Warning Toast
</Button>
<Button onClick={() => showSnackbar('情報を確認してください', 'info')}>
  Info Toast
</Button>`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Multiple Toasts</h3>
              <div className={styles.demoRow}>
                <Button onClick={() => {
                  showSnackbar('1つ目の通知', 'info');
                  setTimeout(() => showSnackbar('2つ目の通知', 'success'), 300);
                  setTimeout(() => showSnackbar('3つ目の通知', 'warning'), 600);
                }}>
                  Show Multiple (3 toasts)
                </Button>
              </div>
            </div>

            <CodeExample code={`<Button onClick={() => {
  showSnackbar('1つ目の通知', 'info');
  setTimeout(() => showSnackbar('2つ目の通知', 'success'), 300);
  setTimeout(() => showSnackbar('3つ目の通知', 'warning'), 600);
}}>
  Show Multiple
</Button>`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Custom Duration</h3>
              <div className={styles.demoRow}>
                <Button onClick={() => showSnackbar('1秒間表示されます', 'info', 1000)} size="sm">
                  1-second Toast
                </Button>
                <Button onClick={() => showSnackbar('5秒間表示されます', 'success', 5000)}>
                  5-second Toast
                </Button>
                <Button onClick={() => showSnackbar('10秒間表示されます', 'warning', 10000)} size="lg">
                  10-second Toast
                </Button>
              </div>
            </div>

            <CodeExample code={`// デフォルトは3秒
showSnackbar('メッセージ', 'info');

// カスタムduration (ミリ秒)
showSnackbar('1秒間表示されます', 'info', 1000);
showSnackbar('5秒間表示されます', 'success', 5000);
showSnackbar('10秒間表示されます', 'warning', 10000);`} />
          </ComponentSection>
        )}

        {filteredSections.some(s => s.id === 'card') && (
          <ComponentSection
            id="card"
            title="Card"
            description="汎用的なカードコンテナコンポーネント"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Variants</h3>
              <div className={styles.demoRow}>
                <Card variant="default">
                  <h4>デフォルトカード</h4>
                  <p>背景色のみのシンプルなコンテナです。</p>
                </Card>
                <Card variant="outlined">
                  <h4>枠線付きカード</h4>
                  <p>枠線と透明感のある背景を持つカードです。</p>
                </Card>
                <Card variant="elevated">
                  <h4>浮き出しカード</h4>
                  <p>影と発光効果を持つカードです。</p>
                </Card>
              </div>
            </div>

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Padding</h3>
              <div className={styles.demoRow}>
                <Card padding="sm" variant="outlined">
                  パディング (小)
                </Card>
                <Card padding="md" variant="outlined">
                  パディング (中・デフォルト)
                </Card>
                <Card padding="lg" variant="outlined">
                  パディング (大)
                </Card>
              </div>
            </div>

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Interactive</h3>
              <div className={styles.demoRow}>
                <Card
                  variant="elevated"
                  onClick={() => showSnackbar('カードがクリックされました！', 'info')}
                  className="w-full"
                >
                  <h4>クリックしてください</h4>
                  <p>インタラクティブなカードです。ホバーで発光効果を確認できます。</p>
                </Card>
              </div>
            </div>
          </ComponentSection>
        )}

        {filteredSections.some(s => s.id === 'item-image') && (
          <ComponentSection
            id="item-image"
            title="Item Image"
            description="Supabase Storageから画像を表示するコンポーネント"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Basic Usage</h3>
              <div className={styles.demoRow}>
                <ItemImage imagePath="3004.webp" alt="Manamune" />
                <ItemImage imagePath="3031.webp" alt="Infinity Edge" />
                <ItemImage imagePath="invalid.webp" alt="Invalid Path (Fallback)" />
              </div>
            </div>

            <CodeExample code={`<ItemImage imagePath="3004.webp" alt="Manamune" />
<ItemImage imagePath="3031.webp" alt="Infinity Edge" />
<ItemImage imagePath="invalid.webp" alt="Invalid Path (Fallback)" />`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Sizes</h3>
              <div className={styles.demoRow}>
                <ItemImage imagePath="3004.webp" alt="Small" size={24} />
                <ItemImage imagePath="3004.webp" alt="Medium (Default)" size={32} />
                <ItemImage imagePath="3004.webp" alt="Large" size={64} />
              </div>
            </div>

            <CodeExample code={`<ItemImage imagePath="3004.webp" alt="Small" size={24} />
<ItemImage imagePath="3004.webp" alt="Medium (Default)" size={32} />
<ItemImage imagePath="3004.webp" alt="Large" size={64} />`} />
          </ComponentSection>
        )}

        {/* Icons Section */}
        {filteredSections.some(s => s.id === 'icons') && (
          <ComponentSection
            id="icons"
            title="Icons"
            description="lucide-reactベースのアイコンとカスタムカテゴリアイコン"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>利用可能な全アイコン</h3>
              <div className={styles.iconList}>
                {ALL_ICONS.map((iconName) => (
                  <div key={iconName} className={styles.iconItem}>
                    <Icon name={iconName} color="primary" size={24} />
                    <span className={styles.iconName}>{iconName}</span>
                  </div>
                ))}
              </div>
            </div>

            <CodeExample code={`// 利用可能なアイコン一覧
type IconName = 
  | 'Search' | 'User' | 'Settings' | 'Menu' | 'X' 
  | 'Home' | 'LogOut' | 'Edit' | 'Trash' | 'Plus' 
  | 'Minus' | 'Check' | 'Copy' | 'ALargeSmall'
  | 'ChevronDown' | 'ChevronUp' | 'ChevronLeft' | 'ChevronRight'
  | 'AlertCircle' | 'CheckCircle' | 'Info' | 'Loader2' | 'Filter';

<Icon name="Search" color="primary" />
<Icon name="User" color="gold" />
<Icon name="Settings" color="secondary" />
<Icon name="AlertCircle" color="danger" />`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Generic Icons (サンプル)</h3>
              <div className={styles.demoRow}>
                <Icon name="Search" color="primary" />
                <Icon name="User" color="gold" />
                <Icon name="Settings" color="secondary" />
                <Icon name="AlertCircle" color="danger" />
              </div>
            </div>

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Category Icons (Interactive)</h3>
              <div className={styles.iconGrid}>
                {categories.map((cat) => (
                  <CategoryIcon
                    key={cat}
                    category={cat}
                    isActive={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                  />
                ))}
              </div>
              <p className={styles.selectedText}>Selected: {activeCategory}</p>
            </div>

            <CodeExample code={`const [activeCategory, setActiveCategory] = useState<IconCategory>('All');
const categories: IconCategory[] = ['Fighter', 'Marksman', 'Assassin', 'Mage', 'Tank', 'Support', 'All'];

{categories.map((cat) => (
  <CategoryIcon
    key={cat}
    category={cat}
    isActive={activeCategory === cat}
    onClick={() => setActiveCategory(cat)}
  />
))}`} />
          </ComponentSection>
        )}

        {/* Inputs Section */}
        {filteredSections.some(s => s.id === 'inputs') && (
          <ComponentSection
            id="inputs"
            title="Inputs"
            description="テキスト入力用のフォームコンポーネント"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Basic Input</h3>
              <div className={styles.inputDemo}>
                <Input label="Username" placeholder="Enter username" />
              </div>
            </div>

            <CodeExample code={`<Input label="Username" placeholder="Enter username" />`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>With Icon</h3>
              <div className={styles.inputDemo}>
                <Input
                  label="Search"
                  placeholder="Search..."
                  leftIcon={<Icon name="Search" size={18} />}
                />
              </div>
            </div>

            <CodeExample code={`<Input
  label="Search"
  placeholder="Search..."
  leftIcon={<Icon name="Search" size={18} />}
/>`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Error State</h3>
              <div className={styles.inputDemo}>
                <Input label="Email" error="Invalid email format" defaultValue="wrong@" />
              </div>
            </div>

            <CodeExample code={`<Input 
  label="Email" 
  error="Invalid email format" 
  defaultValue="wrong@" 
/>`} />
          </ComponentSection>
        )}

        {/* Selects Section */}
        {filteredSections.some(s => s.id === 'selects') && (
          <ComponentSection
            id="selects"
            title="Selects"
            description="ドロップダウン選択コンポーネント"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Basic Select</h3>
              <div className={styles.inputDemo}>
                <Select label="Choose Option" options={selectOptions} />
              </div>
            </div>

            <CodeExample code={`const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

<Select label="Choose Option" options={options} />`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Disabled State</h3>
              <div className={styles.inputDemo}>
                <Select label="Disabled" options={selectOptions} disabled />
              </div>
            </div>

            <CodeExample code={`<Select label="Disabled" options={options} disabled />`} />
          </ComponentSection>
        )}

        {/* Combobox Section */}
        {filteredSections.some(s => s.id === 'combobox') && (
          <ComponentSection
            id="combobox"
            title="Combobox"
            description="オートコンプリート機能付きのコンボボックス"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Autocomplete</h3>
              <div className={styles.inputDemo}>
                <Combobox
                  label="Champion"
                  options={comboboxOptions}
                  value={comboboxValue}
                  onChange={setComboboxValue}
                  placeholder="Type to search..."
                />
                <p className={styles.selectedText}>Selected: {comboboxValue || 'None'}</p>
              </div>
            </div>

            <CodeExample code={`const [value, setValue] = useState('');
const options = [
  { value: 'aatrox', label: 'Aatrox' },
  { value: 'ahri', label: 'Ahri' },
  { value: 'akali', label: 'Akali' },
  { value: 'yasuo', label: 'Yasuo' },
  { value: 'yone', label: 'Yone' },
  { value: 'zed', label: 'Zed' },
];

<Combobox
  label="Champion"
  options={options}
  value={value}
  onChange={setValue}
  placeholder="Type to search..."
/>`} />
          </ComponentSection>
        )}
      </main>
    </div>
  );
}
