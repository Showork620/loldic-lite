import { Dialog } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import type { RawRiotItemData } from '../../../types/item';
import styles from './RawDataModal.module.css';

interface RawDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawData: RawRiotItemData;
  riotId: string;
}

export const RawDataModal: React.FC<RawDataModalProps> = ({
  isOpen,
  onClose,
  rawData,
  riotId,
}) => {
  const content = JSON.stringify(rawData, null, 2);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`元データ: ${riotId}`} maxWidth="lg">
      <div className={styles.container}>
        <pre className={styles.jsonDisplay}>{content}</pre>
        <div className={styles.footer}>
          <Button onClick={onClose} variant="primary" size="md">
            閉じる
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
