import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'white' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantClass = {
    default: '',
    white: 'badge-white',
    warning: 'badge-warning',
    danger: 'badge-danger',
  }[variant];

  const sizeClass = size === 'sm' ? 'badge-sm' : '';

  return (
    <span className={`badge ${variantClass} ${sizeClass} ${className}`.trim()}>
      {children}
    </span>
  );
};
