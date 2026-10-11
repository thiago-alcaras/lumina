
import React from 'react';
import { COLORS } from '../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl disabled:opacity-50";
  
  const variants = {
    primary: "bg-lumina-900 text-white hover:bg-lumina-800 shadow-md hover:shadow-lg active:scale-95",
    secondary: "bg-accent-rose text-lumina-900 hover:bg-red-100",
    outline: "border-2 border-lumina-200 text-lumina-900 hover:bg-lumina-100",
    ghost: "text-lumina-600 hover:bg-lumina-100 hover:text-lumina-900",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`${COLORS.card} p-6 ${className}`}>
    {children}
  </div>
);

export const Typography: React.FC<{ 
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small'; 
  children: React.ReactNode;
  className?: string;
}> = ({ variant = 'body', children, className = '' }) => {
  const styles = {
    h1: "text-4xl font-serif font-bold text-lumina-900 tracking-tight",
    h2: "text-2xl font-serif font-semibold text-lumina-900",
    h3: "text-xl font-sans font-semibold text-lumina-800",
    body: "text-base font-sans text-lumina-600 leading-relaxed",
    small: "text-sm font-sans text-lumina-500",
  };
  return <p className={`${styles[variant]} ${className}`}>{children}</p>;
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className="w-full px-4 py-3 bg-lumina-50 border border-lumina-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lumina-200 focus:border-lumina-300 transition-all text-lumina-900"
  />
);
