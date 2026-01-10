
import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/Button';
import { ProgressBar } from '../../../../../components/ui/ProgressBar';
import { updateAllItemImages } from '../../../../../lib/supabase/imageUpdater';
import { useSnackbar } from '../../../../../components/ui/useSnackbar';

export const ImageSyncSection: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const { showSnackbar } = useSnackbar();

  const handleUpdate = async () => {
    try {
      // ユーザーに確認
      if (!confirm('Riot APIから全アイテム画像を取得し、Supabaseへ再アップロードします。これには時間がかかります。続行しますか？')) {
        return;
      }

      setIsUpdating(true);
      setProgress(0);
      setStatusMessage('初期化中...');

      await updateAllItemImages((processed, total, message) => {
        const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
        setProgress(percentage);
        setStatusMessage(message);
      });

      setStatusMessage('更新完了！');
      showSnackbar('画像の更新が完了しました', 'success');
    } catch (error) {
      console.error('Update failed:', error);
      setStatusMessage(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
      showSnackbar('画像の更新に失敗しました。コンソールを確認してください。', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 border border-hextech-metal-600 bg-hextech-black-400/30 rounded-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-hextech-gold-400 mb-1">アイテム画像同期</h3>
          <p className="text-hextech-metal-400 text-sm">
            Riot APIから最新の画像をフェッチし、圧縮して保存します。
            <br />
            <span className="text-xs text-hextech-warning-500">
              ※既存の画像は上書きされます。
            </span>
          </p>
        </div>
        {!isUpdating && (
          <Button onClick={handleUpdate} variant="primary" size="sm">
            画像を更新
          </Button>
        )}
      </div>

      {isUpdating && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <ProgressBar value={progress} showPercentage />
          <p className="text-xs text-hextech-blue-300 font-mono text-right">
            {statusMessage}
          </p>
        </div>
      )}
    </div>
  );
};
