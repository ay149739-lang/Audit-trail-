import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface SecondaryButtonProps {
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

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
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
      className={`inline-flex items-center justify-center gap-1.5 h-9 px-3.5 py-2 rounded-md text-xs font-medium font-sans transition-all border border-[#DDDCD6] dark:border-[#333333] bg-white dark:bg-[#1F1F1F] hover:bg-[#FAF9F5] dark:hover:bg-[#262626] text-[#252525] dark:text-[#F5F5F0] hover:border-[#B8B7B0] dark:hover:border-[#444444] shadow-xs focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none active:scale-[0.98] ${disabled ? 'opacity-50 cursor-not-allowed shadow-none' : ''
        } ${className}`}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-3.5 h-3.5 shrink-0 text-[#6B6B66] dark:text-[#9E9E98]" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-3.5 h-3.5 shrink-0 text-[#6B6B66] dark:text-[#9E9E98]" />}
    </button>
  );
};
