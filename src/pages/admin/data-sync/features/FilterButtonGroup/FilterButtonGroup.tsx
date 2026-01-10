import React from 'react';
import { Button } from '../../../../../components/ui/Button';
import styles from './FilterButtonGroup.module.css';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterButtonGroupProps {
  label?: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export const FilterButtonGroup: React.FC<FilterButtonGroupProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  return (
    <div className={styles.container}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.buttonGroup}>
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onChange(option.value);
            }}
            className={styles.button}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
