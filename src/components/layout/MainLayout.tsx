import { type ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Container } from './Container';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.content}>
        <Container>{children}</Container>
      </main>
      <Footer />
    </div>
  );
}
