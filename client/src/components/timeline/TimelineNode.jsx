import React, { useState } from 'react';
import { getEventMeta } from '../../lib/eventIcons';
import { Clock, Code2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export const TimelineNode = ({ event, index, totalEvents }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { eventType, payload, timestamp, version } = event;
  const meta = getEventMeta(eventType);
  const IconComponent = meta.icon;

  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      })
    : 'Unknown Date';

  const handleCopyJson = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLast = index === totalEvents - 1;

  return (
    <div
      className="relative pl-8 sm:pl-12 pb-10 transition-all group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Vertical Connecting Rail Line */}
      {!isLast && (
        <div className="absolute left-[15px] sm:left-[23px] top-10 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 group-hover:bg-teal-500/40 transition-colors" />
      )}

      {/* Node Circle Icon Badge */}
      <div
        className={`absolute left-0 sm:left-2 top-0.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 z-10 shadow-md transition-transform duration-300 group-hover:scale-110 ${
          meta.isAlert
            ? 'bg-amber-500 text-white border-amber-300 dark:border-amber-600 shadow-amber-500/30'
            : 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border-teal-500/40 shadow-teal-500/10'
        }`}
      >
        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      {/* Main Node Card */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-md ${
          meta.isAlert
            ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 dark:border-amber-500/30 hover:border-amber-500'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/40'
        }`}
      >
        {/* Card Header */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left info: Type & Version */}
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${meta.badgeBg} ${meta.text} border ${meta.border}`}
            >
              v{version}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  {meta.label}
                </h3>
                {meta.isAlert && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white animate-pulse">
                    ALERT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {meta.description}
              </p>
            </div>
          </div>

          {/* Right info: Timestamp & Expand Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-teal-500" />
              <span>{formattedDate}</span>
            </div>

            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Collapse event payload' : 'Expand event payload'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

        </div>

        {/* Collapsible Raw Payload Popover/Drawer */}
        {isExpanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-950 p-4 font-mono text-xs animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                <Code2 className="w-3.5 h-3.5" />
                <span>Event Payload (Immutable JSON)</span>
              </div>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-teal-300 overflow-x-auto p-2 bg-slate-900/80 rounded-lg leading-relaxed">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};

export default TimelineNode;
