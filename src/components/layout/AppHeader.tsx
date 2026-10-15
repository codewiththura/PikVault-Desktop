import React from "react";
import { useApp } from "../../context/AppContext";
import { Button } from "../common/Button";
import { ConfirmModal } from "../common/ConfirmModal";
import { NotificationModal } from "../common/NotificationModal";
import {
  SearchIcon,
  DownloadIcon,
  UploadIcon,
  SettingsIcon,
} from "../common/Icons";

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
  const totalUsedMB = accounts.reduce(
    (sum, a) => sum + (a.totalUsedMB || 0),
    0,
  );
  const totalUsedGB = (totalUsedMB / 1024).toFixed(2);

  const [isConfirmImportOpen, setIsConfirmImportOpen] = React.useState(false);
  const [notification, setNotification] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
  } | null>(null);

  const handleExport = async () => {
    try {
      const res = await exportBackup();
      if (res.success && res.filePath) {
        setNotification({
          isOpen: true,
          title: "Backup Exported Successfully",
          message: `Your account and data records have been exported to:\n${res.filePath}`,
          type: "success",
        });
      } else if (res.error && res.error !== "Cancelled") {
        setError(`Backup export error: ${res.error}`);
        setNotification({
          isOpen: true,
          title: "Export Failed",
          message: `Could not export backup: ${res.error}`,
          type: "error",
        });
      }
    } catch (err: any) {
      setNotification({
        isOpen: true,
        title: "Export Error",
        message: err?.message || "An unexpected error occurred during export.",
        type: "error",
      });
    }
  };

  const handleOpenImport = () => {
    setIsConfirmImportOpen(true);
  };

  const executeImport = async () => {
    setIsConfirmImportOpen(false);
    try {
      const res = await importBackup();
      if (res.success) {
        setNotification({
          isOpen: true,
          title: "Import Successful",
          message: `Successfully imported ${res.importedCount} records into your account vault!`,
          type: "success",
        });
      } else if (res.error && res.error !== "Cancelled") {
        setError(`Backup import error: ${res.error}`);
        setNotification({
          isOpen: true,
          title: "Import Failed",
          message: `Could not import backup: ${res.error}`,
          type: "error",
        });
      }
    } catch (err: any) {
      setNotification({
        isOpen: true,
        title: "Import Error",
        message: err?.message || "An unexpected error occurred during import.",
        type: "error",
      });
    }
  };

  return (
    <header
      style={{
        height: "var(--header-height)",
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border-strong)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        userSelect: "none",
      }}
    >
      {/* App Branding & Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              background: "var(--accent-white)",
              borderRadius: "var(--radius-xs)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontWeight: 700,
            }}
          >
            Account Vault
          </span>
          <span
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xs)",
              padding: "1px 5px",
              fontSize: "var(--font-size-2xs)",
            }}
          >
            {typeof navigator !== "undefined" &&
            (navigator.userAgent.includes("Windows") ||
              navigator.userAgent.includes("Win32") ||
              navigator.userAgent.includes("Win64"))
              ? "Windows Native"
              : "Linux Native"}
          </span>
        </div>

        {/* Aggregate Stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "var(--text-secondary)",
            borderLeft: "1px solid var(--border-subtle)",
            paddingLeft: "14px",
            whiteSpace: "nowrap",
          }}
        >
          <span>
            Accounts:{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {totalAccounts}
            </strong>
          </span>
          <span>
            Items:{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {totalItems}
            </strong>
          </span>
          <span>
            Cataloged:{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {totalUsedGB} GB
            </strong>
          </span>
        </div>
      </div>

      {/* Global Search Hotkey Button & Backups */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="global-search-btn"
          title="Search stored data across all accounts (Ctrl+K)"
          aria-label="Search stored data across all accounts (Ctrl+K)"
        >
          <SearchIcon size={14} />
          <span className="global-search-label">Global Search Data...</span>
          <kbd className="global-search-kbd">
            Ctrl+K
          </kbd>
        </button>

        <Button
          variant="secondary"
          icon={<DownloadIcon size={13} />}
          onClick={handleExport}
          title="Export database records as JSON backup"
        >
          Export
        </Button>

        <Button
          variant="secondary"
          icon={<UploadIcon size={13} />}
          onClick={handleOpenImport}
          title="Import database records from JSON backup"
        >
          Import
        </Button>

        <Button
          variant="secondary"
          icon={<SettingsIcon size={13} />}
          onClick={() => setIsSettingsModalOpen(true)}
          title="Adjust Theme and Font Size Settings"
        >
          Settings
        </Button>
      </div>
      <ConfirmModal
        isOpen={isConfirmImportOpen}
        onClose={() => setIsConfirmImportOpen(false)}
        onConfirm={executeImport}
        title="Import Backup Data"
        message="Importing will merge accounts and cataloged stored items from your backup JSON file into the local database. Continue?"
        confirmLabel="Select File & Import"
      />

      {notification && (
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={() => setNotification(null)}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      )}
    </header>
  );
};
