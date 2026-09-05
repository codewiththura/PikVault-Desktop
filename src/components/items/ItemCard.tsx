import React from "react";
import { StoredItem } from "../../types";
import { Badge } from "../common/Badge";
import { formatMB } from "../../utils/storage";
import { formatDateOnly } from "../../utils/date";
import { EditIcon, TrashIcon, ExternalLinkIcon } from "../common/Icons";

interface ItemCardProps {
  item: StoredItem;
  isHighlighted: boolean;
  onEdit: (item: StoredItem) => void;
  onDelete: (id: string) => void;
  onPreviewImage: (url: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isHighlighted,
  onEdit,
  onDelete,
  onPreviewImage,
}) => {
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: isHighlighted
          ? "2px solid var(--accent-white)"
          : "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "border-color var(--transition-fast)",
        overflow: "hidden",
      }}
      className="item-card"
    >
      {/* Thumbnail Header */}
      {item.imageUrl ? (
        <div
          style={{
            height: "140px",
            width: "100%",
            overflow: "hidden",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-primary)",
            cursor: "pointer",
          }}
          onClick={() => onPreviewImage(item.imageUrl!)}
        >
          <img
            src={item.imageUrl}
            alt={item.fileName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <div
          style={{
            height: "60px",
            width: "100%",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
          }}
        >
          {item.fileType || "File"}
        </div>
      )}

      {/* Card Content */}
      <div
        style={{
          padding: "12px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontWeight: 700,
            color: "var(--text-primary)",
            wordBreak: "break-all",
            lineHeight: 1.4,
          }}
          title={item.fileName}
        >
          {item.fileName}
        </div>

        {/* Badges: Type & Size */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Badge variant="white">{item.fileType || "mp4"}</Badge>
          <Badge variant="default">{formatMB(item.fileSizeMB)}</Badge>
          {item.updatedDate && (
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "var(--font-size-xs)",
              }}
            >
              {formatDateOnly(item.updatedDate)}
            </span>
          )}
        </div>

        {/* Note */}
        {item.note && (
          <p
            style={{
              color: "var(--text-secondary)",
              lineHeight: 1.4,
              flex: 1,
              marginTop: "4px",
            }}
          >
            {item.note}
          </p>
        )}

        {/* External Links */}
        {item.externalLinks && item.externalLinks.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              marginTop: "auto",
              paddingTop: "6px",
            }}
          >
            {item.externalLinks.map((link, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "var(--text-primary)",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-xs)",
                  padding: "2px 6px",
                  textDecoration: "none",
                }}
              >
                <span>Link {idx + 1}</span>
                <ExternalLinkIcon size={15} />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div
        style={{
          padding: "8px 12px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-primary)",
          display: "flex",
          justifyContent: "flex-end",
          gap: "6px",
        }}
      >
        <button
          onClick={() => onEdit(item)}
          style={{
            background: "transparent",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xs)",
            color: "var(--text-secondary)",
            padding: "3px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <EditIcon size={15} />
          <span>Edit</span>
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete stored item "${item.fileName}"?`)) {
              onDelete(item.id);
            }
          }}
          style={{
            background: "transparent",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xs)",
            color: "var(--accent-danger)",
            padding: "3px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <TrashIcon size={15} />
        </button>
      </div>
    </div>
  );
};
