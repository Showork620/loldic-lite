import { Routes, Route } from 'react-router-dom';
import { ComponentCatalog } from './pages/ComponentCatalog';
import { PublicPage } from './pages/PublicPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/catalog" element={<ComponentCatalog />} />
    </Routes>
  );
}

export default App;
