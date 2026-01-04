import { Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from './components/ui/SnackbarProvider';
import { ComponentCatalog } from './pages/ComponentCatalog';
import { PublicPage } from './pages/PublicPage';
import { AdminPage } from './pages/AdminPage';
import { AdminDataSyncPage } from './pages/admin/AdminDataSyncPage';

function App() {
  return (
    <SnackbarProvider>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/data-sync" element={<AdminDataSyncPage />} />
        <Route path="/catalog" element={<ComponentCatalog />} />
      </Routes>
    </SnackbarProvider >
  );
}

export default App;
