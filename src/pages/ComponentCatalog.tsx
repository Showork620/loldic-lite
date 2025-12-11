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
import { Badge } from '../components/ui/Badge';
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
  { id: 'badges', label: 'Badges' },
  { id: 'icons', label: 'Icons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'selects', label: 'Selects' },
  { id: 'combobox', label: 'Combobox' },
];

export function ComponentCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [comboboxValue, setComboboxValue] = useState('');
  const [activeCategory, setActiveCategory] = useState<IconCategory>('All');

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

        {/* Badges Section */}
        {filteredSections.some(s => s.id === 'badges') && (
          <ComponentSection
            id="badges"
            title="Badges"
            description="ステータス表示やラベル付けに使用するバッジコンポーネント"
          >
            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Variants</h3>
              <div className={styles.demoRow}>
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">New</Badge>
                <Badge variant="secondary">Legacy</Badge>
                <Badge variant="danger">Removed</Badge>
                <Badge variant="success">Buffed</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            <CodeExample code={`<Badge variant="default">Default</Badge>
<Badge variant="primary">New</Badge>
<Badge variant="secondary">Legacy</Badge>
<Badge variant="danger">Removed</Badge>
<Badge variant="success">Buffed</Badge>
<Badge variant="outline">Outline</Badge>`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>Sizes</h3>
              <div className={styles.demoRow}>
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
              </div>
            </div>

            <CodeExample code={`<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>`} />

            <div className={styles.demoGroup}>
              <h3 className={styles.demoTitle}>With Icon</h3>
              <div className={styles.demoRow}>
                <Badge variant="primary"><span style={{ marginRight: '4px' }}>🛡️</span> Tank</Badge>
                <Badge variant="danger"><span style={{ marginRight: '4px' }}>⚔️</span> Nerf</Badge>
              </div>
            </div>

            <CodeExample code={`<Badge variant="primary">
  <span style={{ marginRight: '4px' }}>🛡️</span> Tank
</Badge>
<Badge variant="danger">
  <span style={{ marginRight: '4px' }}>⚔️</span> Nerf
</Badge>`} />
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
