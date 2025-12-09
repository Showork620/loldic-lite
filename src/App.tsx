import { Button } from './components/ui/Button';
import './App.css';

function App() {
  return (
    <div className="layout">
      <h1 className="title">Hextech Buttons</h1>

      <div className="section">
        <h2>Variants</h2>
        <div className="row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>

      <div className="section">
        <h2>Sizes</h2>
        <div className="row">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      <div className="section">
        <h2>States</h2>
        <div className="row">
          <Button disabled>Disabled</Button>
          <Button isLoading>Loading</Button>
          <Button variant="secondary" disabled>Disabled Sec</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
