import React from "react";
import { StoredItem } from "../../types";
import { ItemCard } from "./ItemCard";

interface ItemGridProps {
  items: StoredItem[];
  highlightedItemId: string | null;
  onEdit: (item: StoredItem) => void;
  onDelete: (id: string) => void;
  onPreviewImage: (url: string) => void;
}

export const ItemGrid: React.FC<ItemGridProps> = ({
  items,
  highlightedItemId,
  onEdit,
  onDelete,
  onPreviewImage,
}) => {
  if (items.length === 0) {
    return (
      <div
        style={{
          padding: "48px 16px",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        No stored data items in this account
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
        padding: "16px",
        overflowY: "auto",
        overflowX: "hidden",
        minHeight: 0,
        height: "100%",
        flex: 1,
        alignContent: "start",
      }}
    >
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          isHighlighted={highlightedItemId === item.id}
          onEdit={onEdit}
          onDelete={onDelete}
          onPreviewImage={onPreviewImage}
        />
      ))}
    </div>
  );
};
