import { useState } from 'react';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { Combobox } from './components/ui/Combobox';
import { Icon } from './components/ui/Icon';
import { CategoryIcon, type IconCategory } from './components/ui/CategoryIcon';
import './App.css';

function App() {
  const [comboboxValue, setComboboxValue] = useState('');
  const [activeCategory, setActiveCategory] = useState<IconCategory>('All');

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
    <div className="layout">
      <h1 className="title">Hextech Components</h1>

      {/* Buttons */}
      <div className="section">
        <h2>Buttons</h2>
        <div className="row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>

      {/* Icons */}
      <div className="section">
        <h2>Icons</h2>
        <div className="row" style={{ alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <h3>Generic</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Icon name="Search" color="primary" />
              <Icon name="User" color="gold" />
              <Icon name="Settings" color="secondary" />
              <Icon name="AlertCircle" color="danger" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <h3>Category Icons (Interactive)</h3>
            <div style={{ display: 'flex', gap: '8px', padding: '10px', background: 'var(--color-navy-900)', borderRadius: '4px' }}>
              {categories.map((cat) => (
                <CategoryIcon
                  key={cat}
                  category={cat}
                  isActive={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                />
              ))}
            </div>
            <span>Selected: {activeCategory}</span>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="section">
        <h2>Inputs</h2>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div style={{ width: '300px' }}>
            <Input label="Username" placeholder="Enter username" />
          </div>
          <div style={{ width: '300px' }}>
            <Input
              label="With Icon"
              placeholder="Search..."
              leftIcon={<Icon name="Search" size={18} />}
            />
          </div>
          <div style={{ width: '300px' }}>
            <Input label="Error State" error="Invalid input" defaultValue="Wrong value" />
          </div>
        </div>
      </div>

      {/* Selects */}
      <div className="section">
        <h2>Selects</h2>
        <div className="row">
          <div style={{ width: '300px' }}>
            <Select label="Choose Option" options={selectOptions} />
          </div>
          <div style={{ width: '300px' }}>
            <Select label="Disabled" options={selectOptions} disabled />
          </div>
        </div>
      </div>

      {/* Combobox */}
      <div className="section">
        <h2>Combobox (Autocomplete)</h2>
        <div className="row">
          <div style={{ width: '300px' }}>
            <Combobox
              label="Champion"
              options={comboboxOptions}
              value={comboboxValue}
              onChange={setComboboxValue}
              placeholder="Type to search..."
            />
          </div>
          <div style={{ paddingTop: '30px' }}>
            Selected: {comboboxValue}
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
