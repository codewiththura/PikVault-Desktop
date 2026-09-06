import React, { useState } from "react";
import { Account } from "../../types";
import {
  EyeIcon,
  EyeOffIcon,
  CopyIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
} from "../common/Icons";
import {
  formatDateTime,
  formatRelativeTime,
  isOlderThanDays,
} from "../../utils/date";

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

  const handleCopyUsername = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(account.username);
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
    if (
      confirm(
        `Delete account record "${account.username}" and all its stored items?`,
      )
    ) {
      onDelete(account.id);
    }
  };

  return (
    <div
      onClick={onSelect}
      style={{
        padding: "12px",
        borderBottom: "1px solid var(--border-subtle)",
        borderLeft: isSelected
          ? "3px solid var(--accent-white)"
          : "3px solid transparent",
        background: isSelected ? "var(--bg-secondary)" : "transparent",
        cursor: "pointer",
        transition: "background var(--transition-fast)",
        userSelect: "none",
      }}
      className="account-card"
    >
      {/* Top row: Username & Item count */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "var(--text-primary)",
              wordBreak: "break-all",
            }}
          >
            {account.username}
          </span>
          <button
            onClick={handleCopyUsername}
            title="Copy password"
            style={{
              background: "transparent",
              marginLeft: "8px",
              border: "none",
              color: copied ? "var(--accent-white)" : "var(--text-muted)",
              cursor: "pointer",
              padding: "2px",
              display: "flex",
            }}
          >
            {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
          </button>
        </div>
        <span
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-subtle)",
            padding: "1px 6px",
            color: "var(--text-secondary)",
            whiteSpace: "nowrap",
            marginLeft: "6px",
          }}
        >
          {account.itemCount || 0} items
        </span>
      </div>

      {/* Password row with copy & show/hide */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-secondary)",
          marginBottom: "8px",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>Password:</span>
        <span style={{ letterSpacing: showPassword ? "normal" : "0.15em" }}>
          {showPassword ? account.password : "••••••••••••"}
        </span>
        <button
          onClick={handleTogglePassword}
          title={showPassword ? "Hide password" : "Show password"}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "2px",
            display: "flex",
          }}
        >
          {showPassword ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />}
        </button>
        <button
          onClick={handleCopyPassword}
          title="Copy password"
          style={{
            background: "transparent",
            border: "none",
            color: copied ? "var(--accent-white)" : "var(--text-muted)",
            cursor: "pointer",
            padding: "2px",
            display: "flex",
          }}
        >
          {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
        </button>
      </div>

      {/* Last Login Info */}
      {(() => {
        const isOverdue = isOlderThanDays(account.lastLogin, 30);
        return (
          <div
            style={{
              color: isOverdue ? "var(--accent-danger)" : "var(--text-muted)",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            title={
              account.lastLogin
                ? `Last login timestamp: ${formatDateTime(account.lastLogin)}`
                : undefined
            }
          >
            <span>Last login: {formatRelativeTime(account.lastLogin)}</span>

            {/* Card Action buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "6px",
              }}
            >
              <button
                onClick={handleEdit}
                title="Edit account"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-xs)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "3px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <EditIcon size={15} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                title="Delete account"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-xs)",
                  color: "var(--accent-danger)",
                  cursor: "pointer",
                  padding: "3px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <TrashIcon size={15} />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
