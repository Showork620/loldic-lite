import { useState } from 'react';
import { Icon } from '../ui/Icon';
import styles from './CodeExample.module.css';

interface CodeExampleProps {
  code: string;
  language?: string;
}

export function CodeExample({ code, language = 'tsx' }: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.language}>{language}</span>
        <button
          onClick={handleCopy}
          className={styles.copyButton}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Icon name="Check" size={16} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Icon name="Copy" size={16} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className={styles.codeBlock}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
