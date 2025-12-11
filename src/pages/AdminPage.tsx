import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';

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
          <div className="p-6 border border-hextech-metal-600 bg-hextech-black-400/30 rounded-lg hover:border-hextech-gold-500/50 transition-colors group">
            <h3 className="text-xl font-bold text-hextech-gold-400 mb-2 group-hover:text-hextech-gold-300">New Item</h3>
            <p className="text-hextech-metal-400 text-sm">Create a new item entry in the database.</p>
          </div>

          <div className="p-6 border border-hextech-metal-600 bg-hextech-black-400/30 rounded-lg hover:border-hextech-gold-500/50 transition-colors group">
            <h3 className="text-xl font-bold text-hextech-gold-400 mb-2 group-hover:text-hextech-gold-300">Manage Items</h3>
            <p className="text-hextech-metal-400 text-sm">Edit or delete existing items.</p>
          </div>

          <div className="p-6 border border-hextech-metal-600 bg-hextech-black-400/30 rounded-lg hover:border-hextech-gold-500/50 transition-colors group">
            <h3 className="text-xl font-bold text-hextech-gold-400 mb-2 group-hover:text-hextech-gold-300">Sync Data</h3>
            <p className="text-hextech-metal-400 text-sm">Synchronize data with Riot API.</p>
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
