import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { SunIcon, MoonIcon, CheckIcon } from '../common/Icons';
import { FontSizeSetting } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FONT_SIZE_OPTIONS: { id: FontSizeSetting; label: string; px: string }[] = [
  { id: 'small', label: 'Small', px: '11px' },
  { id: 'medium', label: 'Medium (Default)', px: '13px' },
  { id: 'large', label: 'Large', px: '15px' },
  { id: 'xlarge', label: 'X-Large', px: '17px' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, fontSize, setFontSize } = useApp();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Settings"
      maxWidth="500px"
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 1. Theme Selection */}
        <div>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
            APPEARANCE THEME
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => setTheme('dark')}
              style={{
                padding: '12px',
                background: theme === 'dark' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                border: theme === 'dark' ? '2px solid var(--accent-white)' : '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MoonIcon size={16} />
                <span>DARK MODE</span>
              </div>
              {theme === 'dark' && <CheckIcon size={14} />}
            </button>

            <button
              onClick={() => setTheme('light')}
              style={{
                padding: '12px',
                background: theme === 'light' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                border: theme === 'light' ? '2px solid var(--accent-white)' : '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SunIcon size={16} />
                <span>LIGHT MODE</span>
              </div>
              {theme === 'light' && <CheckIcon size={14} />}
            </button>
          </div>
        </div>

        {/* 2. Font Size Adjustment */}
        <div>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
            TYPOGRAPHY FONT SIZE
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {FONT_SIZE_OPTIONS.map((opt) => {
              const isSelected = fontSize === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setFontSize(opt.id)}
                  style={{
                    padding: '10px 12px',
                    background: isSelected ? 'var(--accent-white)' : 'var(--bg-primary)',
                    color: isSelected ? 'var(--accent-black)' : 'var(--text-primary)',
                    border: '1px solid var(--border-strong)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                  }}
                >
                  <span>{opt.label}</span>
                  <span style={{ opacity: 0.8 }}>{opt.px}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Preview Box */}
        <div
          style={{
            padding: '12px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <span className="form-label" style={{ fontSize: '10px' }}>LIVE PREVIEW</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700 }}>Account & Storage Catalog</span>
            <Badge variant="white">MP4</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            This text demonstrates the selected theme and base font size ({fontSize}).
          </p>
        </div>
      </div>
    </Modal>
  );
};
