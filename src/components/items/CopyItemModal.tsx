import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { CopyIcon, HardDriveIcon } from "../common/Icons";
import { StoredItem, Account } from "../../types";
import { formatMB } from "../../utils/storage";

export interface CopyItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StoredItem | null;
  currentAccountId: string;
  accounts: Account[];
  onCopy: (targetAccountId: string) => Promise<void>;
}

export const CopyItemModal: React.FC<CopyItemModalProps> = ({
  isOpen,
  onClose,
  item,
  currentAccountId,
  accounts,
  onCopy,
}) => {
  const otherAccounts = accounts.filter((a) => a.id !== currentAccountId);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (otherAccounts.length > 0) {
        setSelectedTargetId(otherAccounts[0].id);
      } else {
        setSelectedTargetId("");
      }
      setError("");
      setIsCopying(false);
    }
  }, [isOpen, item, currentAccountId, accounts.length]);

  if (!isOpen || !item) return null;

  const targetAccount = accounts.find((a) => a.id === selectedTargetId);
  const fileSizeMB = item.fileSizeMB || 0;
  const targetRemainingMB = targetAccount
    ? (targetAccount.remainingGB ?? targetAccount.maxStorageGB) * 1024
    : 0;
  const isExceeded = targetAccount && fileSizeMB > targetRemainingMB;

  const handleConfirm = async () => {
    if (!selectedTargetId) {
      setError("Please select a destination account.");
      return;
    }

    try {
      setIsCopying(true);
      setError("");
      await onCopy(selectedTargetId);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to copy media to selected account.");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Copy Media to Another Account"
      maxWidth="520px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isCopying}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isCopying || otherAccounts.length === 0}
            icon={<CopyIcon size={14} />}
          >
            {isCopying ? "Copying..." : "Copy Media"}
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Source Media Item Summary Card */}
        <div
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "12px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.fileName}
              style={{
                width: "56px",
                height: "56px",
                objectFit: "cover",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--border-subtle)",
                flexShrink: 0,
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                flexShrink: 0,
              }}
            >
              <HardDriveIcon size={20} />
            </div>
          )}

          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
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
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  wordBreak: "break-all",
                }}
              >
                {item.fileName}
              </span>
              <Badge variant="white">
                {item.fileType?.toUpperCase() || "MP4"}
              </Badge>
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
              }}
            >
              Size:{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {formatMB(item.fileSizeMB)}
              </strong>
              {item.updatedDate && ` • Updated: ${item.updatedDate}`}
            </div>
            {item.note && (
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={item.note}
              >
                Note: {item.note}
              </div>
            )}
          </div>
        </div>

        {/* Destination Account Selection */}
        {otherAccounts.length === 0 ? (
          <div
            style={{
              padding: "16px",
              background: "var(--bg-primary)",
              border: "1px dashed var(--border-strong)",
              borderRadius: "var(--radius-sm)",
              textAlign: "center",
              color: "var(--text-secondary)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <p style={{ margin: "0 0 6px 0", fontWeight: 600 }}>
              No other accounts found
            </p>
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "var(--font-size-xs)",
              }}
            >
              Please create at least one additional account in the ledger before
              copying media between accounts.
            </span>
          </div>
        ) : (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label
              className="form-label"
              style={{ marginBottom: "8px", display: "block" }}
            >
              Select Destination Account
            </label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {otherAccounts.map((account) => {
                const isSelected = selectedTargetId === account.id;
                const remainingGB =
                  account.remainingGB ?? account.maxStorageGB;
                const willExceed =
                  (item.fileSizeMB || 0) > remainingGB * 1024;

                return (
                  <div
                    key={account.id}
                    onClick={() => setSelectedTargetId(account.id)}
                    style={{
                      background: isSelected
                        ? "var(--bg-secondary)"
                        : "var(--bg-primary)",
                      border: isSelected
                        ? "2px solid var(--accent-white)"
                        : "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: isSelected
                            ? "var(--accent-white)"
                            : "var(--text-primary)",
                          wordBreak: "break-all",
                        }}
                      >
                        {account.username}
                      </span>
                      {account.description && (
                        <span
                          style={{
                            fontSize: "var(--font-size-xs)",
                            color: "var(--text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "320px",
                          }}
                        >
                          {account.description}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                        flexShrink: 0,
                        paddingLeft: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: willExceed
                            ? "var(--accent-danger)"
                            : "var(--text-secondary)",
                          fontWeight: willExceed ? 600 : 400,
                          display: "block",
                        }}
                      >
                        {willExceed
                          ? "Quota will exceed"
                          : `${remainingGB} GB remain`}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {account.itemCount || 0} items
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quota Warning Alert if applicable */}
        {isExceeded && (
          <div
            style={{
              padding: "10px 12px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid var(--accent-danger)",
              borderRadius: "var(--radius-xs)",
              color: "var(--accent-danger)",
              fontSize: "var(--font-size-xs)",
              lineHeight: 1.4,
            }}
          >
            <strong>Storage Limit Notice:</strong> Adding this record (
            {formatMB(fileSizeMB)}) will exceed the destination account's
            storage quota of {targetAccount?.maxStorageGB} GB. The catalog
            record will still be created, and the quota warning indicator will
            reflect the overage.
          </div>
        )}

        {error && (
          <div
            style={{
              color: "var(--accent-danger)",
              fontSize: "var(--font-size-xs)",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
};
