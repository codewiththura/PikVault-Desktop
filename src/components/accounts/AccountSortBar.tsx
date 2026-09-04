import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { SearchIcon, PlusIcon, ArrowUpDownIcon } from '../common/Icons';
import { AccountSortField } from '../../types';

interface AccountSortBarProps {
  onAddAccount: () => void;
}

export const AccountSortBar: React.FC<AccountSortBarProps> = ({ onAddAccount }) => {
  const {
    accountSearch,
    setAccountSearch,
    sortField,
    sortDirection,
    setSorting,
  } = useApp();

  const getSortLabel = (field: AccountSortField, label: string) => {
    if (sortField !== field) return label;
    return `${label} ${sortDirection === 'asc' ? '↑' : '↓'}`;
  };

  return (
    <div
      style={{
        padding: '10px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Search Account Name Input */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)', display: 'flex' }}>
          <SearchIcon size={14} />
        </span>
        <input
          type="text"
          value={accountSearch}
          onChange={(e) => setAccountSearch(e.target.value)}
          placeholder="Search account name / email..."
          className="form-input"
          style={{ paddingLeft: '28px', fontSize: '12px', paddingRight: '8px' }}
        />
      </div>

      {/* Sort Buttons & New Account Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginRight: '2px' }}>
            SORT:
          </span>
          <button
            onClick={() => setSorting('name')}
            style={{
              padding: '3px 6px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              background: sortField === 'name' ? 'var(--accent-white)' : 'transparent',
              color: sortField === 'name' ? 'var(--accent-black)' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {getSortLabel('name', 'Name')}
          </button>

          <button
            onClick={() => setSorting('lastLogin')}
            style={{
              padding: '3px 6px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              background: sortField === 'lastLogin' ? 'var(--accent-white)' : 'transparent',
              color: sortField === 'lastLogin' ? 'var(--accent-black)' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
            title="Sort by Last Login"
          >
            {getSortLabel('lastLogin', 'LL')}
          </button>

          <button
            onClick={() => setSorting('storageRemain')}
            style={{
              padding: '3px 6px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              background: sortField === 'storageRemain' ? 'var(--accent-white)' : 'transparent',
              color: sortField === 'storageRemain' ? 'var(--accent-black)' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
            title="Sort by Remaining Storage"
          >
            {getSortLabel('storageRemain', 'Storage')}
          </button>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<PlusIcon size={12} />}
          onClick={onAddAccount}
          title="Add new account record"
        >
          New
        </Button>
      </div>
    </div>
  );
};
