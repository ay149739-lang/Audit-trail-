import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 26, showText = true }) => {
  return (
    <div className="flex items-center gap-3 group">
      {/* High-Tech Kinetic Ledger Icon */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[#4d8eff]/20 rounded-md blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative bg-[#0d1c2d] border border-[#273647] p-2 rounded-md shadow-md flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#4d8eff] transform group-hover:scale-105 transition-transform"
          >
            {/* Hexagon Ledger Shield */}
            <path
              d="M16 3L27.25 9.5V22.5L16 29L4.75 22.5V9.5L16 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Immutable Chain Core */}
            <path
              d="M16 8V24"
              stroke="#adc6ff"
              strokeWidth="2"
              strokeLinecap="round"
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
            <circle cx="16" cy="16" r="3" fill="#4d8eff" className="animate-pulse" />
          </svg>
        </div>
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#d4e4fa] text-base tracking-tight font-sans">
              AUDIT<span className="text-[#4d8eff]">TRAIL</span>
            </span>
            <span className="bg-[#4d8eff]/15 text-[#adc6ff] text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold border border-[#4d8eff]/30 tracking-wider">
              CQRS v2.0
            </span>
          </div>
          <p className="text-[11px] text-[#8c909f] hidden sm:block font-mono">
            Immutable Logistics Event Store
          </p>
        </div>
      )}
    </div>
  );
};
