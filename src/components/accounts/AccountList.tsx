import React from 'react';
import { useApp } from '../../context/AppContext';
import { AccountCard } from './AccountCard';
import { Account } from '../../types';

interface AccountListProps {
  onEditAccount: (account: Account) => void;
}

export const AccountList: React.FC<AccountListProps> = ({ onEditAccount }) => {
  const {
    filteredAndSortedAccounts,
    selectedAccountId,
    setSelectedAccountId,
    deleteAccount,
  } = useApp();

  if (filteredAndSortedAccounts.length === 0) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        No accounts found
      </div>

    );
  }

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {filteredAndSortedAccounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          isSelected={selectedAccountId === account.id}
          onSelect={() => setSelectedAccountId(account.id)}
          onEdit={onEditAccount}
          onDelete={deleteAccount}
        />
      ))}
    </div>
  );
};
