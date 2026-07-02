import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../../components/ui/Button';
import { Dialog } from '../../../../../components/ui/Dialog';
import { Input } from '../../../../../components/ui/Input';
import { useSnackbar } from '../../../../../components/ui/useSnackbar';
import {
  updatePatchnoteUrl,
  updatePatchStatus,
  type PatchListRow,
} from '../../../../../lib/supabase/reviewData';
import styles from './PatchList.module.css';

const STATUS_LABEL: Record<PatchListRow['status'], string> = {
  draft: '下書き',
  ingested: '取込済み',
  reviewed: 'レビュー済み',
  published: '公開中',
};

interface PatchListProps {
  patches: PatchListRow[];
  onChanged: () => void;
}

export const PatchList: React.FC<PatchListProps> = ({ patches, onChanged }) => {
  const [urlDialogPatch, setUrlDialogPatch] = useState<PatchListRow | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const { showSnackbar } = useSnackbar();

  const handleSaveUrl = async () => {
    if (!urlDialogPatch) return;
    try {
      await updatePatchnoteUrl(urlDialogPatch.version, urlInput);
      showSnackbar(
        `URLを登録しました。pipeline:fetch-note -- --patch ${urlDialogPatch.version} --url <URL> で取得してください`,
        'success'
      );
      setUrlDialogPatch(null);
      onChanged();
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : 'URL登録失敗', 'error');
    }
  };

  const handleMarkReviewed = async (patch: PatchListRow) => {
    try {
      await updatePatchStatus(patch.version, 'reviewed');
      showSnackbar(
        `${patch.version} をレビュー済みにしました。公開は pipeline:publish で実行してください`,
        'success'
      );
      onChanged();
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : '状態更新失敗', 'error');
    }
  };

  if (patches.length === 0) {
    return (
      <p className={styles.empty}>
        パッチがまだ登録されていません。pipeline:ingest（または backfill）を実行してください。
      </p>
    );
  }

  return (
    <div className={styles.list}>
      {patches.map((patch) => (
        <div key={patch.version} className={styles.row}>
          <div className={styles.versionCell}>
            <span className={styles.version}>{patch.version}</span>
            {patch.kind === 'hotfix' && <span className={styles.hotfix}>hotfix</span>}
            {patch.ddragonVersion && (
              <span className={styles.ddragon}>DDragon {patch.ddragonVersion}</span>
            )}
          </div>
          <div className={styles.statusCell}>
            <span className={`${styles.status} ${styles[`status_${patch.status}`]}`}>
              {STATUS_LABEL[patch.status]}
            </span>
            {patch.pendingCount > 0 && (
              <span className={styles.pending}>レビュー待ち {patch.pendingCount} 件</span>
            )}
          </div>
          <div className={styles.actions}>
            {patch.patchnoteUrl ? (
              <a
                href={patch.patchnoteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.noteLink}
              >
                ノート原文
              </a>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setUrlDialogPatch(patch);
                  setUrlInput('');
                }}
              >
                URL登録
              </Button>
            )}
            <Link to={`/admin/review?patch=${encodeURIComponent(patch.version)}`}>
              <Button size="sm" variant="secondary">レビュー</Button>
            </Link>
            {patch.status === 'ingested' && patch.pendingCount === 0 && (
              <Button size="sm" variant="primary" onClick={() => handleMarkReviewed(patch)}>
                レビュー完了
              </Button>
            )}
          </div>
        </div>
      ))}

      <Dialog
        isOpen={urlDialogPatch !== null}
        onClose={() => setUrlDialogPatch(null)}
        title={`パッチノートURL登録: ${urlDialogPatch?.version ?? ''}`}
      >
        <div className={styles.dialogBody}>
          <Input
            label="パッチノートURL（ja-jp）"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.leagueoflegends.com/ja-jp/news/game-updates/..."
          />
          <p className={styles.dialogNote}>
            登録後、pipeline:fetch-note → extract → propose を実行すると解析結果がレビューに並びます。
          </p>
          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setUrlDialogPatch(null)}>
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleSaveUrl} disabled={!urlInput}>
              登録
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
