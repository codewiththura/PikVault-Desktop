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
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>STANDALONE ISOLATED DB</span>
        {dbPath && (
          <span style={{ color: 'var(--text-secondary)' }}>
            PATH: {dbPath}
          </span>
        )}
      </div>

      <div>
        {selectedAccount ? (
          <span>
            ACTIVE: <strong>{selectedAccount.username}</strong> ({activeItems.length} items)
          </span>
        ) : (
          <span>NO ACCOUNT SELECTED</span>
        )}
      </div>
    </footer>
  );
};
