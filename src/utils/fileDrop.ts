import type { DroppedFileInfo } from '../types/index.js';

/**
 * Extracts and formats metadata from a dropped DOM File object
 */
export function extractFileMetadata(file: { name: string; size: number }): DroppedFileInfo {
  const originalSize = Math.max(0, file.size || 0);
  
  // Convert bytes to Megabytes (1 MB = 1024 * 1024 bytes)
  const mb = originalSize / (1024 * 1024);
  let fileSizeMB = Number(mb.toFixed(2));
  if (originalSize > 0 && fileSizeMB === 0) {
    fileSizeMB = 0.01; // Minimum precision for non-empty sub-megabyte files
  }

  // Extract clean file extension
  const parts = file.name.split('.');
  let ext = '';
  if (parts.length > 1) {
    ext = (parts.pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  if (!ext) {
    ext = 'other';
  }

  return {
    fileName: file.name,
    fileSizeMB,
    fileType: ext,
    originalSize,
  };
}

/**
 * Formats byte size into human-readable representation
 */
export function formatDroppedFileSize(bytes: number): string {
  if (bytes <= 0 || isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const clampedIndex = Math.min(i, units.length - 1);
  const size = bytes / Math.pow(1024, clampedIndex);
  return `${size.toFixed(clampedIndex === 0 ? 0 : 2)} ${units[clampedIndex]}`;
}

/**
 * Validates if a DragEvent contains external OS files
 */
export function isFilesDragEvent(e: DragEvent | React.DragEvent): boolean {
  if (!e.dataTransfer) return false;
  const types = Array.from(e.dataTransfer.types || []);
  return types.includes('Files');
}
