import React from 'react';
import { StoredItem } from '../../types';
import { Badge } from '../common/Badge';
import { formatMB } from '../../utils/storage';
import { formatDateOnly } from '../../utils/date';
import { EditIcon, TrashIcon, ExternalLinkIcon } from '../common/Icons';

interface ItemListProps {
  items: StoredItem[];
  highlightedItemId: string | null;
  onEdit: (item: StoredItem) => void;
  onDelete: (id: string) => void;
  onPreviewImage: (url: string) => void;
}

export const ItemList: React.FC<ItemListProps> = ({
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
          padding: '48px 16px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        }}
      >
        NO STORED DATA ITEMS IN THIS ACCOUNT
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', flex: 1 }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '48px' }}>Preview</th>
            <th>File Name</th>
            <th style={{ width: '90px' }}>Type</th>
            <th style={{ width: '100px' }}>Size</th>
            <th style={{ width: '110px' }}>Updated</th>
            <th>External Links</th>
            <th>Note</th>
            <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isHighlighted = highlightedItemId === item.id;
            return (
              <tr
                key={item.id}
                style={{
                  background: isHighlighted ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  transition: 'background 0.3s ease',
                }}
              >
                {/* Thumbnail Preview */}
                <td>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.fileName}
                      onClick={() => onPreviewImage(item.imageUrl!)}
                      style={{
                        width: '36px',
                        height: '36px',
                        objectFit: 'cover',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'block',
                      }}
                      onError={(e) => {
                        // Fallback on image error
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {item.fileType?.toUpperCase() || 'FILE'}
                    </div>
                  )}
                </td>

                {/* File Name */}
                <td>
                  <span
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {item.fileName}
                  </span>
                </td>

                {/* File Type */}
                <td>
                  <Badge variant="default">{item.fileType || 'mp4'}</Badge>
                </td>

                {/* File Size */}
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  {formatMB(item.fileSizeMB)}
                </td>

                {/* Updated Date */}
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {formatDateOnly(item.updatedDate)}
                </td>

                {/* External Links */}
                <td>
                  {item.externalLinks && item.externalLinks.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {item.externalLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-secondary)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            padding: '2px 6px',
                            textDecoration: 'none',
                          }}
                        >
                          <span>Link {idx + 1}</span>
                          <ExternalLinkIcon size={10} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>-</span>
                  )}
                </td>

                {/* Note */}
                <td style={{ maxWidth: '240px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {item.note ? (
                    <span title={item.note} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.note}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  )}
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '4px' }}>
                    <button
                      onClick={() => onEdit(item)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        padding: '3px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                      }}
                      title="Edit Item"
                    >
                      <EditIcon size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete stored item "${item.fileName}"?`)) {
                          onDelete(item.id);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--accent-danger)',
                        padding: '3px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                      }}
                      title="Delete Item"
                    >
                      <TrashIcon size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
