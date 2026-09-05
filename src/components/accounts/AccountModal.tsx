import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Account } from '../../types';
import { EyeIcon, EyeOffIcon } from '../common/Icons';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    username: string;
    password: string;
    lastLogin: string;
    maxStorageGB: number;
  }) => Promise<void>;
  accountToEdit?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accountToEdit,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lastLogin, setLastLogin] = useState('');
  const [maxStorageGB, setMaxStorageGB] = useState(6);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accountToEdit) {
      setUsername(accountToEdit.username);
      setPassword(accountToEdit.password);
      // Format ISO to local input format YYYY-MM-DDTHH:mm
      try {
        const d = new Date(accountToEdit.lastLogin);
        setLastLogin(d.toISOString().slice(0, 16));
      } catch {
        setLastLogin(new Date().toISOString().slice(0, 16));
      }
      setMaxStorageGB(accountToEdit.maxStorageGB || 6);
    } else {
      setUsername('');
      setPassword('');
      setLastLogin(new Date().toISOString().slice(0, 16));
      setMaxStorageGB(6);
    }
    setError('');
    setShowPassword(false);
  }, [accountToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username / Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        id: accountToEdit ? accountToEdit.id : undefined,
        username: username.trim(),
        password: password.trim(),
        lastLogin: new Date(lastLogin).toISOString(),
        maxStorageGB: Number(maxStorageGB) || 6,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let res = '';
    for (let i = 0; i < 14; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setShowPassword(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? 'Edit Account Record' : 'Create New Account Record'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : accountToEdit ? 'Update Account' : 'Create Account'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Username / Email *"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="user@example.com"
          autoFocus
          required
        />

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Password *</label>
            <button
              type="button"
              onClick={generatePassword}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Auto-generate
            </button>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Account password"
              className="form-input"
              style={{ paddingRight: '36px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Last Login</label>
          <input
            type="datetime-local"
            value={lastLogin}
            onChange={(e) => setLastLogin(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Max Storage (GB)</label>
          <input
            type="number"
            value={maxStorageGB}
            onChange={(e) => setMaxStorageGB(Number(e.target.value))}
            className="form-input"
            step="0.1"
            min="1"
            required
          />
          <span className="form-hint">Default is 6 GB per account. Stored items size is tracked against this limit.</span>
        </div>

        {error && (
          <div style={{ color: 'var(--accent-danger)', marginTop: '8px' }}>
            {error}
          </div>
        )}
      </form>
    </Modal>

  );
};
