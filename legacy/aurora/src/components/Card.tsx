import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white shadow-sm border border-[#f2e8e5] rounded-2xl
        ${paddings[padding]}
        ${hover ? 'hover:border-[#e0cec7] hover:shadow-md transition-all cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
