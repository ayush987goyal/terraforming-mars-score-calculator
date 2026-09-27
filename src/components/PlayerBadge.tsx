import React from 'react';

interface PlayerBadgeProps {
  color: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode;
}

export const isCharcoalOrDark = (color: string): boolean => {
  if (!color) return false;
  const c = color.toLowerCase();
  return c === '#34495e' || c === '#1a1a1a' || c === '#000000' || c === '#2c3e50' || c === '#333333' || c === '#111827';
};

export const PlayerBadge: React.FC<PlayerBadgeProps> = ({
  color,
  size = 'md',
  className = '',
  children
}) => {
  const isDark = isCharcoalOrDark(color);

  const sizeClasses = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-9 h-9'
  }[size];

  // High-contrast dual silver/white halo ring for black/charcoal to pop in dim tabletop lighting
  const haloClasses = isDark
    ? 'ring-2 ring-slate-200 ring-offset-2 ring-offset-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.4)]'
    : 'border border-white/40 shadow-sm';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full flex-shrink-0 transition-transform ${sizeClasses} ${haloClasses} ${className}`}
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
};
