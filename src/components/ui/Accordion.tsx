import React, { useState } from 'react';
import styles from './Accordion.module.css';

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  count?: number;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  className = '',
  count,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={styles.header}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-expanded={isOpen}
      >
        <div className={styles.titleGroup}>
          <svg
            className={`${styles.icon} ${isOpen ? styles.expanded : ''}`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className={styles.title}>
            {title}
          </div>
        </div>
        {count !== undefined && <div className={styles.count}>({count})</div>}
      </div>
      <div className={`${styles.content} ${isOpen ? styles.expanded : ''}`}>
        {children}
      </div>
    </div>
  );
};
