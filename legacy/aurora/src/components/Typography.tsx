import React from 'react';

export interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small';
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  children,
  className = '',
  as,
}) => {
  const styles = {
    h1: 'text-4xl md:text-5xl font-serif font-bold text-[#43302b] tracking-tight',
    h2: 'text-2xl md:text-3xl font-serif font-semibold text-[#43302b]',
    h3: 'text-xl md:text-2xl font-sans font-semibold text-[#846358]',
    body: 'text-base font-sans text-[#a18072] leading-relaxed',
    small: 'text-sm font-sans text-[#bfa094]',
  };

  const Tag = as || (variant.startsWith('h') ? variant : 'p');

  return (
    <Tag className={`${styles[variant]} ${className}`}>
      {children}
    </Tag>
  );
};
