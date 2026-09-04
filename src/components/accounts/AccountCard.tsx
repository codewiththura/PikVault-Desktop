import React, { useState } from 'react';
import { Account } from '../../types';
import { StorageGauge } from '../common/StorageGauge';
import { EyeIcon, EyeOffIcon, CopyIcon, CheckIcon, EditIcon, TrashIcon } from '../common/Icons';
import { formatDateTime } from '../../utils/date';

interface AccountCardProps {
  account: Account;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPassword = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(account.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTogglePassword = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPassword(!showPassword);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(account);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete account record "${account.username}" and all its stored items?`)) {
      onDelete(account.id);
    }
  };

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '12px',
        borderBottom: '1px solid var(--border-subtle)',
        borderLeft: isSelected ? '3px solid var(--accent-white)' : '3px solid transparent',
        background: isSelected ? 'var(--bg-secondary)' : 'transparent',
        cursor: 'pointer',
        transition: 'background var(--transition-fast)',
        userSelect: 'none',
      }}
      className="account-card"
    >
      {/* Top row: Username & Item count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <span
          style={{
            fontWeight: 600,
            fontSize: '13px',
            color: 'var(--text-primary)',
            wordBreak: 'break-all',
          }}
        >
          {account.username}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            padding: '1px 6px',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            marginLeft: '6px',
          }}
        >
          {account.itemCount || 0} items
        </span>
      </div>

      {/* Password row with copy & show/hide */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          marginBottom: '8px',
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>PW:</span>
        <span style={{ letterSpacing: showPassword ? 'normal' : '0.15em' }}>
          {showPassword ? account.password : '••••••••••••'}
        </span>
        <button
          onClick={handleTogglePassword}
          title={showPassword ? 'Hide password' : 'Show password'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
          }}
        >
          {showPassword ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />}
        </button>
        <button
          onClick={handleCopyPassword}
          title="Copy password"
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? 'var(--accent-white)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
          }}
        >
          {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
        </button>
      </div>

      {/* Last Login Info */}
      <div
        style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>LL: {formatDateTime(account.lastLogin)}</span>
      </div>

      {/* Storage Gauge (Max 6 GB) */}
      <div style={{ marginBottom: '8px' }}>
        <StorageGauge
          totalUsedMB={account.totalUsedMB}
          maxStorageGB={account.maxStorageGB || 6}
          compact
        />
      </div>

      {/* Card Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
        <button
          onClick={handleEdit}
          title="Edit account"
          style={{
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '3px 6px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <EditIcon size={11} />
          <span>Edit</span>
        </button>
        <button
          onClick={handleDelete}
          title="Delete account"
          style={{
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-danger)',
            cursor: 'pointer',
            padding: '3px 6px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <TrashIcon size={11} />
        </button>
      </div>
    </div>
  );
};
