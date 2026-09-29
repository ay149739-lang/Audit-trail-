import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ showText = true }) => {
  return (
    <Link
      to="/"
      aria-label="AuditTrail Home"
      className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E56B2F] dark:focus-visible:ring-[#E5A93C] rounded-md"
    >
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center">
            <span
              className="font-bold text-[15px] tracking-[-0.01em] font-sans leading-none
                         bg-gradient-to-r from-[#1C1C1E] to-[#C2501F]
                         dark:from-[#F0EFE8] dark:to-[#E5A93C]
                         bg-clip-text text-transparent
                         transition-all duration-300
                         group-hover:from-[#111111] group-hover:to-[#E56B2F]
                         dark:group-hover:from-[#FFFFFF] dark:group-hover:to-[#F0B93D]"
            >
              Audit<span className="font-extrabold">Trail</span>
            </span>
          </div>

          <p className="text-[11px] text-[#7A7A74] dark:text-[#9E9E98] hidden sm:block font-mono leading-tight mt-0.5 tracking-wide">
            Chain-of-Custody &amp; Fleet Ledger
          </p>
        </div>
      )}
    </Link>
  );
};
