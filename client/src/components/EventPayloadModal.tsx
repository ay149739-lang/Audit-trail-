import React, { useState } from 'react';
import { X, Code2, Lock, Clock, Copy, Check, Database } from 'lucide-react';
import { IEvent } from '../types';

interface EventPayloadModalProps {
  event: IEvent | null;
  onClose: () => void;
}

export const EventPayloadModal: React.FC<EventPayloadModalProps> = ({ event, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1F1F1F] border border-[#DDDCD6] dark:border-[#333333] rounded-md w-full max-w-2xl overflow-hidden shadow-xl animate-fadeIn font-sans">
        {/* Header */}
        <div className="bg-[#FAF9F5] dark:bg-[#141414] px-6 py-4 border-b border-[#DDDCD6] dark:border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#E56B2F] dark:text-[#E5A93C]" />
            <h3 className="font-bold text-[#252525] dark:text-[#F5F5F0] text-base">Immutable Event Payload Inspector</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B6B66] dark:text-[#9E9E98] hover:text-[#252525] dark:hover:text-[#F5F5F0] hover:bg-[#DDDCD6]/40 dark:hover:bg-[#333333]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3 rounded-md border border-[#DDDCD6] dark:border-[#333333]">
              <div className="text-[#6B6B66] dark:text-[#9E9E98] mb-1">Aggregate ID</div>
              <div className="font-bold text-[#E56B2F] dark:text-[#E5A93C] truncate">{event.aggregateId}</div>
            </div>

            <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3 rounded-md border border-[#DDDCD6] dark:border-[#333333]">
              <div className="text-[#6B6B66] dark:text-[#9E9E98] mb-1">Event Type</div>
              <div className="font-bold text-[#252525] dark:text-[#F5F5F0] truncate">{event.eventType}</div>
            </div>

            <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3 rounded-md border border-[#DDDCD6] dark:border-[#333333]">
              <div className="text-[#6B6B66] dark:text-[#9E9E98] mb-1">Stream Version</div>
              <div className="font-bold text-[#D9A441] dark:text-[#E5A93C]">v{event.version}</div>
            </div>

            <div className="bg-[#FAF9F5] dark:bg-[#141414] p-3 rounded-md border border-[#DDDCD6] dark:border-[#333333]">
              <div className="text-[#6B6B66] dark:text-[#9E9E98] mb-1">Store Immutability</div>
              <div className="flex items-center gap-1 font-semibold text-[#3F8F6B] dark:text-[#3A8B88]">
                <Lock className="w-3 h-3" />
                <span>Append-Only</span>
              </div>
            </div>
          </div>

          {/* Timestamp Info */}
          <div className="flex items-center gap-2 text-xs text-[#6B6B66] dark:text-[#9E9E98] font-mono bg-[#FAF9F5] dark:bg-[#141414] p-2.5 rounded-md border border-[#DDDCD6] dark:border-[#333333]">
            <Clock className="w-4 h-4 text-[#6B6B66] dark:text-[#9E9E98]" />
            <span>Persisted Timestamp:</span>
            <span className="text-[#252525] dark:text-[#F5F5F0] font-semibold">{new Date(event.timestamp).toISOString()}</span>
          </div>

          {/* JSON Tree View */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98] uppercase tracking-wide">
                Raw Event Payload (JSON)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-[#E56B2F] dark:text-[#E5A93C] hover:underline font-mono font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="bg-[#141414] dark:bg-[#141414] p-4 rounded-md border border-[#333333] font-mono text-xs text-[#F5F5F0] overflow-x-auto leading-relaxed max-h-72">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF9F5] dark:bg-[#141414] px-6 py-3 border-t border-[#DDDCD6] dark:border-[#333333] flex items-center justify-between text-xs font-mono text-[#6B6B66] dark:text-[#9E9E98]">
          <div className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-[#6B6B66] dark:text-[#9E9E98]" />
            <span>MongoDB Collection: events</span>
          </div>
          <button
            onClick={onClose}
            className="bg-[#252525] hover:bg-[#333333] dark:bg-[#E5A93C] dark:hover:bg-[#D49A2A] text-white dark:text-[#141414] px-4 py-1.5 rounded-md text-xs font-bold transition-colors font-sans"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
