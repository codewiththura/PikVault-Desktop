import React from 'react';
import { calculateStorage, formatMB } from '../../utils/storage';
import { StoredItem } from '../../types';

interface StorageGaugeProps {
  items?: StoredItem[];
  totalUsedMB?: number;
  maxStorageGB?: number;
  compact?: boolean;
}

export const StorageGauge: React.FC<StorageGaugeProps> = ({
  items,
  totalUsedMB: propUsedMB,
  maxStorageGB = 6,
  compact = false,
}) => {
  const calculation = items 
    ? calculateStorage(items, maxStorageGB)
    : {
        totalUsedMB: propUsedMB || 0,
        maxStorageMB: maxStorageGB * 1024,
        remainingMB: Math.max(0, (maxStorageGB * 1024) - (propUsedMB || 0)),
        remainingGB: Number((Math.max(0, (maxStorageGB * 1024) - (propUsedMB || 0)) / 1024).toFixed(2)),
        usedPercent: Math.min(100, Number((((propUsedMB || 0) / (maxStorageGB * 1024)) * 100).toFixed(1))),
        isExceeded: (propUsedMB || 0) > (maxStorageGB * 1024),
      };

  const { totalUsedMB, remainingGB, usedPercent, isExceeded } = calculation;

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <span style={{ color: isExceeded ? 'var(--accent-danger)' : 'var(--text-primary)', fontWeight: 600 }}>
          {isExceeded ? 'Quota exceeded' : `${remainingGB} GB remain`}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          {formatMB(totalUsedMB)} / {maxStorageGB} GB
        </span>
      </div>


      {/* Flat Monochrome Progress Gauge */}
      <div
        style={{
          width: '100%',
          height: compact ? '4px' : '8px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, usedPercent)}%`,
            borderRadius: 'var(--radius-full)',
            background: isExceeded 
              ? 'var(--accent-danger)' 
              : usedPercent > 80 
                ? 'var(--accent-warning)' 
                : 'var(--accent-white)',
            transition: 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  );
};
