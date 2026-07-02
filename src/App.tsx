import { Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from './components/ui/SnackbarProvider';
import { RequireAuth } from './components/admin/RequireAuth';
import ComponentCatalog from './pages/dev/catalog';
import PublicPage from './pages/public';
import ItemDetailPage from './pages/item';
import AdminPage from './pages/admin';
import AdminDataSyncPage from './pages/admin/data-sync';
import AdminLoginPage from './pages/admin/login';
import AdminPatchesPage from './pages/admin/patches';
import AdminReviewPage from './pages/admin/review';
import TagAndRoleManagementPage from './pages/admin/tag-and-role-management';

function App() {
  return (
    <SnackbarProvider>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/item/:riotId" element={<ItemDetailPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
        <Route path="/admin/data-sync" element={<RequireAuth><AdminDataSyncPage /></RequireAuth>} />
        <Route path="/admin/patches" element={<RequireAuth><AdminPatchesPage /></RequireAuth>} />
        <Route path="/admin/review" element={<RequireAuth><AdminReviewPage /></RequireAuth>} />
        <Route
          path="/admin/tag-and-role-management"
          element={<RequireAuth><TagAndRoleManagementPage /></RequireAuth>}
        />
        <Route path="/dev/catalog" element={<ComponentCatalog />} />
      </Routes>
    </SnackbarProvider >
  );
}

export default App;
