import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { FileIcon } from "../common/Icons";
import { DroppedFileInfo, Account } from "../../types";
import { formatDroppedFileSize } from "../../utils/fileDrop";
import { formatMB, MB_PER_GB } from "../../utils/storage";
import { todayString } from "../../utils/date";

export interface DropFileConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: DroppedFileInfo[];
  accounts: Account[];
  selectedAccountId: string | null;
  onConfirm: (payload: {
    accountId: string;
    files: Array<{
      fileName: string;
      fileSizeMB: number;
      fileType: string;
      note?: string;
    }>;
  }) => Promise<void>;
}

export const DropFileConfirmModal: React.FC<DropFileConfirmModalProps> = ({
  isOpen,
  onClose,
  files,
  accounts,
  selectedAccountId,
  onConfirm,
}) => {
  const [targetAccountId, setTargetAccountId] = useState<string>("");
  const [customNote, setCustomNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (
        selectedAccountId &&
        accounts.some((a) => a.id === selectedAccountId)
      ) {
        setTargetAccountId(selectedAccountId);
      } else if (accounts.length > 0) {
        setTargetAccountId(accounts[0].id);
      } else {
        setTargetAccountId("");
      }
      setCustomNote(`Added via drag & drop on ${todayString()}`);
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen, selectedAccountId, accounts]);

  const targetAccount = useMemo(
    () => accounts.find((a) => a.id === targetAccountId),
    [accounts, targetAccountId],
  );

  const totalFilesMB = useMemo(
    () => files.reduce((sum, f) => sum + (f.fileSizeMB || 0), 0),
    [files],
  );

  const totalBytes = useMemo(
    () => files.reduce((sum, f) => sum + (f.originalSize || 0), 0),
    [files],
  );

  // Storage quota limit calculation
  const quotaCheck = useMemo(() => {
    if (!targetAccount) return null;
    const maxStorageGB = targetAccount.maxStorageGB || 6;
    const maxStorageMB = maxStorageGB * MB_PER_GB;
    const currentUsedMB = targetAccount.totalUsedMB || 0;
    const projectedTotalMB = currentUsedMB + totalFilesMB;
    const isExceeded = projectedTotalMB > maxStorageMB;
    const overageMB = isExceeded ? projectedTotalMB - maxStorageMB : 0;
    const remainingMB = Math.max(0, maxStorageMB - projectedTotalMB);
    const remainingGB = Number((remainingMB / MB_PER_GB).toFixed(2));
    const projectedTotalGB = Number((projectedTotalMB / MB_PER_GB).toFixed(2));
    const currentUsedGB = Number((currentUsedMB / MB_PER_GB).toFixed(2));

    return {
      maxStorageGB,
      maxStorageMB,
      currentUsedMB,
      currentUsedGB,
      projectedTotalMB,
      projectedTotalGB,
      isExceeded,
      overageMB,
      remainingGB,
    };
  }, [targetAccount, totalFilesMB]);

  if (!isOpen || files.length === 0) return null;

  const handleConfirm = async () => {
    if (!targetAccountId) {
      setError("Please select a destination account.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onConfirm({
        accountId: targetAccountId,
        files: files.map((f) => ({
          fileName: f.fileName,
          fileSizeMB: f.fileSizeMB,
          fileType: f.fileType,
          note: customNote.trim() || undefined,
        })),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to add dropped file to account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMultiple = files.length > 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isMultiple
          ? `Confirm Adding ${files.length} Files`
          : "Confirm Adding Dropped File"
      }
      maxWidth="540px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={quotaCheck?.isExceeded ? "danger" : "primary"}
            onClick={handleConfirm}
            disabled={isSubmitting || !targetAccountId}
          >
            {isSubmitting
              ? "Processing..."
              : quotaCheck?.isExceeded
                ? isMultiple
                  ? `Process Anyway (${files.length} Files)`
                  : "Process Anyway"
                : isMultiple
                  ? `Add ${files.length} Files to Account`
                  : "Add File to Account"}
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Destination Account Selection */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label
            className="form-label"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span>Destination Account *</span>
          </label>
          {accounts.length === 0 ? (
            <div
              style={{
                color: "var(--accent-danger)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              No accounts available. Please create an account first.
            </div>
          ) : (
            <select
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className="form-input"
              style={{ cursor: "pointer" }}
              disabled={isSubmitting}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.username} · ({acc.remainingGB} of {acc.maxStorageGB} GB
                  left)
                  {acc.isPinned ? " [Pinned]" : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Dropped File(s) Summary Card */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "12px",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-muted)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
            }}
          >
            {isMultiple
              ? `Dropped Files (${files.length})`
              : "Dropped File Information"}
          </div>

          {!isMultiple ? (
            // Single File Display
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-white)",
                  flexShrink: 0,
                }}
              >
                <FileIcon size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    wordBreak: "break-all",
                    fontSize: "var(--font-size-md)",
                    marginBottom: "4px",
                  }}
                >
                  {files[0].fileName}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <Badge variant="default" size="sm">
                    {files[0].fileType.toUpperCase()}
                  </Badge>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    {formatDroppedFileSize(files[0].originalSize)} (
                    {files[0].fileSizeMB} MB)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Multiple Files Display
            <div>
              <div
                style={{
                  maxHeight: "140px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      padding: "4px 6px",
                      background: "var(--bg-canvas)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-xs)",
                    }}
                  >
                    <div
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "var(--font-size-sm)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                      title={file.fileName}
                    >
                      {file.fileName}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        flexShrink: 0,
                      }}
                    >
                      <Badge variant="default" size="sm">
                        {file.fileType.toUpperCase()}
                      </Badge>
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--font-size-xs)",
                        }}
                      >
                        {formatDroppedFileSize(file.originalSize)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--text-secondary)",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                <span>Total files: {files.length}</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  Total size: {formatDroppedFileSize(totalBytes)} (
                  {totalFilesMB.toFixed(2)} MB)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Storage Quota Check: Excess Warning or Normal Impact Box */}
        {quotaCheck && quotaCheck.isExceeded && (
          <div
            style={{
              padding: "12px 14px",
              background: "var(--bg-danger-subtle)",
              border: "0.5px solid var(--border-danger-subtle)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--accent-danger)",
                  fontWeight: 600,
                  fontSize: "var(--font-size-sm)",
                }}
              >
                <span>Maximum Storage Exceeded</span>
              </div>
            </div>

            <div
              style={{
                color: "var(--text-primary)",
                fontSize: "var(--font-size-xs)",
                lineHeight: 1.5,
              }}
            >
              Adding {formatMB(totalFilesMB)} will put this account{" "}
              <strong style={{ color: "var(--accent-danger)" }}>
                +{formatMB(quotaCheck.overageMB)} over
              </strong>{" "}
              the {quotaCheck.maxStorageGB} GB limit.
            </div>
          </div>
        )}

        {quotaCheck && !quotaCheck.isExceeded && (
          <div
            style={{
              padding: "10px 12px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "var(--font-size-xs)",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>
              Storage after add:{" "}
              <strong>{quotaCheck.projectedTotalGB} GB</strong> /{" "}
              {quotaCheck.maxStorageGB} GB
            </span>
            <span style={{ color: "var(--text-muted)" }}>
              ({quotaCheck.remainingGB} GB remaining)
            </span>
          </div>
        )}

        {/* Optional Custom Note */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Note / Description (Optional)</label>
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Added via drag & drop"
            className="form-input"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div
            style={{
              color: "var(--accent-danger)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
};
