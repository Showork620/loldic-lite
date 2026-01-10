import { Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from './components/ui/SnackbarProvider';
import ComponentCatalog from './pages/dev/catalog';
import PublicPage from './pages/public';
import AdminPage from './pages/admin';
import AdminDataSyncPage from './pages/admin/data-sync';

function App() {
  return (
    <SnackbarProvider>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/data-sync" element={<AdminDataSyncPage />} />
        <Route path="/dev/catalog" element={<ComponentCatalog />} />
      </Routes>
    </SnackbarProvider >
  );
}

export default App;
