import React, { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import styles from './Combobox.module.css';
import { Input } from './Input';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean | string;
  disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option...',
  helperText,
  error,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize filter text based on selected value
  useEffect(() => {
    if (value) {
      const selectedOption = options.find((opt) => opt.value === value);
      if (selectedOption) {
        setFilterText(selectedOption.label);
      }
    }
  }, [value, options]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(filterText.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset filter text to selected value if no new selection was made
        if (value) {
          const selectedOption = options.find((opt) => opt.value === value);
          setFilterText(selectedOption ? selectedOption.label : '');
        } else {
          setFilterText('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (e.target.value === '') {
      onChange('');
    }
  };

  const handleOptionSelect = (option: ComboboxOption) => {
    onChange(option.value);
    setFilterText(option.label);
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleOptionSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <Input
        label={label}
        value={filterText}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        disabled={disabled}
        autoComplete="off"
        rightIcon={
          <span
            className={styles.chevron}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▼
          </span>
        }
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul className={styles.dropdown}>
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              className={`${styles.option} ${index === highlightedIndex ? styles.highlighted : ''
                } ${option.value === value ? styles.selected : ''}`}
              onClick={() => handleOptionSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {isOpen && filterText && filteredOptions.length === 0 && (
        <div className={styles.noResults}>No results found.</div>
      )}
    </div>
  );
};
