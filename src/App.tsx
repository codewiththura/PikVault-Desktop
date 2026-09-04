import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { AppHeader } from './components/layout/AppHeader';
import { StatusBar } from './components/layout/StatusBar';
import { AccountSortBar } from './components/accounts/AccountSortBar';
import { AccountList } from './components/accounts/AccountList';
import { AccountModal } from './components/accounts/AccountModal';
import { ItemFilterBar } from './components/items/ItemFilterBar';
import { ItemList } from './components/items/ItemList';
import { ItemGrid } from './components/items/ItemGrid';
import { ItemModal } from './components/items/ItemModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { ImagePreviewModal } from './components/common/ImagePreviewModal';
import { StorageGauge } from './components/common/StorageGauge';
import { Account, StoredItem } from './types';
import { formatDateTime } from './utils/date';

export const App: React.FC = () => {
  const {
    selectedAccount,
    filteredItems,
    itemViewMode,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    createAccount,
    updateAccount,
    createItem,
    updateItem,
    deleteItem,
  } = useApp();

  // Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<StoredItem | null>(null);

  // Image Preview Modal State
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleOpenNewAccount = () => {
    setAccountToEdit(null);
    setIsAccountModalOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setAccountToEdit(account);
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = async (data: any) => {
    if (data.id) {
      await updateAccount(data);
    } else {
      await createAccount(data);
    }
  };

  const handleOpenNewItem = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: StoredItem) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (data: any) => {
    if (data.id) {
      await updateItem(data);
    } else {
      await createItem(data);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Application Header */}
      <AppHeader />

      {/* Main Master-Detail Desktop Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Master Pane: Accounts */}
        <aside
          style={{
            width: 'var(--sidebar-width)',
            minWidth: '280px',
            maxWidth: '380px',
            borderRight: '1px solid var(--border-strong)',
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <AccountSortBar onAddAccount={handleOpenNewAccount} />
          <AccountList onEditAccount={handleEditAccount} />
        </aside>

        {/* Right Detail Pane: Stored Data Catalog */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-canvas)',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {selectedAccount ? (
            <>
              {/* Active Account Overview Banner */}
              <div
                style={{
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      ACCOUNT:
                    </span>
                    <h2
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                      }}
                    >
                      {selectedAccount.username}
                    </h2>
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    Last Login: {formatDateTime(selectedAccount.lastLogin)}
                  </span>
                </div>

                {/* Storage Gauge for active account */}
                <div style={{ width: '260px' }}>
                  <StorageGauge
                    totalUsedMB={selectedAccount.totalUsedMB}
                    maxStorageGB={selectedAccount.maxStorageGB || 6}
                  />
                </div>
              </div>

              {/* Stored Data Search & View Toggle Toolbar */}
              <ItemFilterBar onAddItem={handleOpenNewItem} />

              {/* Dual View: List or Grid */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {itemViewMode === 'list' ? (
                  <ItemList
                    items={filteredItems}
                    highlightedItemId={highlightedItemId}
                    onEdit={handleEditItem}
                    onDelete={deleteItem}
                    onPreviewImage={setPreviewImageUrl}
                  />
                ) : (
                  <ItemGrid
                    items={filteredItems}
                    highlightedItemId={highlightedItemId}
                    onEdit={handleEditItem}
                    onDelete={deleteItem}
                    onPreviewImage={setPreviewImageUrl}
                  />
                )}
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: 'var(--text-muted)',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid var(--border-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '18px',
                }}
              >
                //
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                SELECT AN ACCOUNT TO VIEW STORED RECORDS
              </p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Or press Ctrl+K to search stored records globally across all accounts
              </span>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Modals */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
        accountToEdit={accountToEdit}
      />

      {selectedAccount && (
        <ItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          accountId={selectedAccount.id}
          itemToEdit={itemToEdit}
          onSave={handleSaveItem}
        />
      )}

      <GlobalSearchModal />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <ImagePreviewModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </div>
  );
};
