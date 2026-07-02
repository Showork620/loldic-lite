import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Link } from 'react-router-dom';

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
          <Link to="/admin/patches" className="p-6 border border-hextech-metal-600 bg-hextech-black-400/30 rounded-lg hover:border-hextech-gold-500/50 transition-colors group block">
            <h3 className="text-xl font-bold text-hextech-gold-400 mb-2 group-hover:text-hextech-gold-300">パッチ管理</h3>
            <p className="text-hextech-metal-400 text-sm">パッチの取り込み状況・パッチノートURL・公開状態の管理。</p>
          </Link>

          <Link to="/admin/review" className="p-6 border border-hextech-metal-600 bg-hextech-black-400/30 rounded-lg hover:border-hextech-gold-500/50 transition-colors group block">
            <h3 className="text-xl font-bold text-hextech-gold-400 mb-2 group-hover:text-hextech-gold-300">変更レビュー</h3>
            <p className="text-hextech-metal-400 text-sm">自動生成された変更提案の承認・修正・却下。</p>
          </Link>

          <Link to="/admin/data-sync" className="p-6 border border-hextech-metal-600 bg-hextech-black-400/30 rounded-lg hover:border-hextech-gold-500/50 transition-colors group block">
            <h3 className="text-xl font-bold text-hextech-gold-400 mb-2 group-hover:text-hextech-gold-300">Data Sync</h3>
            <p className="text-hextech-metal-400 text-sm">アイテム画像の更新と除外ルール（手動設定）の管理。</p>
          </Link>

          <Link to="/admin/tag-and-role-management" className="p-6 border border-hextech-metal-600 bg-hextech-black-400/30 rounded-lg hover:border-hextech-gold-500/50 transition-colors group block">
            <h3 className="text-xl font-bold text-hextech-gold-400 mb-2 group-hover:text-hextech-gold-300">タグ・ロール管理</h3>
            <p className="text-hextech-metal-400 text-sm">追加タグとロール分類の登録・削除。</p>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPage;
