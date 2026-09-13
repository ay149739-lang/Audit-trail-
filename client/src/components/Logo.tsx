import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 26, showText = true }) => {
  return (
    <div className="flex items-center gap-3 group">
      {/* Premium Dark / Warm Industrial Hexagon Shield Icon */}
      <div className="bg-[#252525] dark:bg-[#1F1F1F] border border-[#252525] dark:border-[#333333] p-2 rounded-md shadow-sm flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#E56B2F] dark:text-[#E5A93C]"
        >
          <path
            d="M16 3L27.25 9.5V22.5L16 29L4.75 22.5V9.5L16 3Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M16 8V24"
            stroke="#F4F3EF"
            strokeWidth="2"
            strokeLinecap="round"
            className="dark:stroke-[#141414]"
          />
          <path
            d="M10 12L22 20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M22 12L10 20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="3" fill="currentColor" />
        </svg>
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#252525] dark:text-[#F5F5F0] text-base tracking-tight font-sans">
              AUDIT<span className="text-[#E56B2F] dark:text-[#E5A93C]">TRAIL</span>
            </span>
            <span className="bg-[#E56B2F]/15 dark:bg-[#E5A93C]/15 text-[#E56B2F] dark:text-[#E5A93C] text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold border border-[#E56B2F]/30 dark:border-[#E5A93C]/30 tracking-wider">
              CQRS v2.0
            </span>
          </div>
          <p className="text-[11px] text-[#6B6B66] dark:text-[#9E9E98] hidden sm:block font-mono">
            Immutable Logistics Event Store
          </p>
        </div>
      )}
    </div>
  );
};
