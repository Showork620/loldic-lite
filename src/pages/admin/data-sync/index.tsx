
import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../../components/layout/MainLayout';
import { ImageSyncSection } from './features/ImageSyncSection/ImageSyncSection';
import { ExclusionManager } from './features/ExclusionManager/ExclusionManager';
import { PatchVersionDisplay } from './features/PatchVersionDisplay';
import { PatchUpdateModal } from './features/PatchUpdateModal';
import { checkForUpdates } from '../../../lib/riot/patchManager';
import { Link } from 'react-router-dom';

export const AdminDataSyncPage: React.FC = () => {
  const [currentPatch, setCurrentPatch] = useState<string>('16.1.1');
  const [latestPatch, setLatestPatch] = useState<string>('16.1.1');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ページロード時にパッチ情報を取得
    const fetchPatchInfo = async () => {
      try {
        const result = await checkForUpdates();

        if (result.currentPatch) {
          setCurrentPatch(result.currentPatch);
        }
        setLatestPatch(result.latestPatch);

        // 新パッチがある場合はモーダル表示
        if (result.shouldUpdate) {
          setShowUpdateModal(true);
        }
      } catch (error) {
        console.error('Failed to check patch updates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatchInfo();
  }, []);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-hextech-gold-500/30 pb-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-hextech-metal-400 hover:text-hextech-gold-400 transition-colors">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-hextech-blue-300 font-display tracking-wide">
              Data Sync & Initialization
            </h1>
          </div>

          {!isLoading && (
            <PatchVersionDisplay
              currentPatch={currentPatch}
              latestPatch={latestPatch}
              isUpdateAvailable={currentPatch !== latestPatch}
            />
          )}
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

      {/* Patch Update Modal */}
      <PatchUpdateModal
        isOpen={showUpdateModal}
        currentPatch={currentPatch}
        latestPatch={latestPatch}
        onClose={() => setShowUpdateModal(false)}
      />
    </MainLayout>
  );
};

export default AdminDataSyncPage;
