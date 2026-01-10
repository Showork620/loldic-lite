import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';

export const PublicPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <h1 className="text-4xl font-bold text-hextech-gold-500 font-display tracking-wider filter drop-shadow-glow">
          Welcome to LoL Item Manager
        </h1>
        <p className="text-hextech-metal-300 text-lg max-w-2xl text-center">
          Explore the vast arsenal of Runeterra. Browse items, view details, and prepare for your next battle.
        </p>
        <div className="p-6 border border-hextech-gold-500/30 bg-hextech-black-400/50 rounded-lg backdrop-blur-sm">
          <p className="text-hextech-blue-300">Phase 4: Public View (Under Construction)</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default PublicPage;
