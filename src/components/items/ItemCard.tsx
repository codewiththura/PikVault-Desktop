import React from "react";
import { StoredItem } from "../../types";
import { Badge } from "../common/Badge";
import { formatMB } from "../../utils/storage";
import { formatDateOnly } from "../../utils/date";
import { EditIcon, TrashIcon, ExternalLinkIcon, CopyIcon } from "../common/Icons";

interface ItemCardProps {
  item: StoredItem;
  isHighlighted: boolean;
  onEdit: (item: StoredItem) => void;
  onDelete: (item: StoredItem) => void;
  onCopy?: (item: StoredItem) => void;
  onPreviewImage: (url: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isHighlighted,
  onEdit,
  onDelete,
  onCopy,
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
        boxSizing: "border-box",
      }}
      className="item-card"
    >
      {/* Thumbnail Header */}
      {item.imageUrl ? (
        <div
          style={{
            height: "200px",
            width: "100%",
            overflow: "hidden",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-primary)",
            cursor: "pointer",
            flexShrink: 0,
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
            height: "200px",
            width: "100%",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: "var(--font-size-md)",
            textTransform: "uppercase",
            flexShrink: 0,
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
          minHeight: 0,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
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
            flexShrink: 0,
          }}
        >
          <Badge variant="white">{item.fileType || "mp4"}</Badge>
          <Badge variant="default">{formatMB(item.fileSizeMB)}</Badge>
          {item.updatedDate && (
            <span
              style={{
                color: "var(--text-muted)",
              }}
            >
              {formatDateOnly(item.updatedDate)}
            </span>
          )}
        </div>

        {/* Note */}
        {item.note ? (
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--font-size-xs)",
              lineHeight: 1.4,
              flex: 1,
              marginTop: "2px",
              marginBottom: 0,
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
            title={item.note}
          >
            {item.note}
          </p>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {/* External Links */}
        {item.externalLinks && item.externalLinks.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              flexShrink: 0,
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
                  fontSize: "var(--font-size-xs)",
                  textDecoration: "none",
                }}
              >
                <span>Link {idx + 1}</span>
                <ExternalLinkIcon size={12} />
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
          flexShrink: 0,
        }}
      >
        {onCopy && (
          <button
            onClick={() => onCopy(item)}
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
            title="Copy to another account"
          >
            <CopyIcon size={14} />
            <span>Copy</span>
          </button>
        )}
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
          onClick={() => onDelete(item)}
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
