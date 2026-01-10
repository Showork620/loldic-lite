
import React from 'react';
import { MainLayout } from '../../../components/layout/MainLayout';
import { ImageSyncSection } from './features/ImageSyncSection/ImageSyncSection';
import { ExclusionManager } from './features/ExclusionManager/ExclusionManager';
import { Link } from 'react-router-dom';

export const AdminDataSyncPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 border-b border-hextech-gold-500/30 pb-4">
          <Link to="/admin" className="text-hextech-metal-400 hover:text-hextech-gold-400 transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-hextech-blue-300 font-display tracking-wide">
            Data Sync & Initialization
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <section>
            <h2 className="text-2xl font-bold text-hextech-gold-500 mb-4 border-l-4 border-hextech-blue-500 pl-3">
              Image Synchronization
            </h2>
            <ImageSyncSection />
          </section>

          <section>
            <ExclusionManager />
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDataSyncPage;
