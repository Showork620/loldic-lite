import { Dialog } from './Dialog';
import { Button } from './Button';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'info' | 'warning' | 'danger';
  showIcon?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '確認',
  cancelLabel = 'キャンセル',
  onConfirm,
  onCancel,
  variant = 'info',
  showIcon = true,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onCancel(); // ダイアログを閉じる
  };

  // バリアント別のアイコン
  const getIcon = () => {
    if (!showIcon) return null;

    switch (variant) {
      case 'info':
        return (
          <svg
            className={styles.icon}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className={styles.icon}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 20h20L12 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
          </svg>
        );
      case 'danger':
        return (
          <svg
            className={styles.icon}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  // バリアント別のButtonバリアント
  const getButtonVariant = () => {
    switch (variant) {
      case 'info':
        return 'primary';
      case 'warning':
        return 'primary';
      case 'danger':
        return 'danger';
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onCancel} title={title} maxWidth="sm">
      <div className={`${styles.confirmDialog} ${styles[variant]}`}>
        {showIcon && <div className={styles.iconContainer}>{getIcon()}</div>}

        <div className={styles.messageContainer}>
          {typeof message === 'string' ? <p className={styles.message}>{message}</p> : message}
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={getButtonVariant()} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
