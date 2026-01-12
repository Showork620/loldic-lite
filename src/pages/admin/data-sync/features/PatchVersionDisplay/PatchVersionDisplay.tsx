import React from 'react';
import { AlertCircle } from 'lucide-react';

interface PatchVersionDisplayProps {
  currentPatch: string;
  latestPatch: string;
  isUpdateAvailable: boolean;
}

export const PatchVersionDisplay: React.FC<PatchVersionDisplayProps> = ({
  currentPatch,
  latestPatch,
  isUpdateAvailable
}) => {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-hextech-metal-400">現在のパッチ:</span>
        <span className="font-mono font-semibold text-hextech-blue-300">
          v{currentPatch}
        </span>
      </div>

      <div className="h-4 w-px bg-hextech-metal-600" />

      <div className="flex items-center gap-2">
        <span className="text-hextech-metal-400">最新パッチ:</span>
        <span className="font-mono font-semibold text-hextech-gold-400">
          v{latestPatch}
        </span>
        {isUpdateAvailable && (
          <AlertCircle
            className="w-4 h-4 text-yellow-500 animate-pulse"
            aria-label="更新が利用可能"
          />
        )}
      </div>
    </div>
  );
};
