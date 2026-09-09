import React, { useState } from "react";
import { useApp } from "./context/AppContext";
import { AppHeader } from "./components/layout/AppHeader";
import { StatusBar } from "./components/layout/StatusBar";
import { AccountSortBar } from "./components/accounts/AccountSortBar";
import { AccountList } from "./components/accounts/AccountList";
import { AccountModal } from "./components/accounts/AccountModal";
import { ItemFilterBar } from "./components/items/ItemFilterBar";
import { ItemList } from "./components/items/ItemList";
import { ItemGrid } from "./components/items/ItemGrid";
import { ItemModal } from "./components/items/ItemModal";
import { GlobalSearchModal } from "./components/search/GlobalSearchModal";
import { SettingsModal } from "./components/settings/SettingsModal";
import { ImagePreviewModal } from "./components/common/ImagePreviewModal";
import { StorageGauge } from "./components/common/StorageGauge";
import { RefreshCwIcon } from "./components/common/Icons";
import { useResizableSidebar } from "./hooks/useResizableSidebar";
import { Account, StoredItem } from "./types";
import {
  formatDateTime,
  formatRelativeTime,
  isOlderThanDays,
} from "./utils/date";

export const App: React.FC = () => {
  const {
    selectedAccount,
    filteredItems,
    itemViewMode,
    highlightedItemId,
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

  // Update Last Login to current datetime
  const [isUpdatingLastLogin, setIsUpdatingLastLogin] = useState(false);

  const handleUpdateLastLoginToNow = async () => {
    if (!selectedAccount || isUpdatingLastLogin) return;
    if (
      !confirm(
        `Are you sure you want to update the last login for account "${selectedAccount.username}" to the current datetime?`,
      )
    ) {
      return;
    }
    try {
      setIsUpdatingLastLogin(true);
      const nowIso = new Date().toISOString();
      await updateAccount({
        id: selectedAccount.id,
        lastLogin: nowIso,
      });
    } catch (err) {
      console.error("Failed to update last login to now:", err);
    } finally {
      setIsUpdatingLastLogin(false);
    }
  };

  // Resizable Sidebar Hook
  const {
    sidebarWidth,
    isResizing,
    startResizing,
    resetWidth,
    handleKeyDown: handleSidebarKeyDown,
    minWidth: minSidebarWidth,
    maxWidth: maxSidebarWidth,
  } = useResizableSidebar({
    minWidth: 260,
    maxWidth: 600,
    defaultWidth: 380,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Top Application Header */}
      <AppHeader />

      {/* Main Master-Detail Desktop Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Master Pane: Accounts */}
        <aside
          style={{
            width: `${sidebarWidth}px`,
            minWidth: `${minSidebarWidth}px`,
            maxWidth: `${maxSidebarWidth}px`,
            background: "var(--bg-primary)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flexShrink: 0,
          }}
        >
          <AccountSortBar onAddAccount={handleOpenNewAccount} />
          <AccountList onEditAccount={handleEditAccount} />
        </aside>

        {/* Resizer Divider */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          aria-valuenow={sidebarWidth}
          aria-valuemin={minSidebarWidth}
          aria-valuemax={maxSidebarWidth}
          tabIndex={0}
          onMouseDown={startResizing}
          onDoubleClick={resetWidth}
          onKeyDown={handleSidebarKeyDown}
          style={{
            width: "4px",
            cursor: "col-resize",
            background: isResizing
              ? "var(--accent-white)"
              : "var(--border-strong)",
            position: "relative",
            flexShrink: 0,
            zIndex: 10,
            transition: isResizing ? "none" : "background 0.15s ease",
          }}
          className="sidebar-resizer"
          title="Drag to resize sidebar (Double-click to reset)"
        />

        {/* Right Detail Pane: Stored Data Catalog */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "var(--bg-canvas)",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {selectedAccount ? (
            <>
              {/* Active Account Overview Banner */}
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--bg-secondary)",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>Account:</span>
                    <h3
                      style={{
                        color: "var(--text-primary)",
                        margin: 0,
                      }}
                    >
                      {selectedAccount.username}
                    </h3>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        color: isOlderThanDays(selectedAccount.lastLogin, 30)
                          ? "var(--accent-danger)"
                          : "var(--text-secondary)",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: isOlderThanDays(
                          selectedAccount.lastLogin,
                          30,
                        )
                          ? 600
                          : 400,
                      }}
                      title={
                        selectedAccount.lastLogin
                          ? `Exact timestamp: ${formatDateTime(selectedAccount.lastLogin)}`
                          : undefined
                      }
                    >
                      Last login:{" "}
                      {formatRelativeTime(selectedAccount.lastLogin)}
                      {isOlderThanDays(selectedAccount.lastLogin, 30) &&
                        " (Relogin required)"}
                    </span>
                    <button
                      type="button"
                      onClick={handleUpdateLastLoginToNow}
                      disabled={isUpdatingLastLogin}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-xs)",
                        color: "var(--text-secondary)",
                        marginTop: "5px",
                        padding: "2px 8px",
                        cursor: isUpdatingLastLogin ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        opacity: isUpdatingLastLogin ? 0.6 : 1,
                        transition: "all var(--transition-fast)",
                      }}
                      title="Update last login to latest current datetime"
                    >
                      <RefreshCwIcon size={15} />
                      <span>
                        {isUpdatingLastLogin ? "Updating..." : "Update to Now"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Storage Gauge for active account */}
                <div style={{ width: "320px" }}>
                  <StorageGauge
                    totalUsedMB={selectedAccount.totalUsedMB}
                    maxStorageGB={selectedAccount.maxStorageGB || 6}
                  />
                </div>
              </div>

              {/* Stored Data Search & View Toggle Toolbar */}
              <ItemFilterBar onAddItem={handleOpenNewItem} />

              {/* Dual View: List or Grid */}
              <div
                style={{
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                {itemViewMode === "list" ? (
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
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                color: "var(--text-muted)",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                //
              </div>
              <p style={{ color: "var(--text-secondary)" }}>
                Select an account to view stored records
              </p>
              <span style={{ color: "var(--text-muted)" }}>
                Or press Ctrl+K to search stored records globally across all
                accounts
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
