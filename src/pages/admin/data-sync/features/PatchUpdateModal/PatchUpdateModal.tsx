import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Dialog } from '../../../../../components/ui/Dialog';

interface PatchUpdateModalProps {
  isOpen: boolean;
  currentPatch: string;
  latestPatch: string;
  onClose: () => void;
}

export const PatchUpdateModal: React.FC<PatchUpdateModalProps> = ({
  isOpen,
  currentPatch,
  latestPatch,
  onClose
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="relative bg-hextech-black-300 border border-hextech-gold-500/50 rounded-lg shadow-2xl p-6 max-w-md w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-hextech-metal-400 hover:text-hextech-gold-400 transition-colors"
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-hextech-gold-400 text-center mb-4 font-display">
          新しいパッチが利用可能です
        </h2>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div className="bg-hextech-black-400/50 rounded p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-hextech-metal-400">現在のパッチ:</span>
              <span className="font-mono font-semibold text-hextech-blue-300">
                v{currentPatch}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-hextech-metal-400">最新パッチ:</span>
              <span className="font-mono font-semibold text-hextech-gold-400">
                v{latestPatch}
              </span>
            </div>
          </div>

          <p className="text-hextech-metal-300 text-center">
            新しいパッチバージョンが検出されました。<br />
            アイテムデータを更新することを推奨します。
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-hextech-gold-500 hover:bg-hextech-gold-400 text-hextech-black-100 font-semibold rounded transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </Dialog>
  );
};
