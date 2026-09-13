import React, { useState } from 'react';

interface TechTermProps {
  term: string;
  definition: string;
  className?: string;
  children?: React.ReactNode;
}

export const TechTerm: React.FC<TechTermProps> = ({
  term,
  definition,
  className = '',
  children,
}) => {
  const [show, setShow] = useState(false);

  return (
    <span
      className={`relative inline-flex items-center cursor-help border-b border-dotted border-[#6B6B66]/60 dark:border-[#9E9E98]/60 hover:border-[#E56B2F] dark:hover:border-[#E5A93C] transition-colors ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      aria-label={`${term}: ${definition}`}
    >
      {children || term}
      {show && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-[#252525] dark:bg-[#141414] text-[#F5F5F0] text-[11px] font-mono rounded-md border border-[#444] dark:border-[#333333] shadow-lg z-50 pointer-events-none leading-relaxed animate-fadeIn text-left"
        >
          <span className="font-bold text-[#E56B2F] dark:text-[#E5A93C] block mb-0.5">
            {term}
          </span>
          <span className="text-[#DDDCD6] dark:text-[#CCCCCC]">{definition}</span>
        </span>
      )}
    </span>
  );
};
