import React, { type SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  helperText?: string;
  error?: boolean | string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  label,
  helperText,
  error,
  className = '',
  id,
  placeholder,
  ...props
}) => {
  const selectId = id || props.name;

  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.selectWrapper}>
        <select
          id={selectId}
          className={`${styles.select} ${error ? styles.hasError : ''}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled selected>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom arrow icon */}
        <span className={styles.arrowIcon}>▼</span>
      </div>

      {(error || helperText) && (
        <span className={`${styles.helperText} ${error ? styles.errorText : ''}`}>
          {typeof error === 'string' ? error : helperText}
        </span>
      )}
    </div>
  );
};
