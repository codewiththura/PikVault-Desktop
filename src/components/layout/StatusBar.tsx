import React from 'react';
import { useApp } from '../../context/AppContext';

export const StatusBar: React.FC = () => {
  const { dbPath, selectedAccount, activeItems } = useApp();

  return (
    <footer
      style={{
        height: 'var(--statusbar-height)',
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        color: 'var(--text-muted)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>Standalone Isolated DB</span>
        {dbPath && (
          <span style={{ color: 'var(--text-secondary)' }}>
            Path: {dbPath}
          </span>
        )}
      </div>

      <div>
        {selectedAccount ? (
          <span>
            Active: <strong>{selectedAccount.username}</strong> ({activeItems.length} items)
          </span>
        ) : (
          <span>No account selected</span>
        )}
      </div>
    </footer>

  );
};
