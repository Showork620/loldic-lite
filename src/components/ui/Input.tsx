import React, { type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  error,
  leftIcon,
  rightIcon,
  label,
  helperText,
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.inputWrapper}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

        <input
          id={inputId}
          className={`
            ${styles.input} 
            ${leftIcon ? styles.hasLeftIcon : ''} 
            ${rightIcon ? styles.hasRightIcon : ''}
            ${error ? styles.hasError : ''}
          `}
          {...props}
        />

        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>

      {(error || helperText) && (
        <span className={`${styles.helperText} ${error ? styles.errorText : ''}`}>
          {typeof error === 'string' ? error : helperText}
        </span>
      )}
    </div>
  );
};
