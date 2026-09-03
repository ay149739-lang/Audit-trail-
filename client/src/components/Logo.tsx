import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 28, showText = true }) => {
  return (
    <div className="flex items-center gap-3 group">
      {/* High-Tech Logistics Hexagon Event-Store Logo Icon */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-cyan-400 rounded-xl blur-sm opacity-40 group-hover:opacity-70 transition-opacity"></div>
        <div className="relative bg-slate-900 border border-teal-500/40 p-2 rounded-xl shadow-lg flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-teal-400 transform group-hover:scale-105 transition-transform"
          >
            {/* Outer Hexagon Shield */}
            <path
              d="M16 3L27.25 9.5V22.5L16 29L4.75 22.5V9.5L16 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              className="opacity-90"
            />
            {/* Inner Immutable Ledger Chains */}
            <path
              d="M16 9V23"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-cyan-300"
            />
            <path
              d="M10 12.5L22 19.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M22 12.5L10 19.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Event Store Core Pulse */}
            <circle cx="16" cy="16" r="3.5" fill="#14b8a6" className="animate-pulse" />
          </svg>
        </div>
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-100 text-lg tracking-tight font-sans">
              AUDIT<span className="text-teal-400">TRAIL</span>
            </span>
            <span className="bg-teal-500/15 text-teal-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-teal-500/30 uppercase tracking-wider">
              CQRS v2.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
            Immutable Logistics Ledger
          </p>
        </div>
      )}
    </div>
  );
};
