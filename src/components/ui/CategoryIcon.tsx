import {
  Axe,
  Crosshair,
  Sword,
  Book,
  Shield,
  Heart,
  Grid,
} from 'lucide-react';
import styles from './CategoryIcon.module.css';

export type IconCategory = 'Fighter' | 'Marksman' | 'Assassin' | 'Mage' | 'Tank' | 'Support' | 'All';

interface CategoryIconProps {
  category: IconCategory;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const CATEGORY_MAP = {
  Fighter: Axe,
  Marksman: Crosshair,
  Assassin: Sword,
  Mage: Book,
  Tank: Shield,
  Support: Heart,
  All: Grid,
};

export const CategoryIcon = ({ category, isActive = false, onClick, className = '' }: CategoryIconProps) => {
  const IconComponent = CATEGORY_MAP[category];

  return (
    <div
      className={`${styles.container} ${isActive ? styles.active : ''} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={category}
    >
      <IconComponent
        size={24} // Based on the screenshot, they are reasonably sized
        className={styles.icon}
      />
      {/* 
        The screenshot shows a gold underline for the active item.
        We'll handle this in CSS via pseudoelements or separate div.
      */}
      {isActive && <div className={styles.activeIndicator} />}
    </div>
  );
};
