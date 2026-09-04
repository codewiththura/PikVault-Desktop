import type { StoredItem } from '../types/index.js';

export const MAX_STORAGE_GB_DEFAULT = 6;
export const MB_PER_GB = 1024;

export interface StorageCalculation {
  totalUsedMB: number;
  maxStorageMB: number;
  remainingMB: number;
  remainingGB: number;
  usedPercent: number;
  isExceeded: boolean;
}

/**
 * Calculates storage metrics given an array of stored item records
 * Max quota is 6 GB (6,144 MB)
 */
export function calculateStorage(
  items: StoredItem[] = [],
  maxGB: number = MAX_STORAGE_GB_DEFAULT
): StorageCalculation {
  const maxStorageMB = maxGB * MB_PER_GB;
  const totalUsedMB = items.reduce((sum, item) => {
    return sum + (Number(item.fileSizeMB) || 0);
  }, 0);

  const remainingMB = Math.max(0, maxStorageMB - totalUsedMB);
  const remainingGB = Number((remainingMB / MB_PER_GB).toFixed(2));
  const usedPercent = Math.min(100, Number(((totalUsedMB / maxStorageMB) * 100).toFixed(1)));
  const isExceeded = totalUsedMB > maxStorageMB;

  return {
    totalUsedMB: Number(totalUsedMB.toFixed(2)),
    maxStorageMB,
    remainingMB: Number(remainingMB.toFixed(2)),
    remainingGB,
    usedPercent,
    isExceeded,
  };
}

/**
 * Format megabytes to readable display string (KB / MB / GB)
 */
export function formatMB(mb?: number): string {
  if (mb === undefined || mb === null || isNaN(mb) || mb === 0) {
    return '0 MB';
  }
  if (mb >= MB_PER_GB) {
    return `${(mb / MB_PER_GB).toFixed(2)} GB`;
  }
  if (mb < 1) {
    return `${(mb * 1024).toFixed(0)} KB`;
  }
  return `${mb.toFixed(1)} MB`;
}

/**
 * Convert user input (e.g. "1.5 GB" or "500 MB") to MB number
 */
export function parseSizeInputToMB(input: string | number): number {
  if (typeof input === 'number') {
    return isNaN(input) ? 0 : input;
  }
  if (!input || !input.trim()) {
    return 0;
  }

  const clean = input.trim().toLowerCase();
  const numericMatch = clean.match(/([\d.]+)/);
  if (!numericMatch) return 0;

  const value = parseFloat(numericMatch[1]);
  if (isNaN(value)) return 0;

  if (clean.includes('gb') || clean.includes('g')) {
    return value * MB_PER_GB;
  }
  if (clean.includes('kb') || clean.includes('k')) {
    return value / 1024;
  }
  // Default treat as MB
  return value;
}
