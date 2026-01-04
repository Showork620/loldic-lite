import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Link } from 'lucide-react';

export const AdminPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-hextech-gold-500/30 pb-4">
          <h1 className="text-3xl font-bold text-hextech-blue-300 font-display tracking-wide">
            Admin Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/data-sync" className="p-6 border border-hextech-metal-600 bg-hextech-black-400/30 rounded-lg hover:border-hextech-gold-500/50 transition-colors group block">
            <h3 className="text-xl font-bold text-hextech-gold-400 mb-2 group-hover:text-hextech-gold-300">Data Sync</h3>
            <p className="text-hextech-metal-400 text-sm">Update item images and manage exclusion rules.</p>
          </Link>

          <div className="p-6 border border-hextech-metal-600 bg-hextech-black-400/30 rounded-lg opacity-50 cursor-not-allowed">
            <h3 className="text-xl font-bold text-hextech-metal-500 mb-2">Item Editor</h3>
            <p className="text-hextech-metal-600 text-sm">Coming soon (Edit tags, roles, abilities)</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-hextech-black-400/50 border border-hextech-gold-500/20 rounded">
          <p className="text-center text-hextech-metal-400 italic">
            Phase 3: Admin Features (Under Construction)
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
