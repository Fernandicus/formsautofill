import React from 'react';
import { cn } from '@/app/shared/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-md hover:shadow-lg focus:ring-primary",
    secondary: "bg-secondary hover:bg-secondary-hover text-secondary-text focus:ring-slate-400",
    danger: "bg-danger-light hover:bg-danger/10 text-danger focus:ring-danger",
    warning: "bg-warning hover:bg-warning-hover text-white shadow-sm shadow-warning-light focus:ring-warning",
    ghost: "bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground",
    outline: "border border-border bg-white hover:bg-secondary text-muted-foreground focus:ring-slate-400"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
    icon: "p-2"
  };

  // Build class string using cn utility
  const buttonClass = cn(baseStyles, variants[variant], sizes[size], className);

  return (
    <button className={buttonClass} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
