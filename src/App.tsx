import { useState } from 'react';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { Combobox } from './components/ui/Combobox';
import './App.css';

function App() {
  const [comboboxValue, setComboboxValue] = useState('');

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

      {/* Inputs */}
      <div className="section">
        <h2>Inputs</h2>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div style={{ width: '300px' }}>
            <Input label="Username" placeholder="Enter username" />
          </div>
          <div style={{ width: '300px' }}>
            <Input label="With Icon" placeholder="Search..." leftIcon="🔍" />
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
