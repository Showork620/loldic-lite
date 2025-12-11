import {
  Search,
  User,
  Settings,
  Menu,
  X,
  Home,
  LogOut,
  Edit,
  Trash, // or Trash2
  Plus,
  Minus,
  Check,
  Copy,
  ALargeSmall, // Text size or similar? Maybe Type?
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Filter
} from 'lucide-react';
import { type ComponentProps } from 'react';

// Define the available icons map manually to avoid tree-shaking issues
const ICONS = {
  Search,
  User,
  Settings,
  Menu,
  X,
  Home,
  LogOut,
  Edit,
  Trash,
  Plus,
  Minus,
  Check,
  Copy,
  ALargeSmall,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Filter
} as const;

export type IconName = keyof typeof ICONS;
export type IconColor = 'primary' | 'secondary' | 'gold' | 'danger' | 'default';

interface IconProps extends Omit<ComponentProps<'svg'>, 'ref'> {
  name: IconName;
  size?: number | string;
  color?: IconColor;
}

const COLOR_MAP: Record<IconColor, string> = {
  primary: 'text-hextech-blue-400',
  secondary: 'text-text-secondary',
  gold: 'text-gold-400',
  danger: 'text-danger',
  default: 'text-text-primary',
};

export const Icon = ({ name, size = 24, color = 'default', className = '', ...props }: IconProps) => {
  const LucideIcon = ICONS[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const colorClass = COLOR_MAP[color];

  return (
    <LucideIcon
      size={size}
      className={`${colorClass} ${className}`}
      {...props}
    />
  );
};
