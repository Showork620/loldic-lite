import { Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from './components/ui/SnackbarProvider';
import { ComponentCatalog } from './pages/ComponentCatalog';
import { PublicPage } from './pages/PublicPage';
import { AdminPage } from './pages/AdminPage';
import { SyncPage } from './pages/admin/SyncPage';


function App() {
  return (
    <SnackbarProvider>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/sync" element={<SyncPage />} />
        <Route path="/catalog" element={<ComponentCatalog />} />
      </Routes>
    </SnackbarProvider>
  );
}

export default App;
