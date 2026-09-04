import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'white' | 'warning' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantClass = {
    default: '',
    white: 'badge-white',
    warning: 'badge-warning',
    danger: 'badge-danger',
  }[variant];

  return <span className={`badge ${variantClass} ${className}`}>{children}</span>;
};
