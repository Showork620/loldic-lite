import { useState, useEffect, useRef } from 'react';
import { Icon } from '../ui/Icon';
import { Container } from './Container';
import styles from './Header.module.css';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY.current;

      // 小さなスクロールは無視してチラつきを防止 (閾値 10px)
      if (Math.abs(scrollDiff) < 10) {
        return;
      }

      // 下スクロール かつ 上部からある程度離れている場合 -> 隠す
      if (scrollDiff > 0 && currentScrollY > 100) {
        setIsVisible(false);
      }
      // 上スクロール -> 表示
      else if (scrollDiff < 0) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`${styles.header} ${!isVisible ? styles.hidden : ''}`}>
      <Container className={styles.headerInner}>
        {/* Logo/Title */}
        <a href="/" className={styles.logo}>
          <Icon name="Home" size={32} color="primary" className={styles.logoIcon} />
          <h1 className={styles.logoText}>Hextech</h1>
        </a>

        {/* Mobile Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <Icon name={isMenuOpen ? 'X' : 'Menu'} size={24} />
        </button>

        {/* Navigation */}
        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
          <ul className={styles.navList}>
            <li>
              <a href="#catalog" className={`${styles.navLink} ${styles.active}`}>
                Components
              </a>
            </li>
            <li>
              <a href="#admin" className={styles.navLink}>
                Admin
              </a>
            </li>
            <li>
              <a href="#items" className={styles.navLink}>
                Items
              </a>
            </li>
          </ul>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.actionButton}>
              <Icon name="Settings" size={16} />
              <span>Settings</span>
            </button>
          </div>
        </nav>
      </Container>
    </header>
  );
}
