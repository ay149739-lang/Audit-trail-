import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ showText = true }) => {
  return (
    <Link
      to="/"
      aria-label="Audit Trail Home"
      className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] rounded-md transition-opacity"
    >
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#252525] dark:text-[#F5F5F0] text-base tracking-tight font-sans">
              AUDIT<span className="text-[#E56B2F] dark:text-[#E5A93C]">TRAIL</span>
            </span>
            <span className="bg-[#E56B2F]/15 dark:bg-[#E5A93C]/15 text-[#E56B2F] dark:text-[#E5A93C] text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border border-[#E56B2F]/30 dark:border-[#E5A93C]/30 tracking-wider">
              CQRS v2.0
            </span>
          </div>
          <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] hidden sm:block font-mono">
            Immutable Logistics Event Store
          </p>
        </div>
      )}
    </Link>
  );
};
