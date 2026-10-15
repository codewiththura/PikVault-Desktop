import React, { useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { Modal } from "../common/Modal";
import { Badge } from "../common/Badge";
import { formatMB } from "../../utils/storage";
import { formatDateOnly } from "../../utils/date";
import { SearchIcon, ChevronRightIcon, CloseIcon } from "../common/Icons";

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    globalSearchQuery,
    globalSearchResults,
    performGlobalSearch,
    jumpToItem,
  } = useApp();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isGlobalSearchOpen]);

  // Listen for Ctrl+K globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  const handleClear = () => {
    performGlobalSearch("");
    inputRef.current?.focus();
  };

  return (
    <Modal
      isOpen={isGlobalSearchOpen}
      onClose={() => setIsGlobalSearchOpen(false)}
      title="Global Cross-Account Data Search"
      maxWidth="700px"
    >
      {/* Search Input */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "10px",
            color: "var(--text-muted)",
            display: "flex",
          }}
        >
          <SearchIcon size={16} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={globalSearchQuery}
          onChange={(e) => performGlobalSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && globalSearchQuery) {
              e.stopPropagation();
              handleClear();
            }
          }}
          placeholder="Search file name or note across all accounts..."
          className="form-input"
          style={{
            paddingLeft: "34px",
            paddingRight: globalSearchQuery ? "36px" : "10px",
          }}
        />
        {globalSearchQuery && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear search"
            aria-label="Clear search input"
            style={{
              position: "absolute",
              right: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              padding: "4px",
              color: "var(--text-muted)",
              cursor: "pointer",
              borderRadius: "var(--radius-xs)",
              transition:
                "color var(--transition-fast), background-color var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      {/* Results Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--text-muted)",
          marginBottom: "8px",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "4px",
        }}
      >
        <span>
          {globalSearchQuery
            ? `Found ${globalSearchResults.length} results across accounts`
            : "Type to search across all accounts"}
        </span>
        <span>Hotkey: Ctrl+K</span>
      </div>

      {/* Results List */}
      <div
        style={{
          maxHeight: "380px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {globalSearchResults.length === 0 && globalSearchQuery.trim() && (
          <div
            style={{
              padding: "36px 0",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            No matching stored data found in any account
          </div>
        )}

        {globalSearchResults.map((result) => {
          const { item, account } = result;
          return (
            <div
              key={item.id}
              onClick={() => jumpToItem(account.id, item.id)}
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "border-color var(--transition-fast)",
              }}
              className="search-result-row"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Badge variant="white">{item.fileType || "mp4"}</Badge>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {formatMB(item.fileSizeMB)}
                    </span>
                  </div>
                </div>

                {/* Account Owner Indicator */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      color: "var(--accent-white)",
                      fontWeight: 600,
                      background: "var(--bg-secondary)",
                      padding: "1px 6px",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-xs)",
                    }}
                  >
                    {account.username}
                  </span>
                  {item.updatedDate && (
                    <span
                      style={{ color: "var(--text-muted)", marginLeft: "6px" }}
                    >
                      ({formatDateOnly(item.updatedDate)})
                    </span>
                  )}
                </div>

                {item.note && (
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "500px",
                    }}
                  >
                    Note: {item.note}
                  </span>
                )}
              </div>

              {/* Jump Action */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "var(--text-secondary)",
                  paddingLeft: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                <span>Jump</span>
                <ChevronRightIcon size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
