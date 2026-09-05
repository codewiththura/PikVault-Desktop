import React from "react";
import { useApp } from "../../context/AppContext";
import { Button } from "../common/Button";
import { SearchIcon, PlusIcon, ListIcon, GridIcon } from "../common/Icons";

interface ItemFilterBarProps {
  onAddItem: () => void;
}

export const ItemFilterBar: React.FC<ItemFilterBarProps> = ({ onAddItem }) => {
  const {
    itemSearch,
    setItemSearch,
    itemViewMode,
    setItemViewMode,
    filteredItems,
    selectedAccount,
  } = useApp();

  return (
    <div
      style={{
        padding: "10px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      {/* Search by item file name in account */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          flex: 1,
          maxWidth: "400px",
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
          <SearchIcon size={14} />
        </span>
        <input
          type="text"
          value={itemSearch}
          onChange={(e) => setItemSearch(e.target.value)}
          placeholder={`Search data in ${selectedAccount?.username || "account"}...`}
          className="form-input"
          style={{ paddingLeft: "32px" }}
        />
      </div>

      {/* View Switcher (List vs Grid) & Add Data button */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "var(--text-muted)" }}>
          {filteredItems.length} records
        </span>

        {/* View Toggle */}
        <div
          style={{
            display: "flex",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setItemViewMode("list")}
            style={{
              background:
                itemViewMode === "list"
                  ? "var(--accent-white)"
                  : "var(--bg-secondary)",
              color:
                itemViewMode === "list"
                  ? "var(--accent-black)"
                  : "var(--text-secondary)",
              border: "none",
              padding: "5px 8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            title="Switch to List View"
          >
            <ListIcon size={16} />
          </button>
          <button
            onClick={() => setItemViewMode("grid")}
            style={{
              background:
                itemViewMode === "grid"
                  ? "var(--accent-white)"
                  : "var(--bg-secondary)",
              color:
                itemViewMode === "grid"
                  ? "var(--accent-black)"
                  : "var(--text-secondary)",
              border: "none",
              padding: "5px 8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            title="Switch to Grid View"
          >
            <GridIcon size={16} />
          </button>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon size={15} />}
          onClick={onAddItem}
          title="Add stored data item"
        >
          Add Stored Data
        </Button>
      </div>
    </div>
  );
};
