import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { Input } from '../ui/Input';
import styles from './Sidebar.module.css';
import { Link } from 'react-router-dom';

interface SidebarProps {
  sections: Array<{ id: string; label: string }>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Sidebar({ sections, searchQuery, onSearchChange }: SidebarProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 各セクションの位置を取得してアクティブなセクションを判定
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id),
      }));

      const scrollPosition = window.scrollY + 100; // オフセット調整

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, element } = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // ヘッダーの高さ分のオフセット
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
      // モバイルでクリック後にサイドバーを閉じる
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* モバイル用トグルボタン */}
      <button
        className={styles.mobileToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        <Icon name={isOpen ? 'X' : 'Menu'} size={24} />
      </button>

      {/* オーバーレイ（モバイル時） */}
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarContent}>
          <h3 className={styles.title}>Components</h3>

          {/* 検索バー */}
          <div className={styles.searchContainer}>
            <Input
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Icon name="Search" size={16} />}
            />
          </div>

          <nav className={styles.nav}>
            <ul className={styles.navList}>


              {/* Original sections navigation, still using Link for hash links */}
              {
                sections.map(section => (
                  <li key={section.id}>
                    {/* Replaced <a> with Link */}
                    <Link
                      to={`#${section.id}`} // Assuming Link can handle hash links for internal navigation
                      onClick={(e) => handleNavClick(e as any, section.id)} // Cast e to any to match React.MouseEvent<HTMLAnchorElement>
                      className={`${styles.navLink} ${activeSection === section.id ? styles.active : ''}`}
                    >
                      {section.label}
                    </Link>
                  </li>
                ))
              }
            </ul >
          </nav >
        </div >
      </aside >
    </>
  );
}
