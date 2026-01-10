import type { ReactNode } from 'react';
import styles from './ComponentSection.module.css';

interface ComponentSectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function ComponentSection({ id, title, description, children }: ComponentSectionProps) {
  return (
    <section id={id} className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </section>
  );
}
