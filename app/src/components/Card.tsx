import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  variant?: 'default' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-lg border transition-all duration-200';

  const variantClasses = {
    default: 'bg-[var(--color-surface)] border-[var(--color-border)]',
    elevated: 'bg-[var(--color-surface-2)] border-[var(--color-border-strong)] shadow-md',
  };

  const hoverClass = hoverable ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
