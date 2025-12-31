import React, { useState, useMemo } from 'react';
import styles from './DataTable.module.css';


export interface Column<T> {
  key: string;
  header: string;
  // Custom render function. If not provided, T[key] is rendered.
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  // Optional width/style
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({
  columns,
  data,
  pagination = false,
  pageSize = 10,
  className = '',
  emptyMessage = 'No data available',
  onRowClick,
}: DataTableProps<T>) {
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Handle Sort Request
  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else direction = null; // Toggle off
    }
    setSortConfig(direction ? { key, direction } : null);
  };

  // Process Data (Sort)
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a: any, b: any) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Process Data (Pagination)
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Pagination Controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className="overflow-x-auto">
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${styles.th} ${col.sortable ? styles.sortable : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && sortConfig?.key === col.key && (
                      <span className={styles.sortIcon}>
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(item)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <td key={`${index}-${col.key}`} className={styles.td}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className={styles.emptyState}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Page {currentPage} of {totalPages} ({sortedData.length} items)
          </div>
          <div className={styles.pageControls}>
            <button
              className={styles.pageButton}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className={styles.pageButton}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
