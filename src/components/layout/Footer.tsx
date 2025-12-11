import { Icon } from '../ui/Icon';
import { Container } from './Container';
import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.footerInner}>
        <div className={styles.footerContent}>
          {/* Copyright */}
          <p className={styles.copyright}>
            © {currentYear} <a href="/">Hextech</a>. All rights reserved.
          </p>

          {/* Links */}
          <ul className={styles.links}>
            <li>
              <a href="#about" className={styles.link}>
                <Icon name="Info" size={16} className={styles.linkIcon} />
                About
              </a>
            </li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <Icon name="Home" size={16} className={styles.linkIcon} />
                GitHub
              </a>
            </li>
            <li>
              <a href="#contact" className={styles.link}>
                <Icon name="User" size={16} className={styles.linkIcon} />
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Credits */}
        <p className={styles.credits}>
          Inspired by <a href="https://www.leagueoflegends.com">League of Legends</a> • Built with React
        </p>
      </Container>
    </footer>
  );
}
