import React, { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-body font-medium rounded-full';

  const variantClasses = {
    success: 'bg-semantic-success bg-opacity-20 text-semantic-success',
    error: 'bg-semantic-error bg-opacity-20 text-semantic-error',
    warning: 'bg-semantic-warning bg-opacity-20 text-semantic-warning',
    info: 'bg-brand-terracotta bg-opacity-20 text-brand-terracotta',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
