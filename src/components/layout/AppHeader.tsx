import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { SearchIcon, DownloadIcon, UploadIcon, SettingsIcon } from '../common/Icons';

export const AppHeader: React.FC = () => {
  const {
    accounts,
    setIsGlobalSearchOpen,
    setIsSettingsModalOpen,
    exportBackup,
    importBackup,
    setError,
  } = useApp();

  // Calculate global summary stats
  const totalAccounts = accounts.length;
  const totalItems = accounts.reduce((sum, a) => sum + (a.itemCount || 0), 0);
  const totalUsedMB = accounts.reduce((sum, a) => sum + (a.totalUsedMB || 0), 0);
  const totalUsedGB = (totalUsedMB / 1024).toFixed(2);

  const handleExport = async () => {
    const res = await exportBackup();
    if (res.success && res.filePath) {
      alert(`Backup exported successfully to:\n${res.filePath}`);
    } else if (res.error && res.error !== 'Cancelled') {
      setError(`Backup export error: ${res.error}`);
    }
  };

  const handleImport = async () => {
    if (confirm('Importing will merge accounts and data from backup JSON. Continue?')) {
      const res = await importBackup();
      if (res.success) {
        alert(`Successfully imported ${res.importedCount} records!`);
      } else if (res.error && res.error !== 'Cancelled') {
        setError(`Backup import error: ${res.error}`);
      }
    }
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-strong)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        userSelect: 'none',
      }}
    >
      {/* App Branding & Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              background: 'var(--accent-white)',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            ACCOUNT VAULT
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              padding: '1px 5px',
            }}
          >
            LINUX NATIVE
          </span>
        </div>

        {/* Aggregate Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            borderLeft: '1px solid var(--border-subtle)',
            paddingLeft: '14px',
          }}
        >
          <span>
            ACCOUNTS: <strong style={{ color: 'var(--text-primary)' }}>{totalAccounts}</strong>
          </span>
          <span>
            ITEMS: <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong>
          </span>
          <span>
            CATALOGED: <strong style={{ color: 'var(--text-primary)' }}>{totalUsedGB} GB</strong>
          </span>
        </div>
      </div>

      {/* Global Search Hotkey Button & Backups */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            padding: '5px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'all var(--transition-fast)',
          }}
          title="Search stored data across all accounts (Ctrl+K)"
        >
          <SearchIcon size={14} />
          <span>Global Search Data...</span>
          <kbd
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-strong)',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '1px 5px',
              color: 'var(--text-primary)',
            }}
          >
            Ctrl+K
          </kbd>
        </button>

        <Button
          size="sm"
          variant="secondary"
          icon={<DownloadIcon size={13} />}
          onClick={handleExport}
          title="Export database records as JSON backup"
        >
          Export
        </Button>

        <Button
          size="sm"
          variant="secondary"
          icon={<UploadIcon size={13} />}
          onClick={handleImport}
          title="Import database records from JSON backup"
        >
          Import
        </Button>

        <Button
          size="sm"
          variant="secondary"
          icon={<SettingsIcon size={13} />}
          onClick={() => setIsSettingsModalOpen(true)}
          title="Adjust Theme and Font Size Settings"
        >
          Settings
        </Button>
      </div>
    </header>
  );
};
