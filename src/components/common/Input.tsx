import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <span style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)', display: 'flex' }}>
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`form-input ${error ? 'border-danger' : ''} ${className}`}
          style={{
            paddingLeft: leftIcon ? '32px' : '10px',
            paddingRight: rightIcon ? '32px' : '10px',
          }}
          {...props}
        />
        {rightIcon && (
          <span style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)', display: 'flex' }}>
            {rightIcon}
          </span>
        )}
      </div>
      {error && <span style={{ color: 'var(--accent-danger)' }}>{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
};

