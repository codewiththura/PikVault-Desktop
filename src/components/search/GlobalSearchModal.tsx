import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatMB } from '../../utils/storage';
import { formatDateOnly } from '../../utils/date';
import { SearchIcon, ChevronRightIcon } from '../common/Icons';

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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  return (
    <Modal
      isOpen={isGlobalSearchOpen}
      onClose={() => setIsGlobalSearchOpen(false)}
      title="Global Cross-Account Data Search"
      maxWidth="700px"
    >
      {/* Search Input */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)', display: 'flex' }}>
          <SearchIcon size={16} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={globalSearchQuery}
          onChange={(e) => performGlobalSearch(e.target.value)}
          placeholder="Search file name or note across ALL accounts..."
          className="form-input"
          style={{ paddingLeft: '34px', fontSize: '13px', paddingRight: '10px' }}
        />
      </div>

      {/* Results Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          marginBottom: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '4px',
        }}
      >
        <span>
          {globalSearchQuery
            ? `FOUND ${globalSearchResults.length} RESULTS ACROSS ACCOUNTS`
            : 'TYPE TO SEARCH ACROSS ALL ACCOUNTS'}
        </span>
        <span>HOTKEY: CTRL+K</span>
      </div>

      {/* Results List */}
      <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {globalSearchResults.length === 0 && globalSearchQuery.trim() && (
          <div
            style={{
              padding: '36px 0',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
            }}
          >
            NO MATCHING STORED DATA FOUND IN ANY ACCOUNT
          </div>
        )}

        {globalSearchResults.map((result) => {
          const { item, account } = result;
          return (
            <div
              key={item.id}
              onClick={() => jumpToItem(account.id, item.id)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '10px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'border-color var(--transition-fast)',
              }}
              className="search-result-row"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {item.fileName}
                  </span>
                  <Badge variant="white">{item.fileType || 'mp4'}</Badge>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {formatMB(item.fileSizeMB)}
                  </span>
                </div>

                {/* Account Owner Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>STORED IN ACCOUNT:</span>
                  <span style={{ color: 'var(--accent-white)', fontWeight: 600, background: 'var(--bg-secondary)', padding: '1px 6px', border: '1px solid var(--border-subtle)' }}>
                    {account.username}
                  </span>
                  {item.updatedDate && (
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({formatDateOnly(item.updatedDate)})
                    </span>
                  )}
                </div>

                {item.note && (
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>
                    Note: {item.note}
                  </span>
                )}
              </div>

              {/* Jump Action */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  paddingLeft: '12px',
                  whiteSpace: 'nowrap',
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
