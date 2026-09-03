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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#DDDCD6] rounded-md w-full max-w-2xl overflow-hidden shadow-xl animate-fadeIn">
        {/* Header */}
        <div className="bg-[#FAF9F5] px-6 py-4 border-b border-[#DDDCD6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#E56B2F]" />
            <h3 className="font-bold text-[#252525] text-base">Immutable Event Payload Inspector</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B6B66] hover:text-[#252525] hover:bg-[#DDDCD6]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-[#FAF9F5] p-3 rounded-md border border-[#DDDCD6]">
              <div className="text-[#6B6B66] mb-1">Aggregate ID</div>
              <div className="font-bold text-[#E56B2F] truncate">{event.aggregateId}</div>
            </div>

            <div className="bg-[#FAF9F5] p-3 rounded-md border border-[#DDDCD6]">
              <div className="text-[#6B6B66] mb-1">Event Type</div>
              <div className="font-bold text-[#252525] truncate">{event.eventType}</div>
            </div>

            <div className="bg-[#FAF9F5] p-3 rounded-md border border-[#DDDCD6]">
              <div className="text-[#6B6B66] mb-1">Stream Version</div>
              <div className="font-bold text-[#D9A441]">v{event.version}</div>
            </div>

            <div className="bg-[#FAF9F5] p-3 rounded-md border border-[#DDDCD6]">
              <div className="text-[#6B6B66] mb-1">Store Immutability</div>
              <div className="flex items-center gap-1 font-semibold text-[#3F8F6B]">
                <Lock className="w-3 h-3" />
                <span>Append-Only</span>
              </div>
            </div>
          </div>

          {/* Timestamp Info */}
          <div className="flex items-center gap-2 text-xs text-[#6B6B66] font-mono bg-[#FAF9F5] p-2.5 rounded-md border border-[#DDDCD6]">
            <Clock className="w-4 h-4 text-[#6B6B66]" />
            <span>Persisted Timestamp:</span>
            <span className="text-[#252525] font-semibold">{new Date(event.timestamp).toISOString()}</span>
          </div>

          {/* JSON Tree View */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#6B6B66] uppercase tracking-wide">
                Raw Event Payload (JSON)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-[#E56B2F] hover:underline font-mono font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="bg-[#252525] p-4 rounded-md border border-[#252525] font-mono text-xs text-[#FAF9F5] overflow-x-auto leading-relaxed max-h-72">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF9F5] px-6 py-3 border-t border-[#DDDCD6] flex items-center justify-between text-xs font-mono text-[#6B6B66]">
          <div className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-[#6B6B66]" />
            <span>MongoDB Collection: events</span>
          </div>
          <button
            onClick={onClose}
            className="bg-[#252525] hover:bg-[#333333] text-white px-4 py-1.5 rounded-md text-xs transition-colors font-sans"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
