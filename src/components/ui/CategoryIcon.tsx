import {
  FighterIcon,
  MarksmanIcon,
  AssassinIcon,
  MageIcon,
  TankIcon,
  SupportIcon,
  AllIcon,
} from './icons/RoleIcons';
import styles from './CategoryIcon.module.css';

export type IconCategory = 'Fighter' | 'Marksman' | 'Assassin' | 'Mage' | 'Tank' | 'Support' | 'All';

interface CategoryIconProps {
  category: IconCategory;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const CATEGORY_MAP = {
  Fighter: FighterIcon,
  Marksman: MarksmanIcon,
  Assassin: AssassinIcon,
  Mage: MageIcon,
  Tank: TankIcon,
  Support: SupportIcon,
  All: AllIcon,
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
