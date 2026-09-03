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
    <div className="fixed inset-0 z-50 bg-[#051424]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d1c2d] border border-[#273647] rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="bg-[#010f1f] px-6 py-3.5 border-b border-[#1c2b3c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#4d8eff]" />
            <h3 className="font-bold text-[#d4e4fa] text-sm font-sans">JSON Event Payload Inspector</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8c909f] hover:text-[#d4e4fa] hover:bg-[#1c2b3c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="bg-[#010f1f] p-2.5 rounded border border-[#1c2b3c]">
              <div className="text-[#8c909f] text-[10px] uppercase mb-0.5">Aggregate ID</div>
              <div className="font-bold text-[#adc6ff] truncate">{event.aggregateId}</div>
            </div>

            <div className="bg-[#010f1f] p-2.5 rounded border border-[#1c2b3c]">
              <div className="text-[#8c909f] text-[10px] uppercase mb-0.5">Event Type</div>
              <div className="font-bold text-[#d4e4fa] truncate">{event.eventType}</div>
            </div>

            <div className="bg-[#010f1f] p-2.5 rounded border border-[#1c2b3c]">
              <div className="text-[#8c909f] text-[10px] uppercase mb-0.5">Stream Version</div>
              <div className="font-bold text-amber-400">v{event.version}</div>
            </div>

            <div className="bg-[#010f1f] p-2.5 rounded border border-[#1c2b3c]">
              <div className="text-[#8c909f] text-[10px] uppercase mb-0.5">Store Guarantee</div>
              <div className="flex items-center gap-1 font-semibold text-[#10b981]">
                <Lock className="w-3 h-3" />
                <span>Immutable</span>
              </div>
            </div>
          </div>

          {/* Timestamp Info */}
          <div className="flex items-center gap-2 text-xs text-[#8c909f] font-mono bg-[#010f1f] p-2.5 rounded border border-[#1c2b3c]">
            <Clock className="w-4 h-4 text-[#8c909f]" />
            <span>Persisted Timestamp:</span>
            <span className="text-[#d4e4fa]">{new Date(event.timestamp).toISOString()}</span>
          </div>

          {/* Code Block Inspector (Stitch JetBrains Mono Spec) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#8c909f] uppercase tracking-wider">
                Raw Event Payload (JSON)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-[#4d8eff] hover:underline font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="bg-[#010f1f] p-4 rounded border border-[#1c2b3c] font-mono text-xs text-[#adc6ff] overflow-x-auto leading-relaxed max-h-72">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#010f1f] px-6 py-3 border-t border-[#1c2b3c] flex items-center justify-between text-xs font-mono text-[#8c909f]">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Database className="w-3.5 h-3.5 text-[#8c909f]" />
            <span>MongoDB Collection: events</span>
          </div>
          <button
            onClick={onClose}
            className="bg-[#1c2b3c] hover:bg-[#273647] text-[#d4e4fa] px-3.5 py-1.5 rounded text-xs transition-colors font-mono"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
