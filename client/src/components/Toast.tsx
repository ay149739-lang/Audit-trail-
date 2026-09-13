import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333] rounded-md px-4 py-3 shadow-lg font-mono text-xs text-[#252525] dark:text-[#F5F5F0] animate-fadeIn border-l-4 border-l-[#3F8F6B] dark:border-l-[#3A8B88] max-w-md"
    >
      <CheckCircle2 className="w-4 h-4 text-[#3F8F6B] dark:text-[#3A8B88] shrink-0" />
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="p-1 rounded text-[#6B6B66] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0] transition-colors focus-visible:ring-1 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] focus:outline-none"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
