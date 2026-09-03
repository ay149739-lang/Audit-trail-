import React from 'react';
import { X, Code2, Lock, Clock, Tag, Database, Copy, Check } from 'lucide-react';
import { IEvent } from '../types';

interface EventPayloadModalProps {
  event: IEvent | null;
  onClose: () => void;
}

export const EventPayloadModal: React.FC<EventPayloadModalProps> = ({ event, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!event) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-slate-100 text-base">Immutable Event Payload Inspector</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-500 mb-1">Aggregate ID</div>
              <div className="font-bold text-teal-400 truncate">{event.aggregateId}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-500 mb-1">Event Type</div>
              <div className="font-bold text-slate-200 truncate">{event.eventType}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-500 mb-1">Stream Version</div>
              <div className="font-bold text-amber-400">v{event.version}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-500 mb-1">Store Immutability</div>
              <div className="flex items-center gap-1 font-semibold text-emerald-400">
                <Lock className="w-3 h-3" />
                <span>Append-Only</span>
              </div>
            </div>
          </div>

          {/* Timestamp Info */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Persisted Timestamp:</span>
            <span className="text-slate-200">{new Date(event.timestamp).toISOString()}</span>
          </div>

          {/* JSON Tree View */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                Raw Event Payload (JSON)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-teal-300/90 overflow-x-auto leading-relaxed max-h-72">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>MongoDB Collection: events</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
