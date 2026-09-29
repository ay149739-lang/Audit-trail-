import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  ariaLabel?: string;
  title?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  type = 'button',
  className = '',
  ariaLabel,
  title,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      className={`inline-flex items-center justify-center gap-1.5 h-9 px-3.5 py-2 rounded-md text-xs font-semibold font-sans transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none active:scale-[0.98] ${disabled
          ? 'bg-[#DDDCD6] dark:bg-[#333333] text-[#7A7A75] dark:text-[#70706A] cursor-not-allowed shadow-none'
          : 'bg-[#E56B2F] hover:bg-[#D45A1E] dark:bg-[#E5A93C] dark:hover:bg-[#D49A2A] text-white dark:text-[#141414]'
        } ${className}`}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
};
