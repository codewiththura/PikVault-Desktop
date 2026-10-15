import React, { useState } from "react";
import { useApp } from "./context/AppContext";
import { AppHeader } from "./components/layout/AppHeader";
import { StatusBar } from "./components/layout/StatusBar";
import { AccountSortBar } from "./components/accounts/AccountSortBar";
import { AccountList } from "./components/accounts/AccountList";
import { AccountModal } from "./components/accounts/AccountModal";
import { ConfirmModal } from "./components/common/ConfirmModal";
import { ItemFilterBar } from "./components/items/ItemFilterBar";
import { ItemList } from "./components/items/ItemList";
import { ItemGrid } from "./components/items/ItemGrid";
import { ItemModal } from "./components/items/ItemModal";
import { GlobalSearchModal } from "./components/search/GlobalSearchModal";
import { SettingsModal } from "./components/settings/SettingsModal";
import { ImagePreviewModal } from "./components/common/ImagePreviewModal";
import { CopyItemModal } from "./components/items/CopyItemModal";
import { NotificationModal } from "./components/common/NotificationModal";
import { StorageGauge } from "./components/common/StorageGauge";
import { RefreshCwIcon, PinIcon } from "./components/common/Icons";
import { DropOverlay } from "./components/items/DropOverlay";
import { DropFileConfirmModal } from "./components/items/DropFileConfirmModal";
import { useFileDrop } from "./hooks/useFileDrop";
import { useResizableSidebar } from "./hooks/useResizableSidebar";
import { Account, StoredItem, DroppedFileInfo } from "./types";
import {
  formatDateTime,
  formatRelativeTime,
  isOlderThanDays,
  todayString,
} from "./utils/date";

export const App: React.FC = () => {
  const {
    accounts,
    selectedAccountId,
    selectedAccount,
    filteredItems,
    itemViewMode,
    highlightedItemId,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    createAccount,
    updateAccount,
    deleteAccount,
    togglePinAccount,
    createItem,
    updateItem,
    deleteItem,
    copyItemToAccount,
  } = useApp();

  // Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  // Deletion & Action Confirmation States
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [itemToDelete, setItemToDelete] = useState<StoredItem | null>(null);
  const [isConfirmUpdateLoginOpen, setIsConfirmUpdateLoginOpen] =
    useState(false);

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<StoredItem | null>(null);

  // Copy Item State
  const [itemToCopy, setItemToCopy] = useState<StoredItem | null>(null);

  // Focus-Safe In-DOM Notification State
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
  } | null>(null);

  // Dropped Files Confirmation State
  const [droppedFilesToConfirm, setDroppedFilesToConfirm] = useState<
    DroppedFileInfo[]
  >([]);
  const [isDropConfirmOpen, setIsDropConfirmOpen] = useState(false);

  const handleFilesDropped = (files: DroppedFileInfo[]) => {
    if (!files || files.length === 0) return;
    setDroppedFilesToConfirm(files);
    setIsDropConfirmOpen(true);
  };

  const executeAddDroppedFiles = async ({
    accountId,
    files,
  }: {
    accountId: string;
    files: Array<{
      fileName: string;
      fileSizeMB: number;
      fileType: string;
      note?: string;
    }>;
  }) => {
    const targetAcc = accounts.find((a) => a.id === accountId);
    const targetName = targetAcc ? targetAcc.username : "the account";

    try {
      for (const file of files) {
        await createItem({
          accountId,
          fileName: file.fileName,
          fileSizeMB: file.fileSizeMB,
          fileType: file.fileType,
          note: file.note,
          updatedDate: todayString(),
        });
      }

      setNotification({
        isOpen: true,
        title:
          files.length > 1
            ? "Files Cataloged Successfully"
            : "File Cataloged Successfully",
        message:
          files.length > 1
            ? `Successfully cataloged ${files.length} files into account "${targetName}".`
            : `Successfully cataloged "${files[0].fileName}" (${files[0].fileSizeMB} MB) into account "${targetName}".`,
        type: "success",
      });
      setDroppedFilesToConfirm([]);
      setIsDropConfirmOpen(false);
    } catch (err: any) {
      setNotification({
        isOpen: true,
        title: "Cataloging Failed",
        message:
          err?.message ||
          "Could not save the dropped file to the selected account.",
        type: "error",
      });
    }
  };

  const { isDragging, dropProps } = useFileDrop({
    onFilesDropped: handleFilesDropped,
    enabled: true,
  });

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

  const handleCopyItem = (item: StoredItem) => {
    setItemToCopy(item);
  };

  const executeCopyItemToAccount = async (targetAccountId: string) => {
    if (!itemToCopy) return;
    try {
      await copyItemToAccount(itemToCopy.id, targetAccountId);
      const targetAcc = accounts.find((a) => a.id === targetAccountId);
      const targetName = targetAcc ? targetAcc.username : "the target account";
      setNotification({
        isOpen: true,
        title: "Media Copied Successfully",
        message: `Successfully copied "${itemToCopy.fileName}" to account "${targetName}".`,
        type: "success",
      });
      setItemToCopy(null);
    } catch (err: any) {
      setNotification({
        isOpen: true,
        title: "Copy Failed",
        message:
          err?.message || "Could not copy media to the selected account.",
        type: "error",
      });
    }
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

  const handleOpenUpdateLastLoginConfirm = () => {
    if (!selectedAccount || isUpdatingLastLogin) return;
    setIsConfirmUpdateLoginOpen(true);
  };

  const executeUpdateLastLoginToNow = async () => {
    if (!selectedAccount) return;
    setIsConfirmUpdateLoginOpen(false);
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

  const executeDeleteAccount = async () => {
    if (accountToDelete) {
      const id = accountToDelete.id;
      setAccountToDelete(null);
      await deleteAccount(id);
    }
  };

  const executeDeleteItem = async () => {
    if (itemToDelete) {
      const id = itemToDelete.id;
      setItemToDelete(null);
      await deleteItem(id);
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
          <AccountList
            onEditAccount={handleEditAccount}
            onDeleteAccount={setAccountToDelete}
          />
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
          {...dropProps}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "var(--bg-canvas)",
            height: "100%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Visual Drop Overlay */}
          <DropOverlay
            isVisible={isDragging}
            targetAccountName={selectedAccount?.username}
          />

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
                    <h3
                      style={{
                        color: "var(--text-primary)",
                        margin: 0,
                      }}
                    >
                      {selectedAccount.username}
                    </h3>
                    <button
                      type="button"
                      onClick={() => togglePinAccount(selectedAccount.id)}
                      title={
                        selectedAccount.isPinned
                          ? "Unpin account from top"
                          : "Pin account to top"
                      }
                      style={{
                        background: selectedAccount.isPinned
                          ? "var(--bg-tertiary)"
                          : "transparent",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-xs)",
                        color: selectedAccount.isPinned
                          ? "var(--accent-warning, #f59e0b)"
                          : "var(--text-muted)",
                        cursor: "pointer",
                        padding: "1px 10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "var(--font-size-xs)",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <PinIcon
                        size={13}
                        filled={Boolean(selectedAccount.isPinned)}
                      />
                      <span>{selectedAccount.isPinned ? "Pinned" : "Pin"}</span>
                    </button>
                  </div>
                  {selectedAccount.description && (
                    <div
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "var(--font-size-xs)",
                        marginTop: "2px",
                        lineHeight: 1.4,
                        maxWidth: "600px",
                        wordBreak: "break-word",
                      }}
                    >
                      {selectedAccount.description}
                    </div>
                  )}
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
                      {isOlderThanDays(selectedAccount.lastLogin, 30)}
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenUpdateLastLoginConfirm}
                      disabled={isUpdatingLastLogin}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-xs)",
                        color: "var(--text-secondary)",
                        marginTop: "5px",
                        padding: "8px 10px",
                        cursor: isUpdatingLastLogin ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        opacity: isUpdatingLastLogin ? 0.6 : 1,
                        transition: "all var(--transition-fast)",
                      }}
                      title="Update last login to current datetime"
                    >
                      <RefreshCwIcon size={15} />
                      {/* <span>
                        {isUpdatingLastLogin ? "Updating..." : "Update to Now"}
                      </span> */}
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
                    onDelete={setItemToDelete}
                    onCopy={handleCopyItem}
                    onPreviewImage={setPreviewImageUrl}
                  />
                ) : (
                  <ItemGrid
                    items={filteredItems}
                    highlightedItemId={highlightedItemId}
                    onEdit={handleEditItem}
                    onDelete={setItemToDelete}
                    onCopy={handleCopyItem}
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

      {/* Focus-Safe In-DOM Confirmations */}
      <ConfirmModal
        isOpen={isConfirmUpdateLoginOpen}
        onClose={() => setIsConfirmUpdateLoginOpen(false)}
        onConfirm={executeUpdateLastLoginToNow}
        title="Update Last Login"
        message={`Are you sure you want to update the last login timestamp for account "${selectedAccount?.username || ""}" to the current datetime?`}
        confirmLabel="Update to Now"
      />

      <ConfirmModal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={executeDeleteAccount}
        title="Delete Account Record"
        message={`Are you sure you want to delete account "${accountToDelete?.username || ""}" and all its cataloged stored items? This action cannot be undone.`}
        confirmLabel="Delete Account"
        isDestructive
      />

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={executeDeleteItem}
        title="Delete Stored Item"
        message={`Are you sure you want to delete stored item "${itemToDelete?.fileName || ""}"?`}
        confirmLabel="Delete Item"
        isDestructive
      />

      <ImagePreviewModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />

      {/* Copy Media to Another Account Modal */}
      {selectedAccount && itemToCopy && (
        <CopyItemModal
          isOpen={!!itemToCopy}
          onClose={() => setItemToCopy(null)}
          item={itemToCopy}
          currentAccountId={selectedAccount.id}
          accounts={accounts}
          onCopy={executeCopyItemToAccount}
        />
      )}

      {/* Dropped Files Confirmation Modal */}
      <DropFileConfirmModal
        isOpen={isDropConfirmOpen}
        onClose={() => {
          setIsDropConfirmOpen(false);
          setDroppedFilesToConfirm([]);
        }}
        files={droppedFilesToConfirm}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onConfirm={executeAddDroppedFiles}
      />

      {/* Action Notifications */}
      {notification && (
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={() => setNotification(null)}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      )}
    </div>
  );
};
